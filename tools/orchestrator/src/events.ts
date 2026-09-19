/**
 * The orchestrator's typed event emitter (PAP-281 Interface contract:
 * `events.emit("issue.claimed" | "issue.released")`; PAP-96 adds
 * `session.started`, `session.ended`, `pr.detected`; PAP-691 adds
 * `issue.promoted`).
 *
 * Every emit is also appended to the `events` table when a database is wired
 * in, so PAP-97 (webhooks) and PAP-113 (`/status`) can read history the
 * process did not keep in memory.
 */

import type { OrchestratorDb } from "./db/index.js";

export interface OrchestratorEvents {
  "issue.claimed": { issueId: string; identifier: string; sessionId: string; character: string };
  "issue.released": { issueId: string; identifier: string; sessionId: string; reason: string };
  "issue.promoted": { issueId: string; identifier: string; baseBranches: string[] };
  "issue.escalated": { issueId: string; identifier: string; reason: string };
  "issue.retried": { issueId: string; identifier: string; attempt: number };
  "issue.in_review": { issueId: string; identifier: string; evidence: string };
  "session.started": { sessionId: string; issueId: string; character: string };
  "session.ended": { sessionId: string; issueId: string; status: string };
  "pr.detected": { issueId: string; identifier: string; url: string };
  "loop.error": { where: string; message: string; backoffMs: number };
  "loop.cycle": { claimed: number; passes: string[]; durationMs: number };
}

export type EventKind = keyof OrchestratorEvents;
type Handler<K extends EventKind> = (payload: OrchestratorEvents[K]) => void;

export interface EventBus {
  on<K extends EventKind>(kind: K, handler: Handler<K>): () => void;
  once<K extends EventKind>(kind: K, handler: Handler<K>): () => void;
  emit<K extends EventKind>(kind: K, payload: OrchestratorEvents[K]): void;
}

export function createEventBus(db?: OrchestratorDb): EventBus {
  const handlers = new Map<EventKind, Set<(p: never) => void>>();

  function on<K extends EventKind>(kind: K, handler: Handler<K>): () => void {
    const set = handlers.get(kind) ?? new Set();
    set.add(handler as (p: never) => void);
    handlers.set(kind, set);
    return () => {
      set.delete(handler as (p: never) => void);
    };
  }

  return {
    on,
    once<K extends EventKind>(kind: K, handler: Handler<K>): () => void {
      const off = on(kind, ((payload: OrchestratorEvents[K]) => {
        off();
        handler(payload);
      }) as Handler<K>);
      return off;
    },
    emit<K extends EventKind>(kind: K, payload: OrchestratorEvents[K]): void {
      const record = payload as unknown as Record<string, unknown>;
      db?.appendEvent({
        kind,
        issueId: typeof record.issueId === "string" ? record.issueId : null,
        sessionId: typeof record.sessionId === "string" ? record.sessionId : null,
        payload,
      });
      for (const handler of handlers.get(kind) ?? []) {
        // One bad listener must not take the loop down.
        try {
          (handler as Handler<K>)(payload);
        } catch {
          // swallowed on purpose; listeners report their own failures
        }
      }
    },
  };
}
