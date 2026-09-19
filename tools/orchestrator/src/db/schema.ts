/**
 * Orchestrator schema (PAP-281). Plain SQL that runs unchanged on SQLite
 * (`node:sqlite`, dev) and on Postgres schema `orchestrator` (production);
 * the Postgres variant only prefixes the table names and swaps `TEXT` for
 * `timestamptz` where it matters, which `POSTGRES_DDL` below spells out.
 *
 * Tables
 * - `sessions`      one row per builder session (PAP-282 fills worktree/branch)
 * - `claims`        one row per claimed issue; `issue_id` is the PRIMARY KEY,
 *                   which is what makes the claim atomic (see `claims.ts`)
 * - `events`        the append-only event log the typed emitter writes through
 * - `comments_sent` `linearComment()` dedupe keyed `(issue_id, body_sha256)`
 * - `promotions`    written by PAP-691's promotion pass; created here because
 *                   PAP-691 consumes "PAP-281 ... ids and tables" and every
 *                   statement is `IF NOT EXISTS`, so its own migration is a
 *                   no-op on a database this one already opened.
 *
 * `contract_checks` is PAP-93's table (`src/contract/store.ts`,
 * `CONTRACT_CHECKS_DDL`) and is deliberately NOT duplicated here.
 */

export const SCHEMA_VERSION = 1;

export const SQLITE_DDL = /* SQL */ `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  issue_id     TEXT NOT NULL,
  character    TEXT NOT NULL,
  model        TEXT,
  worktree     TEXT,
  branch       TEXT,
  status       TEXT NOT NULL,
  started_at   TEXT NOT NULL,
  ended_at     TEXT,
  footer_json  TEXT
);
CREATE INDEX IF NOT EXISTS sessions_issue_idx  ON sessions (issue_id, started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions (status);

CREATE TABLE IF NOT EXISTS claims (
  issue_id        TEXT PRIMARY KEY,
  identifier      TEXT NOT NULL,
  session_id      TEXT NOT NULL,
  character       TEXT NOT NULL,
  claimed_at      TEXT NOT NULL,
  updated_at_seen TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS claims_session_idx ON claims (session_id);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  issue_id   TEXT,
  kind       TEXT NOT NULL,
  payload    TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_kind_idx  ON events (kind, at DESC);
CREATE INDEX IF NOT EXISTS events_issue_idx ON events (issue_id, at DESC);

CREATE TABLE IF NOT EXISTS comments_sent (
  issue_id    TEXT NOT NULL,
  body_sha256 TEXT NOT NULL,
  comment_id  TEXT,
  sent_at     TEXT NOT NULL,
  PRIMARY KEY (issue_id, body_sha256)
);

CREATE TABLE IF NOT EXISTS promotions (
  issue_id          TEXT PRIMARY KEY,
  promoted_at       TEXT NOT NULL,
  blockers_json     TEXT NOT NULL,
  base_branches_json TEXT NOT NULL,
  dry_run           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS retries (
  issue_id TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_at  TEXT NOT NULL
);
`;

/**
 * The same schema for Postgres. Differences are mechanical: `SERIAL` for the
 * event id, `timestamptz` for the clocks, `boolean` for `dry_run`, and the
 * `orchestrator` schema prefix. `claims.issue_id` stays the primary key, so
 * `INSERT ... ON CONFLICT DO NOTHING` and `SELECT ... FOR UPDATE SKIP LOCKED`
 * give two replicas exactly one winner (PAP-96 edge case "Two replicas").
 */
export const POSTGRES_DDL = /* SQL */ `
CREATE SCHEMA IF NOT EXISTS orchestrator;
SET search_path TO orchestrator;

CREATE TABLE IF NOT EXISTS schema_meta (
  key   text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id          text PRIMARY KEY,
  issue_id    text NOT NULL,
  character   text NOT NULL,
  model       text,
  worktree    text,
  branch      text,
  status      text NOT NULL,
  started_at  timestamptz NOT NULL,
  ended_at    timestamptz,
  footer_json jsonb
);
CREATE INDEX IF NOT EXISTS sessions_issue_idx  ON sessions (issue_id, started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions (status);

CREATE TABLE IF NOT EXISTS claims (
  issue_id        text PRIMARY KEY,
  identifier      text NOT NULL,
  session_id      text NOT NULL,
  character       text NOT NULL,
  claimed_at      timestamptz NOT NULL,
  updated_at_seen timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS claims_session_idx ON claims (session_id);

CREATE TABLE IF NOT EXISTS events (
  id         bigserial PRIMARY KEY,
  session_id text,
  issue_id   text,
  kind       text NOT NULL,
  payload    jsonb NOT NULL,
  at         timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS events_kind_idx  ON events (kind, at DESC);
CREATE INDEX IF NOT EXISTS events_issue_idx ON events (issue_id, at DESC);

CREATE TABLE IF NOT EXISTS comments_sent (
  issue_id    text NOT NULL,
  body_sha256 text NOT NULL,
  comment_id  text,
  sent_at     timestamptz NOT NULL,
  PRIMARY KEY (issue_id, body_sha256)
);

CREATE TABLE IF NOT EXISTS promotions (
  issue_id           text PRIMARY KEY,
  promoted_at        timestamptz NOT NULL,
  blockers_json      jsonb NOT NULL,
  base_branches_json jsonb NOT NULL,
  dry_run            boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS retries (
  issue_id text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  last_at  timestamptz NOT NULL
);
`;

/**
 * The atomic-claim statement, spelled per dialect. SQLite has no
 * `SKIP LOCKED`; the primary key on `claims.issue_id` plus
 * `INSERT OR IGNORE` gives the same single-winner guarantee inside one
 * process and across processes sharing the file, which is what the spec's
 * `SELECT ... FOR UPDATE SKIP LOCKED` buys on Postgres.
 */
export const CLAIM_INSERT = {
  sqlite:
    "INSERT OR IGNORE INTO claims (issue_id, identifier, session_id, character, claimed_at, updated_at_seen) VALUES (?, ?, ?, ?, ?, ?)",
  postgres:
    "INSERT INTO orchestrator.claims (issue_id, identifier, session_id, character, claimed_at, updated_at_seen) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (issue_id) DO NOTHING",
} as const;
