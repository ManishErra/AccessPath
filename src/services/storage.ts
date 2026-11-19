import { AccessibilityReport, ReportStatus, StatusEvent } from '../types';
import { SEED_REPORTS } from '../data/seedReports';

export const STORAGE_KEYS = {
  REPORTS: 'accesspath.reports.v1',
  INITIALIZED: 'accesspath.demo.initialized.v1',
  MY_REPORTS: 'accesspath.my_reports.v1',
  SEED_VERSION: 'accesspath.seed_version.v2',
};

const CURRENT_SEED_VERSION = 'v2';

// ---------------------------------------------------------------------------
// Error classification helpers
// ---------------------------------------------------------------------------

export function isStorageQuotaError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
  }
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'QuotaExceededError'
  );
}

export function isStorageSecurityError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return err.name === 'SecurityError' || err.code === 18;
  }
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'SecurityError'
  );
}

function classifyStorageError(err: unknown): { message: string; isQuota: boolean; isSecurity: boolean } {
  const isSecurity = isStorageSecurityError(err);
  const isQuota = isStorageQuotaError(err);
  if (isSecurity) {
    return { message: 'Storage access blocked by browser security settings (SecurityError).', isQuota, isSecurity };
  }
  if (isQuota) {
    return { message: 'Browser storage quota exceeded.', isQuota, isSecurity };
  }
  return { message: 'An unexpected storage error occurred.', isQuota, isSecurity };
}

// ---------------------------------------------------------------------------
// Alias generation
// ---------------------------------------------------------------------------

/**
 * Automatically derives common block aliases from free-text location.
 * For example:
 * - "Block 34" -> ["block 34", "b34", "b-34", "block-34", "b 34", "block34"]
 * - "B34" -> ["block 34", "b34", "b-34", ...]
 * - "Block 33, Ground Floor" -> ["block 33", "b33", "b-33", ...]
 */
export function generateLocationAliases(location: string): string[] {
  const aliases = new Set<string>();
  const clean = location.trim();
  if (!clean) return [];

  aliases.add(clean.toLowerCase());

  // Check for Block [number] pattern anywhere in the string
  const blockMatch = clean.match(/\bblock[\s-_]*([0-9a-zA-Z]+)\b/i);
  if (blockMatch) {
    const num = blockMatch[1].toUpperCase();
    const numLower = num.toLowerCase();
    aliases.add(`block ${numLower}`);
    aliases.add(`block-${numLower}`);
    aliases.add(`block${numLower}`);
    aliases.add(`b${numLower}`);
    aliases.add(`b-${numLower}`);
    aliases.add(`b ${numLower}`);
    aliases.add(`b${num}`);
    aliases.add(`b-${num}`);
    aliases.add(`block ${num}`);
  }

  // Check for B[number] pattern anywhere in the string (e.g. B34, B-34)
  const bMatch = clean.match(/\bb[\s-_]*([0-9a-zA-Z]+)\b/i);
  if (bMatch) {
    const num = bMatch[1].toUpperCase();
    const numLower = num.toLowerCase();
    aliases.add(`block ${numLower}`);
    aliases.add(`block-${numLower}`);
    aliases.add(`block${numLower}`);
    aliases.add(`b${numLower}`);
    aliases.add(`b-${numLower}`);
    aliases.add(`b ${numLower}`);
    aliases.add(`b${num}`);
    aliases.add(`b-${num}`);
    aliases.add(`block ${num}`);
  }

  return Array.from(aliases);
}

// ---------------------------------------------------------------------------
// Shared result types
// ---------------------------------------------------------------------------

export interface StorageOperationResult {
  success: boolean;
  error?: string;
  isQuotaError?: boolean;
  isSecurityError?: boolean;
  rollbackFailed?: boolean;
}

export type ResetResult = AccessibilityReport[] &
  StorageOperationResult & {
    reports: AccessibilityReport[];
  };

export function createResetResult(
  reports: AccessibilityReport[],
  success: boolean,
  error?: string,
  isSecurityError?: boolean,
  isQuotaError?: boolean,
  rollbackFailed?: boolean
): ResetResult {
  const arr = [...reports] as unknown as ResetResult;
  arr.success = success;
  arr.reports = reports;
  arr.error = error;
  arr.isSecurityError = isSecurityError;
  arr.isQuotaError = isQuotaError;
  arr.rollbackFailed = rollbackFailed;
  return arr;
}

export interface SaveReportResult extends StorageOperationResult {
  report?: AccessibilityReport;
}

export interface UpdateStatusResult extends StorageOperationResult {
  report?: AccessibilityReport;
  reason?:
    | 'success'
    | 'not_found'
    | 'security_error'
    | 'quota_error'
    | 'write_error'
    | 'rollback_failed'
    | 'storage_unavailable'
    | 'storage_read_error';
}

export type DeleteReportResult = StorageOperationResult;

export interface MyReportsResult {
  success: boolean;
  reports: AccessibilityReport[];
  ids: string[];
  status: 'ok' | 'storage_unavailable' | 'storage_read_error';
  error?: string;
  isSecurityError?: boolean;
}

export interface CreateReportInput {
  location: string;
  locationDetail?: string;
  category: AccessibilityReport['category'];
  title: string;
  description: string;
  reporterContext?: AccessibilityReport['reporterContext'];
  photoDataUrl?: string;
  locationAliases?: string[];
}

// ---------------------------------------------------------------------------
// Transactional rollback helper
// ---------------------------------------------------------------------------

interface KeySnapshot {
  key: string;
  previousValue: string | null;
}

function snapshotKey(key: string): KeySnapshot {
  return { key, previousValue: localStorage.getItem(key) };
}

function rollbackSnapshots(snapshots: KeySnapshot[]): boolean {
  let allOk = true;
  for (const snap of snapshots) {
    try {
      if (snap.previousValue !== null) {
        localStorage.setItem(snap.key, snap.previousValue);
      } else {
        localStorage.removeItem(snap.key);
      }
    } catch (rbErr) {
      allOk = false;
      console.error(`Rollback failed for key "${snap.key}":`, rbErr);
    }
  }
  return allOk;
}

// ---------------------------------------------------------------------------
// Reset functions — fully transactional
// ---------------------------------------------------------------------------

/**
 * Safely resets only the sample demonstration records to the current SEED_REPORTS,
 * while strictly preserving all user-submitted reports and local report IDs.
 */
export function resetSampleDataOnly(): ResetResult {
  if (typeof localStorage === 'undefined') {
    return createResetResult(SEED_REPORTS, false, 'Browser localStorage is not available.');
  }

  // 1. Snapshot every key that will be modified
  let snapshots: KeySnapshot[];
  try {
    snapshots = [
      snapshotKey(STORAGE_KEYS.REPORTS),
      snapshotKey(STORAGE_KEYS.INITIALIZED),
      snapshotKey(STORAGE_KEYS.SEED_VERSION),
    ];
  } catch (readErr) {
    const cls = classifyStorageError(readErr);
    return createResetResult(SEED_REPORTS, false, cls.message, cls.isSecurity);
  }

  // 2. Parse existing reports to preserve genuine user-submitted reports
  let existing: AccessibilityReport[] = [];
  const raw = snapshots[0].previousValue;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return createResetResult(
          SEED_REPORTS,
          false,
          'Stored reports data is corrupted or unreadable. Reset aborted to protect existing data.'
        );
      }
      existing = parsed;
    } catch {
      return createResetResult(
        SEED_REPORTS,
        false,
        'Stored reports data is corrupted or unreadable (JSON parse failed). Reset aborted to protect existing data.'
      );
    }
  }

  const userReports = existing.filter(
    (r) => r && typeof r === 'object' && !r.isSample && (r.source === 'User-submitted' || r.isLocalDeviceSubmission)
  );

  const merged = [...userReports, ...SEED_REPORTS];

  // 3. Write all modified keys with full rollback on any failure
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
    return createResetResult(merged, true);
  } catch (err) {
    console.error('Failed to reset sample data, attempting rollback:', err);
    const rbOk = rollbackSnapshots(snapshots);
    const cls = classifyStorageError(err);
    const errMsg = rbOk
      ? cls.message + ' Sample data was not changed.'
      : cls.message + ' Rollback also failed — storage may be in an inconsistent state.';
    return createResetResult(
      existing.length > 0 ? existing : SEED_REPORTS,
      false,
      errMsg,
      cls.isSecurity,
      cls.isQuota,
      !rbOk
    );
  }
}

/**
 * Fully resets storage back to default demo seeds and clears local user submissions.
 */
export function resetToDemoData(): ResetResult {
  if (typeof localStorage === 'undefined') {
    return createResetResult(SEED_REPORTS, false, 'Browser localStorage is not available.');
  }

  // 1. Snapshot all four keys that will be modified or removed
  let snapshots: KeySnapshot[];
  try {
    snapshots = [
      snapshotKey(STORAGE_KEYS.REPORTS),
      snapshotKey(STORAGE_KEYS.INITIALIZED),
      snapshotKey(STORAGE_KEYS.SEED_VERSION),
      snapshotKey(STORAGE_KEYS.MY_REPORTS),
    ];
  } catch (readErr) {
    const cls = classifyStorageError(readErr);
    return createResetResult(SEED_REPORTS, false, cls.message, cls.isSecurity);
  }

  // 2. Write / remove keys with full rollback on any failure
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
    localStorage.removeItem(STORAGE_KEYS.MY_REPORTS);
    return createResetResult(SEED_REPORTS, true);
  } catch (err) {
    console.error('Failed to reset localStorage to demo data, attempting rollback:', err);
    const rbOk = rollbackSnapshots(snapshots);
    const cls = classifyStorageError(err);
    const errMsg = rbOk
      ? cls.message + ' Demo data was not changed.'
      : cls.message + ' Rollback also failed — storage may be in an inconsistent state.';
    return createResetResult(
      SEED_REPORTS,
      false,
      errMsg,
      cls.isSecurity,
      cls.isQuota,
      !rbOk
    );
  }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initializes localStorage with sample seed data if not previously initialized,
 * or safely updates sample data if an outdated seed version is detected.
 */
export function initializeStorage(): AccessibilityReport[] {
  if (typeof localStorage === 'undefined') return SEED_REPORTS;

  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const seedVersion = localStorage.getItem(STORAGE_KEYS.SEED_VERSION);
    const existingRaw = localStorage.getItem(STORAGE_KEYS.REPORTS);

    // If existingRaw has content, do not overwrite existing reports merely because the initialization flag is missing!
    if (existingRaw) {
      let parsed: AccessibilityReport[] = [];
      let isJsonValid = false;

      try {
        const rawParsed = JSON.parse(existingRaw);
        if (Array.isArray(rawParsed)) {
          parsed = rawParsed;
          isJsonValid = true;
        }
      } catch (parseErr) {
        console.error('Failed to parse existing reports in initializeStorage:', parseErr);
        isJsonValid = false;
      }

      if (isJsonValid && parsed.length > 0) {
        // Deduplicate records by ID to ensure repeated initializations never duplicate records
        const seenIds = new Set<string>();
        const dedupedParsed: AccessibilityReport[] = [];
        for (const r of parsed) {
          if (r && typeof r === 'object' && r.id && !seenIds.has(r.id)) {
            seenIds.add(r.id);
            dedupedParsed.push(r);
          }
        }

        // Extract user-submitted reports to preserve
        const userReports = dedupedParsed.filter(
          (r) => !r.isSample && (r.source === 'User-submitted' || r.isLocalDeviceSubmission)
        );

        // If partially initialized (missing initialized flag) or outdated seed version:
        if (seedVersion !== CURRENT_SEED_VERSION || initialized !== 'true') {
          // Merge user reports with latest SEED_REPORTS without duplicating any sample record
          const merged: AccessibilityReport[] = [...userReports];
          const mergedIds = new Set<string>(userReports.map((r) => r.id));
          for (const s of SEED_REPORTS) {
            if (!mergedIds.has(s.id)) {
              mergedIds.add(s.id);
              merged.push(s);
            }
          }

          try {
            localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(merged));
            localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
            localStorage.setItem(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
          } catch (writeErr) {
            console.error('Failed to update partially initialized or outdated storage:', writeErr);
          }
          return merged;
        }

        // Clean up duplicates if any were present
        if (dedupedParsed.length !== parsed.length) {
          try {
            localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(dedupedParsed));
          } catch {}
        }

        return dedupedParsed;
      }

      // If valid JSON but empty array:
      if (isJsonValid && parsed.length === 0) {
        try {
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
          localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
          localStorage.setItem(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
        } catch (writeErr) {
          console.error('Failed to populate empty storage in initializeStorage:', writeErr);
        }
        return SEED_REPORTS;
      }

      // If existingRaw is corrupted (not valid JSON):
      // Do not overwrite existing storage to avoid destroying data; fallback in memory to SEED_REPORTS
      console.warn('Storage contains unparseable data. Preserving storage uncorrupted and returning SEED_REPORTS as fallback.');
      return SEED_REPORTS;
    }

    // Completely empty storage (existingRaw is null or empty)
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      localStorage.setItem(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
    } catch (writeErr) {
      console.error('Failed to set initial seed data in localStorage:', writeErr);
    }
    return SEED_REPORTS;
  } catch (err) {
    console.error('Failed to access localStorage during initialization:', err);
    return SEED_REPORTS;
  }
}

// ---------------------------------------------------------------------------
// Read functions
// ---------------------------------------------------------------------------

export interface AllReportsResult {
  success: boolean;
  reports: AccessibilityReport[];
  status: 'ok' | 'storage_unavailable' | 'storage_read_error';
  error?: string;
  isSecurityError?: boolean;
}

/**
 * Retrieves all stored reports along with detailed storage health status.
 */
export function getAllReportsWithStatus(): AllReportsResult {
  if (typeof localStorage === 'undefined') {
    return {
      success: false,
      reports: [],
      status: 'storage_unavailable',
      error: 'Browser local storage is not available in this environment.',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      const initReports = initializeStorage();
      return {
        success: true,
        reports: initReports,
        status: 'ok',
      };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return {
        success: false,
        reports: [],
        status: 'storage_read_error',
        error: 'Stored reports data is not a valid array.',
      };
    }
    return {
      success: true,
      reports: parsed,
      status: 'ok',
    };
  } catch (err) {
    const isSecurity = isStorageSecurityError(err);
    console.error('Error reading reports from localStorage:', err);
    return {
      success: false,
      reports: [],
      status: 'storage_read_error',
      error: isSecurity
        ? 'Storage access blocked by browser security settings (SecurityError).'
        : 'Failed to read reports from browser storage (corrupted JSON or read failure).',
      isSecurityError: isSecurity,
    };
  }
}

/**
 * Retrieves all stored reports.
 */
export function getAllReports(): AccessibilityReport[] {
  const result = getAllReportsWithStatus();
  return result.success ? result.reports : [];
}

export interface ReportDetailResult {
  success: boolean;
  report?: AccessibilityReport;
  status: 'ok' | 'not_found' | 'storage_unavailable' | 'storage_read_error';
  error?: string;
  isSecurityError?: boolean;
}

/**
 * Retrieves a single report by ID along with detailed storage health status.
 * Distinguishes between a report that does not exist and storage read failure.
 */
export function getReportByIdWithStatus(id: string): ReportDetailResult {
  const allResult = getAllReportsWithStatus();
  if (!allResult.success) {
    return {
      success: false,
      status: allResult.status,
      error: allResult.error,
      isSecurityError: allResult.isSecurityError,
    };
  }

  const found = allResult.reports.find((r) => r.id === id);
  if (!found) {
    return {
      success: false,
      status: 'not_found',
      error: `The requested report ID (${id}) could not be located in your local prototype storage.`,
    };
  }

  return {
    success: true,
    report: found,
    status: 'ok',
  };
}

/**
 * Retrieves a single report by ID.
 * Returns undefined if the report does not exist or if storage read failed.
 */
export function getReportById(id: string): AccessibilityReport | undefined {
  return getReportByIdWithStatus(id).report;
}

/**
 * Retrieves reports and IDs submitted locally on this device/browser with rich status diagnostics.
 * Differentiates empty state, storage unavailable, and storage read errors.
 */
export function getMyReportsWithStatus(): MyReportsResult {
  if (typeof localStorage === 'undefined') {
    return {
      success: false,
      reports: [],
      ids: [],
      status: 'storage_unavailable',
      error: 'Browser local storage is not available in this environment.',
    };
  }

  const idSet = new Set<string>();
  let hadReadError = false;
  let isSecurity = false;
  let readErrorMsg: string | undefined;

  // 1. Read MY_REPORTS index
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_REPORTS);
    if (raw) {
      const ids = JSON.parse(raw);
      if (Array.isArray(ids)) {
        ids.forEach((id) => idSet.add(id));
      } else {
        hadReadError = true;
        readErrorMsg = 'Stored local reports index is not a valid list.';
      }
    }
  } catch (err) {
    hadReadError = true;
    isSecurity = isStorageSecurityError(err);
    readErrorMsg = isSecurity
      ? 'Storage access blocked by browser security settings (SecurityError).'
      : 'Failed to read saved reports index from browser storage.';
    console.error('Error reading MY_REPORTS from localStorage:', err);
  }

  // 2. Read REPORTS store with status
  const allResult = getAllReportsWithStatus();
  if (!allResult.success) {
    hadReadError = true;
    if (allResult.isSecurityError) isSecurity = true;
    if (!readErrorMsg) readErrorMsg = allResult.error;
  }

  const allReports = allResult.reports;
  allReports.forEach((r) => {
    if (r.source === 'User-submitted' && (r.isLocalDeviceSubmission || idSet.has(r.id))) {
      idSet.add(r.id);
    }
  });

  const ids = Array.from(idSet);

  if (hadReadError) {
    return {
      success: false,
      reports: [],
      ids,
      status: 'storage_read_error',
      error: readErrorMsg || 'Failed to read saved reports from browser storage.',
      isSecurityError: isSecurity,
    };
  }

  const myReports = allReports.filter(
    (r) => idSet.has(r.id) || (r.source === 'User-submitted' && r.isLocalDeviceSubmission)
  );

  return {
    success: true,
    reports: myReports,
    ids,
    status: 'ok',
  };
}

/**
 * Backwards-compatible wrapper — returns just the IDs array.
 */
export function getMyReportIds(): string[] {
  return getMyReportsWithStatus().ids;
}

/**
 * Checks if a specific report was submitted locally on this device.
 */
export function isLocalSubmission(id: string): boolean {
  return getMyReportIds().includes(id);
}

/**
 * Backwards-compatible wrapper — returns just the reports array.
 */
export function getMyReports(): AccessibilityReport[] {
  return getMyReportsWithStatus().reports;
}

// ---------------------------------------------------------------------------
// Save report
// ---------------------------------------------------------------------------

/**
 * Saves a new user-submitted report to localStorage using transactional rollback:
 * - If the second write fails, the first write is rolled back immediately.
 * - Prevents partial saves and guarantees reports list and My Reports consistency.
 */
export function saveReport(input: CreateReportInput): SaveReportResult {
  if (typeof localStorage === 'undefined') {
    return {
      success: false,
      error: 'Browser local storage is not available in this environment.',
    };
  }

  const now = new Date().toISOString();
  const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Automatically derive aliases for robust search matching
  const autoAliases = generateLocationAliases(input.location);
  const suppliedAliases = input.locationAliases || [];
  const mergedAliases = Array.from(new Set([...autoAliases, ...suppliedAliases]));

  const initialStatusEvent: StatusEvent = {
    status: 'Active',
    at: now,
    note: 'Initial user report submission',
  };

  const newReport: AccessibilityReport = {
    id,
    location: input.location.trim(),
    locationAliases: mergedAliases,
    locationDetail: input.locationDetail?.trim() || undefined,
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    reportedAt: now,
    status: 'Active',
    source: 'User-submitted',
    isSample: false,
    reporterContext: input.reporterContext,
    photoDataUrl: input.photoDataUrl,
    statusHistory: [initialStatusEvent],
    isLocalDeviceSubmission: true,
  };

  // 1. Confirm reports store is healthy and read successfully
  const reportsResult = getAllReportsWithStatus();
  if (!reportsResult.success) {
    return {
      success: false,
      error: reportsResult.error || 'Cannot save report: stored report data is unreadable or corrupted.',
      isSecurityError: reportsResult.isSecurityError,
    };
  }

  // 2. Confirm my_reports index is healthy
  const myReportsResult = getMyReportsWithStatus();
  if (!myReportsResult.success && myReportsResult.status !== 'ok') {
    return {
      success: false,
      error: myReportsResult.error || 'Cannot save report: stored local reports index is unreadable or corrupted.',
      isSecurityError: myReportsResult.isSecurityError,
    };
  }

  // 3. Capture snapshots before any write for safe rollback
  let snapshots: KeySnapshot[];
  try {
    snapshots = [
      snapshotKey(STORAGE_KEYS.REPORTS),
      snapshotKey(STORAGE_KEYS.MY_REPORTS),
    ];
  } catch (snapErr) {
    const cls = classifyStorageError(snapErr);
    return { success: false, error: cls.message, isSecurityError: cls.isSecurity };
  }

  const current = reportsResult.reports;
  const myIds = myReportsResult.ids;
  const updated = [newReport, ...current];
  const updatedMyIds = [id, ...myIds];

  try {
    // Write 1: Main reports array
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));

    // Write 2: Local reports index
    localStorage.setItem(STORAGE_KEYS.MY_REPORTS, JSON.stringify(updatedMyIds));

    return { success: true, report: newReport };
  } catch (err: unknown) {
    console.error('Failed to save report to localStorage, initiating rollback:', err);

    const rbOk = rollbackSnapshots(snapshots);
    const cls = classifyStorageError(err);

    let errorMessage: string;
    if (!rbOk) {
      errorMessage = 'Failed to save report, and state rollback also failed. Please check available disk space or permissions.';
    } else if (cls.isQuota) {
      errorMessage = 'Local storage quota exceeded. The attached photograph or stored report data exceeds your browser quota. Please try submitting without an image or remove older local reports.';
    } else {
      errorMessage = cls.message;
    }

    return {
      success: false,
      error: errorMessage,
      isQuotaError: cls.isQuota,
      isSecurityError: cls.isSecurity,
      rollbackFailed: !rbOk,
    };
  }
}

// ---------------------------------------------------------------------------
// Update report status
// ---------------------------------------------------------------------------

/**
 * Updates a report's status in demo moderation mode.
 * Appends a new event to statusHistory without erasing original report content.
 * Returns a typed result so the UI can show specific error messages.
 */
export function updateReportStatus(
  id: string,
  newStatus: ReportStatus,
  note?: string
): UpdateStatusResult {
  if (typeof localStorage === 'undefined') {
    return {
      success: false,
      error: 'Browser localStorage is not available.',
      reason: 'storage_unavailable',
    };
  }

  // 1. Confirm reports store is healthy and read successfully
  const reportsResult = getAllReportsWithStatus();
  if (!reportsResult.success) {
    return {
      success: false,
      error: reportsResult.error || 'Cannot update report status: stored report data is unreadable or corrupted.',
      isSecurityError: reportsResult.isSecurityError,
      reason: reportsResult.isSecurityError ? 'security_error' : 'storage_read_error',
    };
  }

  let snapshots: KeySnapshot[];
  try {
    snapshots = [snapshotKey(STORAGE_KEYS.REPORTS)];
  } catch (readErr) {
    const cls = classifyStorageError(readErr);
    return {
      success: false,
      error: cls.message,
      isSecurityError: cls.isSecurity,
      reason: cls.isSecurity ? 'security_error' : 'storage_read_error',
    };
  }

  const reports = reportsResult.reports;
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) {
    return {
      success: false,
      error: `Report with ID "${id}" was not found.`,
      reason: 'not_found',
    };
  }

  const now = new Date().toISOString();
  const newHistoryEvent: StatusEvent = {
    status: newStatus,
    at: now,
    note: note?.trim() || `Demo status changed to ${newStatus}`,
  };

  const updatedReport: AccessibilityReport = {
    ...reports[index],
    status: newStatus,
    statusHistory: [...(reports[index].statusHistory || []), newHistoryEvent],
  };

  const updatedReports = [...reports];
  updatedReports[index] = updatedReport;

  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));
    return {
      success: true,
      report: updatedReport,
      reason: 'success',
    };
  } catch (err) {
    console.error('Failed to update report status in localStorage, rolling back:', err);
    const rbOk = rollbackSnapshots(snapshots);
    const cls = classifyStorageError(err);

    return {
      success: false,
      error: rbOk
        ? cls.isQuota
          ? 'Browser storage quota exceeded while updating status. The report status was not changed.'
          : cls.isSecurity
          ? 'Storage access blocked by browser security settings (SecurityError). The report status was not changed.'
          : 'Failed to write updated report status to browser storage. The report status was not changed.'
        : 'Failed to update report status, and state rollback also failed. Storage may be inconsistent.',
      isQuotaError: cls.isQuota,
      isSecurityError: cls.isSecurity,
      rollbackFailed: !rbOk,
      reason: !rbOk
        ? 'rollback_failed'
        : cls.isQuota
        ? 'quota_error'
        : cls.isSecurity
        ? 'security_error'
        : 'write_error',
    };
  }
}

// ---------------------------------------------------------------------------
// Delete report
// ---------------------------------------------------------------------------

/**
 * Deletes a locally submitted report from storage with transactional rollback.
 * Rejects sample demo records and reports not created on this browser.
 */
export function deleteLocalReport(id: string): DeleteReportResult {
  if (typeof localStorage === 'undefined') {
    return {
      success: false,
      error: 'Browser local storage is not available in this environment.',
    };
  }

  // 1. Confirm reports store is healthy and read successfully
  const reportsResult = getAllReportsWithStatus();
  if (!reportsResult.success) {
    return {
      success: false,
      error: reportsResult.error || 'Cannot delete report: stored report data is unreadable or corrupted.',
      isSecurityError: reportsResult.isSecurityError,
    };
  }

  // 2. Confirm my_reports index is healthy
  const myReportsResult = getMyReportsWithStatus();
  if (!myReportsResult.success && myReportsResult.status !== 'ok') {
    return {
      success: false,
      error: myReportsResult.error || 'Cannot delete report: stored local reports index is unreadable or corrupted.',
      isSecurityError: myReportsResult.isSecurityError,
    };
  }

  let snapshots: KeySnapshot[];
  try {
    snapshots = [
      snapshotKey(STORAGE_KEYS.REPORTS),
      snapshotKey(STORAGE_KEYS.MY_REPORTS),
    ];
  } catch (readErr) {
    const cls = classifyStorageError(readErr);
    return { success: false, error: cls.message, isSecurityError: cls.isSecurity };
  }

  const reports = reportsResult.reports;
  const myIds = myReportsResult.ids;

  // Reject unknown IDs
  const targetReport = reports.find((r) => r.id === id);
  if (!targetReport) {
    return { success: false, error: `Report with ID "${id}" was not found.` };
  }

  // Reject sample / demo reports
  if (targetReport.isSample || targetReport.source === 'Sample' || id.startsWith('demo-')) {
    return { success: false, error: 'Sample demonstration records cannot be deleted.' };
  }

  // Reject reports not submitted on this browser:
  // Must NOT allow deletion based only on source === 'User-submitted'.
  // A report is deletable ONLY if its ID is in the local My Reports index or it has isLocalDeviceSubmission === true.
  const isMine = myIds.includes(id) || targetReport.isLocalDeviceSubmission === true;
  if (!isMine) {
    return { success: false, error: 'Only reports submitted from this browser can be deleted.' };
  }

  const filtered = reports.filter((r) => r.id !== id);
  const updatedMyIds = myIds.filter((myId) => myId !== id);

  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));
    localStorage.setItem(STORAGE_KEYS.MY_REPORTS, JSON.stringify(updatedMyIds));
    return { success: true };
  } catch (err) {
    console.error('Failed to delete report from localStorage, rolling back:', err);
    const rbOk = rollbackSnapshots(snapshots);
    const cls = classifyStorageError(err);

    return {
      success: false,
      error: rbOk
        ? cls.message + ' The report was not deleted.'
        : 'Storage write failed during deletion, and state rollback also failed.',
      isSecurityError: cls.isSecurity,
      isQuotaError: cls.isQuota,
      rollbackFailed: !rbOk,
    };
  }
}

// ---------------------------------------------------------------------------
// Clear all data
// ---------------------------------------------------------------------------

/**
 * Clears all data completely.
 */
export function clearAllData(): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.MY_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.SEED_VERSION);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
}
