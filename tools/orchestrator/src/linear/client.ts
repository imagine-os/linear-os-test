/**
 * Thin Linear API client used by `ops/linear/configure-workspace.ts`.
 *
 * Uses `@linear/sdk`'s `LinearClient` purely for auth plumbing and its
 * `client.rawRequest` escape hatch (team settings, templates and label
 * groups aren't all covered by the typed SDK surface, and one raw-GraphQL
 * code path keeps read and write symmetric). `apiKey` mode sends the
 * `Authorization` header with no `Bearer` prefix, which is what the
 * PaperOS proxy expects.
 */

import { LinearClient } from "@linear/sdk";

export function createLinearClient(
  apiKey = process.env.LINEAR_API_KEY ?? "placeholder",
): LinearClient {
  return new LinearClient({ apiKey });
}

export interface GraphQLErrorLike {
  message: string;
  extensions?: { code?: string };
}

/** Retries on Linear's rate-limit signal, per the spec's edge case: sleep
 * 60s and retry up to five times. */
export async function rawRequestWithRetry<T>(
  client: LinearClient,
  query: string,
  variables?: Record<string, unknown>,
  maxAttempts: number = 5,
  sleepMs: (attempt: number) => number = () => 60_000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await client.client.rawRequest<T, Record<string, unknown>>(
        query,
        variables ?? {},
      );
      return res.data as T;
    } catch (err) {
      lastError = err;
      const rateLimited = isRateLimited(err);
      if (!rateLimited || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, sleepMs(attempt)));
    }
  }
  throw lastError;
}

function isRateLimited(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  if (/RATELIMITED/i.test(message)) return true;
  const withResponse = err as { response?: { status?: number } };
  return withResponse?.response?.status === 429;
}
