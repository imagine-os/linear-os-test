/**
 * `linearComment()` (PAP-281): the single door every comment the orchestrator
 * posts goes through.
 *
 * Three jobs, in order:
 * 1. append the PAP-92 footer (`src/agents/session-footer.ts`, fenced
 *    ```paperos-session block) unless the body already ends in one;
 * 2. dedupe on `(issue_id, sha256(body))` in `comments_sent` — an identical
 *    body is skipped silently and logged (PAP-96 edge case);
 * 3. post through `rawRequestWithRetry`, which sleeps 60 s and retries on
 *    `RATELIMITED`.
 *
 * The hash is taken over the body *including* the rendered footer, so two
 * comments that differ only in the footer (a re-run with a new sessionId) are
 * both posted; that is deliberate — the dedupe exists to stop repeated
 * identical noise, not to stop a genuine second session reporting.
 */

import type { LinearClient } from "@linear/sdk";
import { renderFooter, type SessionFooter } from "../agents/session-footer.js";
import { type OrchestratorDb, sha256 } from "../db/index.js";
import { rawRequestWithRetry } from "./client.js";

const COMMENT_CREATE = /* GraphQL */ `
  mutation OrchestratorComment($issueId: String!, $body: String!) {
    commentCreate(input: { issueId: $issueId, body: $body }) {
      success
      comment { id url }
    }
  }
`;

const FOOTER_FENCE_RE = /```paperos-session[ \t]*\r?\n[\s\S]*?\r?\n```[ \t]*$/;

export interface CommentResult {
  /** False when the identical body was already sent to this issue. */
  posted: boolean;
  commentId?: string;
  /** The exact body that was (or would have been) posted. */
  body: string;
  bodySha256: string;
  reason?: "duplicate" | "dry-run";
}

export interface LinearCommentDeps {
  client: LinearClient;
  db: OrchestratorDb;
  /** When true nothing is written to Linear; the body and hash still come back. */
  dryRun?: boolean;
  /** Rate-limit retry policy; the default is the spec's five attempts, 60 s apart. */
  retry?: { maxAttempts?: number; sleepMs?: (attempt: number) => number };
  log?: (message: string) => void;
}

/** Render a body plus footer exactly as `linearComment` would, without posting. */
export function renderComment(body: string, footer?: SessionFooter): string {
  const trimmed = body.trimEnd();
  if (!footer || FOOTER_FENCE_RE.test(trimmed)) return trimmed;
  return `${trimmed}\n\n${renderFooter(footer)}`;
}

export async function linearComment(
  deps: LinearCommentDeps,
  issueId: string,
  body: string,
  footer?: SessionFooter,
): Promise<CommentResult> {
  const rendered = renderComment(body, footer);
  const hash = sha256(rendered);

  if (deps.db.wasCommentSent(issueId, hash)) {
    deps.log?.(`linearComment: skipped duplicate on ${issueId} (sha256 ${hash.slice(0, 12)})`);
    return { posted: false, body: rendered, bodySha256: hash, reason: "duplicate" };
  }

  if (deps.dryRun) {
    deps.log?.(`linearComment: dry run, would post to ${issueId}`);
    return { posted: false, body: rendered, bodySha256: hash, reason: "dry-run" };
  }

  // Claim the hash before the network call so two cycles racing on the same
  // body cannot both post; on failure the row is removed and the next cycle
  // retries.
  deps.db.recordCommentSent(issueId, hash);
  try {
    const data = await rawRequestWithRetry<{
      commentCreate: { success: boolean; comment?: { id: string } };
    }>(
      deps.client,
      COMMENT_CREATE,
      { issueId, body: rendered },
      deps.retry?.maxAttempts,
      deps.retry?.sleepMs,
    );
    if (!data.commentCreate.success) {
      throw new Error(`commentCreate returned success: false for ${issueId}`);
    }
    const commentId = data.commentCreate.comment?.id;
    deps.db.recordCommentSent(issueId, hash, commentId ?? null);
    return { posted: true, commentId, body: rendered, bodySha256: hash };
  } catch (err) {
    // Roll the dedupe row back so the comment is not lost forever.
    deps.db.deleteCommentSent(issueId, hash);
    throw err;
  }
}
