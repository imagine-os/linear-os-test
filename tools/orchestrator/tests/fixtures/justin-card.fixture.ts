/**
 * Shared decision-card fixture for the PAP-94 tests: the live NJ-2 infra batch
 * (four credential asks on PAP-25), which every queue test varies.
 */
import { type DecisionCard, DecisionCardSchema } from "../../src/justin-queue/card.js";

export function makeCard(over: Record<string, unknown> = {}): DecisionCard {
  return DecisionCardSchema.parse({
    key: "infra-batch",
    nj: "NJ-2",
    issue: "PAP-25",
    title: "Infra batch",
    category: "credential-grant",
    priority: 1,
    decisionNeeded: "Which credentials route do we take to provision the VPS?",
    recommendation: "Open a Hetzner account and accept sslip.io for v0.1.0.",
    options: [
      {
        n: 1,
        label: "Hetzner cpx41 + Cloudflare token",
        costUsd: 32,
        risk: "one more account to hold",
      },
      {
        n: 2,
        label: "Hetzner cpx41 + sslip.io",
        costUsd: 32,
        risk: "ugly URLs until a domain lands",
      },
    ],
    asks: [
      {
        id: "NJ-2.1",
        ask: "Hetzner account and a cpx41",
        default: "wait; infra files stay under ops/",
      },
      { id: "NJ-2.2", ask: "Registrar or Cloudflare token", default: "accept sslip.io" },
      { id: "NJ-2.3", ask: "Resend sign-up", default: "log mail to disk in staging" },
      { id: "NJ-2.4", ask: "sops recovery key", default: "single age key, rotate at RC2" },
    ],
    openedAt: "2026-09-19T01:44:05.000Z",
    defaultIfNoAnswer: "sslip.io, no Resend, single sops key; PAP-25 stays parked.",
    contextLinks: ["PAP-25", "docs/security-and-threat-model.md §5"],
    blocks: [],
    status: "open",
    ...over,
  });
}
