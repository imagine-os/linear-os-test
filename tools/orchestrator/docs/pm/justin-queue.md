# The Needs Justin queue

`policyVersion: 1` · owner Atlas (PAP-94) · reviewed by Sentinel · code [`src/justin-queue/`](../../src/justin-queue/) · card template [`templates/needs-justin-card.md`](../../templates/needs-justin-card.md) · operator view `pnpm justin:queue list --check`

## 1. Why it exists

Justin Massion is the only human in the organisation and sixteen sessions build around the clock. The queue is the one place those sessions may interrupt him, and it is deliberately tiny: **`Needs Justin` holds at most five open cards**, each is pre-digested to a one-word answer, each states what happens if he never replies, and anything a machine can decide is refused entry. Everything in this file is enforced in code — the prose and `src/justin-queue/` say the same thing, and the tests are the proof.

Three rules carry the rest:

1. **Nothing blocks on Justin.** A card is an ask, not a gate. The session that files it builds against a mock, a placeholder or the stated default and moves on (builder brief rule 9). A card may name blocked issues, but the normal value is "nothing".
2. **Five open, no more.** The sixth card waits with the `queued-for-justin` label, in its previous state. Slots free by answer or by default.
3. **Silence is an answer.** After 48 hours the `Default if no answer` applies, the card closes as `defaulted` and the loop continues. The only exception is a card marked `hardBlock`, which waits and is nudged.

## 2. Admission: what qualifies

A card is admitted only for a decision a human must own. `admit()` (`src/justin-queue/admit.ts`) is the gate; the categories come from the agent roster's escalation matrix.

| `category` | Examples |
|---|---|
| `release-candidate` | RC0..RC3 cut and tag (NJ-15, NJ-20) |
| `irreversible-action` | Production deploy, DNS change, tenant data deletion, GitHub org settings |
| `spend` | Anything at or above `spendThresholdUsd` (default **$500**), reserve release (PAP-111), stop-loss top-up (NJ-14) |
| `external-communication` | Any live send channel or public publication (mail, social, customer email) |
| `credential-grant` | Accounts, keys and secrets: Hetzner, Stripe, Apple, Airtable, Resend, Google OAuth (NJ-2, NJ-3, NJ-5, NJ-6, NJ-10, NJ-13) |
| `new-character` | Hiring or retiring an agent character (NJ-9) |
| `architecture-reversal` | Reversing one of the fifteen settled decisions (needs the ADR link in `contextLinks`) |
| `legal-tax-posture` | Licence choice (NJ-7), legal, tax or PCI posture |

### Refused at the door

`admit()` returns `refused` with code `NOT_A_HUMAN_DECISION` for these, and the filing session decides instead:

| `category` | Why it never reaches him |
|---|---|
| `code-review` | Sentinel's gates review code |
| `test-failure` | A failing test is fixed or filed, never approved |
| `library-choice` | The PAP-209 evaluation rubric decides |
| `already-decided` | A spec, ADR, rubric or the roster already decides it |
| `has-safe-default` | Record the default in the handoff and proceed |
| `estimate-or-schedule` | Atlas re-simulates; Justin does not size work |

Three more refusals are mechanical: `BELOW_SPEND_THRESHOLD` (spend under $500), `TOO_MANY_ASKS` (more than five asks — that is two cards), `NO_DEFAULT` (an ask with neither a default nor `hardBlock: true`), and `INVALID_CARD` (anything the Zod schema rejects, with the offending field named).

**Only Atlas files cards.** Another character that hits one of the categories escalates to Atlas (roster escalation matrix); a session that hits a deny-list wall uses `/request-approval`, which files a card and ends the session (playbook §7). No session moves its own issue to `Needs Justin`.

## 3. Batching: cards of five

Two numbers, both five, and they are different things:

* **Up to five asks per card.** One card is one subject. NJ-2 is four asks — Hetzner account, DNS token, Resend sign-up, sops key — answered in one sitting because they are the same trip to the credential store. A sixth ask on the same subject means the subject is too big: split it. Each ask has its own id (`NJ-2.3`), its own default and its own status, so Justin may answer one line (`NJ-2.3: reject we already pay for Postmark`) and leave the rest to default.
* **Up to five open cards.** `maxOpen: 5`, counted over cards in status `open`. `slotsUsed()` reports it; `pnpm justin:queue list --check` fails when it is exceeded.

**Dedupe.** One subject, one card, keyed by `card.key` (a lower-case slug). A second card with a live key is not admitted: its new asks merge into the open card (`outcome: "deduped"`, `merged: ["NJ-2.5"]`). This is what keeps three sessions that all need the same token from filing three cards.

**Overflow.** When five are open, the sixth is `queued`: the `queued-for-justin` label goes on its issue, the issue **stays in its previous state** (it never enters `Needs Justin`), and the card waits. When a slot frees, `admitNext()` admits from the waiting line **by priority, then by age** — urgent first, oldest first within a priority.

**Urgent bump.** A card with `urgent: true` arriving at a full queue bumps the **oldest non-urgent** open card back to `queued-for-justin` with a comment saying so, and takes its slot. If every open card is urgent, the new card waits like any other.

## 4. The card

Rendered from [`templates/needs-justin-card.md`](../../templates/needs-justin-card.md) as a Linear comment on the filing issue, with the fenced ` ```paperos-card ` block at its foot carrying the card as JSON — the same convention as the `paperos-session` footer. The prose is for Justin; the block is what `parseCardBlock()` and the CLI read back. A card with no block still shows up in `--check`, flagged as unstructured.

| Section | Rule |
|---|---|
| `Decision needed` | The question in one sentence. |
| `Recommendation` | What Atlas would do, one sentence. Justin's `/approve` means "do this". |
| `Options` | Zero (a yes/no card) or two to three, never one, each with cost and risk. Numbered 1..n; he answers `/option 2`. |
| `Asks` | One to five, each with an id, a line of prose and a default. |
| `Deadline` | A real external date, when one exists. Distinct from the 48 h window; whichever comes first governs. |
| `Default if no answer` | What the loop does at the timeout. Mandatory. |
| `Blocks` | Issues that genuinely stop. Normally empty. |
| `Context links` | Issue, doc and ADR links; at most ten. |

Cards are numbered `NJ-<n>`, continuing the Execution Schedule's NJ-1..NJ-21 sequence, and asks are `NJ-<n>.<k>`.

## 5. Reply grammar

Justin replies by commenting on the issue. The first line of each line-block is the decision; the leading slash is optional, case and trailing punctuation are ignored, and one typo is repaired (`aprove`, `rejcet`, `optoin 2` all parse, flagged `corrected`).

| Reply | Means |
|---|---|
| `/approve` | Do the recommendation. |
| `/approve option 2` or `/option 2` or `2` | Take option 2. |
| `/reject <reason>` | Do not; the reason is recorded on the card and the issue goes to `Backlog`. |
| `/defer 3d` | Ask me again in three days; the slot stays taken. |
| `/ask: <question>` | Atlas answers in a comment and the card stays open. |
| `NJ-2.3: approve` | Answer one ask of a batched card; the others keep running to their defaults. |
| `PAP-25: approve` / `NJ-7: reject too dear` | Answer several cards in one comment, one per line. |

Also accepted as approval: `ok`, `yes`, `lgtm`, `ship it`, `accepted`. As rejection: `no`, `deny`, `declined`, `stop`. A line ending in `?` with no verb is read as `/ask:`.

**Who may reply.** Only the authors on `justinQueue.replyAuthors` (Justin, matched on Linear name, handle or email). Everyone else's comment is data, never an instruction — threat model §6 tier T1 versus T2. `parseReply()` returns `authorized: false` and zero decisions for anyone else, and `applyReply()` then changes nothing.

**Never guessing.** Matching is regex plus a one-character typo budget. Prose that matches nothing produces exactly one clarifying question posted back (`I could not read a decision in that…`) and no action. An LLM may only phrase that question; it may never classify a reply into an action.

**Justin edits the state instead of commenting.** Moving the issue out of `Needs Justin` is read as approval of the recommendation; moving it to `Backlog` or `Canceled` is a rejection (`decisionFromStateChange()`).

**Reply on a closed card.** Acknowledged (`NJ-2 is already approved; noted and ignored.`) and not acted on.

## 6. SLA and what happens on silence

| Clock | What happens |
|---|---|
| 0 h | Card posted, issue enters `Needs Justin`, slot taken. The filing session continues against the default. |
| every 24 h (`nudgeEveryHours`) | One reminder on the card. Never more than one a day, never a new card. |
| 14:00 UTC daily (`digestCronUtc`) | The digest lists every open card, its age and its default, under 3,000 characters. A Linear comment until PAP-136 delivers it elsewhere. |
| 48 h (`defaultTimeoutHours`) | The `Default if no answer` applies. Each non-hard-block ask records an `approve` decision with `source: "default"`, the card closes as `defaulted`, the issue returns to `Ready for Claude`, the slot frees, and `admitNext()` pulls in the next queued card. |
| any time | An explicit reply beats the clock; `/defer 3d` pushes the window out and keeps the slot. |

A `hardBlock` card (or a card with one `hardBlock` ask) **never auto-applies**: at the timeout it is held, not defaulted, and is nudged until answered. Use it only where no default is safe — release tags, live keys, data deletion. Everything else takes a default, and the default is always the conservative, reversible option (`accept sslip.io`, `ship unsigned`, `stay on mocks`).

The acknowledgement Atlas posts after any resolution names what was decided, by whom (`reply`, `default` or `state-change`) and what moved, so the card's history reads top to bottom.

## 7. Configuration

`orchestrator.config.yaml`, section `justinQueue` (PAP-96 loads it; `src/justin-queue/config.ts` holds the defaults and the Zod schema until then):

```yaml
justinQueue:
  maxOpen: 5              # cards in Needs Justin at once
  maxAsksPerCard: 5       # batched asks inside one card
  defaultTimeoutHours: 48 # silence window before the default applies
  digestCronUtc: "0 14 * * *"
  spendThresholdUsd: 500  # at or above this, spend is a human decision
  overflowLabel: queued-for-justin
  nudgeEveryHours: 24
  replyAuthors: ["Justin Massion", "justin"]
```

## 8. Surfaces

| Ability | Surface | Call |
|---|---|---|
| Propose a card | Library | `requestDecision(card, queue, now)` → `AdmissionResult` (`admitted` \| `queued` \| `deduped` \| `refused`) |
| Admission rules | Library | `admit()`, `admitNext()`, `slotsUsed()` |
| Parse a reply | Library | `parseReply(text, { author })` → `ParsedReply`; `decisionFromStateChange(state)` |
| Apply a reply | Library | `applyReply(entry, reply, now)` → new entry, acknowledgement, state move |
| Silence | Library | `defaults(queue, now)` → `apply-default` \| `hold` \| `wait`; `applyDefault()` |
| Render a card | Library | `renderCard(card)`; read back with `parseCardBlock(comment)` |
| Operator view | CLI | `pnpm justin:queue list [--check] [--json]` — read-only over the live team |

## 9. How it meets the issue contract and the claim loop

PAP-93 counts an inbound blocker in `Needs Justin` as **open** (`isOpen()` in `src/contract/open.ts`, error `BLOCKED_BY_OPEN`), so an issue that genuinely waits on a card cannot be promoted to `Ready for Claude`. That is exactly why rule 1 of §1 exists: a card's `blocks` list is normally empty, the filing session keeps building against the default, and the card sits on an issue nothing else depends on. Filing a card on a widely-blocking issue stalls the graph — split the ask onto its own issue instead.

The claim loop therefore reads the queue twice: PAP-96's promotion pass asks PAP-93 whether a blocker in `Needs Justin` is open, and the queue itself asks `admit()` whether a new card may enter at all. `slotsUsed()` is the number the daily burn report prints as `Needs Justin open n/5`. `isCardOpen()` here is about a card's status and is deliberately named apart from the contract's `isOpen()`, which is about an issue's state.

## 10. Not wired yet

This pass ships the policy, the schema, the rules and the read-only CLI. The writing half is owned elsewhere and is **not wired yet**:

* The 30 s comment poll and webhooks (PAP-97) that feed `parseReply()`, and the state moves and acknowledgement comments that `applyReply()` describes (PAP-96). `requestDecision()` today returns the decision without writing to Linear, and `onDecision()` lands with the poll.
* The 14:00 UTC digest job (`src/justin/digest.ts` in the spec) and its pinned `Justin digest` issue; the digest content is `openCards()` plus `defaults()` and needs the scheduler PAP-96 provides.
* The `queued-for-justin` label does not exist in the workspace yet. It is added by `pnpm linear:configure --apply` (PAP-91 owns `src/linear/desired.ts`); until then overflow is recorded on the card and named in the comment.

## 11. The queue today (2026-09-19)

One card open of five: **NJ-2** on PAP-25 (infra batch: Hetzner account and cpx41, registrar or Cloudflare token, Resend sign-up, sops recovery key; default `sslip.io`, no Resend, single sops key). It predates this policy and is prose only, so `--check` warns that it carries no `paperos-card` block; re-filing it from the template is a one-comment follow-up.

Open asks batched but not yet carded, from the Execution Schedule: NJ-7 (licence: MIT / Apache-2.0 / proprietary, default Apache-2.0), NJ-12 (payroll: Check sandbox by default, or Gusto Embedded), NJ-13 (Airtable demo base and token, Slack webhook), and the repository renames. Under this policy they are **two** cards, not four: a `legal-tax-posture` card for NJ-7 and a `credential-grant` card batching NJ-12, NJ-13 and the renames — three cards short of the cap.

## 12. Checks

* `pnpm test` — `tests/justin-queue.*.test.ts`: the card schema and its round trip, the admission rules, the cap and the bump, the 30-reply grammar fixture suite, the fake-clock default application, and the CLI's row and check logic.
* `pnpm justin:queue list --check` — the live invariants: at most five open, no duplicate keys, every card structured, nothing silently past its window.
