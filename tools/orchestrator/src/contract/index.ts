/** Public surface of the issue contract (PAP-93). */
export { type ContractConfig, type ContractMode, DEFAULT_CONFIG, resolveConfig } from "./config.js";
export {
  fetchIssue,
  fetchTeamIssues,
  ISSUE_FIELDS,
  type LinearIssueNode,
  prFromAttachments,
  toContractIssue,
} from "./linear-issue.js";
export { CLOSED_STATES, describeBlocker, IN_REVIEW, isOpen, OPEN_STATES } from "./open.js";
export {
  type AuditRow,
  isPromotable,
  READINESS_CODES,
  renderAuditTable,
  renderViolationsComment,
  toAuditRow,
} from "./render.js";
export {
  canonicalSection,
  normalizeSize,
  parseFilesGlobs,
  parseHeadings,
  parseSections,
  sectionOrder,
} from "./sections.js";
export {
  CONTRACT_CHECKS_DDL,
  type ContractCheckRow,
  type ContractCheckStore,
  MemoryContractCheckStore,
  openSqliteContractCheckStore,
  SqliteContractCheckStore,
} from "./store.js";
export * from "./types.js";
export { errorCodes, hasSpecLink, scopeNamesRoute, validateIssue, warnCodes } from "./validate.js";

/** Name of the label the webhook adds on a contract failure; id from linear-workspace.json when present. */
export const NEEDS_CONTRACT_LABEL = "needs-contract";
