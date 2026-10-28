export type ReportViewerRole = "MENTOR" | "DEAN";

function storageKey(role: ReportViewerRole): string {
  return `112yanji:${role.toLowerCase()}:read-submissions`;
}

export function loadReadSubmissionIds(role: ReportViewerRole): Set<number> {
  try {
    const stored = window.localStorage.getItem(storageKey(role));
    const ids = stored ? (JSON.parse(stored) as unknown) : [];
    return new Set(
      Array.isArray(ids)
        ? ids.filter((id): id is number => Number.isInteger(id))
        : [],
    );
  } catch {
    return new Set();
  }
}

export function rememberSubmissionRead(
  role: ReportViewerRole,
  submissionId: number,
): Set<number> {
  const next = loadReadSubmissionIds(role);
  next.add(submissionId);
  try {
    window.localStorage.setItem(storageKey(role), JSON.stringify([...next]));
  } catch {
    // The live API still records read state if browser storage is unavailable.
  }
  return next;
}
