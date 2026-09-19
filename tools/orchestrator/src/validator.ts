/**
 * Optional bridge to PAP-93's issue-contract validator.
 *
 * PAP-93 (`src/contract/`) is being built in parallel with this issue. Rather
 * than fork its rules or block on it, the loop asks for it at run time: if
 * `src/contract/index.ts` is on disk, `loadValidator()` returns
 * `validateIssue` and `isOpen`; if it is not, it returns `null` and every
 * report is marked `validator: "unavailable"`, exactly as PAP-96 and PAP-691
 * prescribe for the pre-PAP-93 window. Nothing needs editing when PAP-93
 * lands — the import simply starts resolving.
 *
 * The specifier is built at run time so `tsc` does not try to resolve a
 * module that may not exist in this checkout.
 */

export interface Blockerish {
  identifier: string;
  state: { name: string };
  pr?: { url?: string; open: boolean };
  branch?: string;
}

export interface ValidationResultish {
  ok: boolean;
  violations: { code: string; severity: "error" | "warn"; message: string; fix: string }[];
}

export interface ValidatorPort {
  validateIssue(issue: unknown, config?: unknown): ValidationResultish;
  isOpen(blocker: Blockerish, opts?: { mode?: string }): boolean;
}

let cached: ValidatorPort | null | undefined;

export async function loadValidator(
  specifier = "./contract/index.js",
): Promise<ValidatorPort | null> {
  if (cached !== undefined) return cached;
  try {
    const path = specifier;
    const mod = (await import(path)) as Partial<ValidatorPort>;
    if (typeof mod.validateIssue === "function" && typeof mod.isOpen === "function") {
      cached = mod as ValidatorPort;
      return cached;
    }
    cached = null;
  } catch {
    cached = null;
  }
  return cached;
}

/** Test seam: forget what `loadValidator` cached. */
export function resetValidatorCache(): void {
  cached = undefined;
}

export async function validatorStatus(): Promise<"available" | "unavailable"> {
  return (await loadValidator()) ? "available" : "unavailable";
}
