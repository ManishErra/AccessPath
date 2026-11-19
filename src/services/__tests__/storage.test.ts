import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeStorage,
  getAllReports,
  getAllReportsWithStatus,
  getReportById,
  getReportByIdWithStatus,
  saveReport,
  updateReportStatus,
  deleteLocalReport,
  getMyReports,
  getMyReportsWithStatus,
  resetToDemoData,
  resetSampleDataOnly,
  generateLocationAliases,
  STORAGE_KEYS,
} from '../storage';
import { SEED_REPORTS } from '../../data/seedReports';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage Service & Aliases', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('generates aliases for standard block designations (Block 34, B34, B33)', () => {
    const aliases = generateLocationAliases('Block 34');
    expect(aliases).toContain('b34');
    expect(aliases).toContain('b-34');
    expect(aliases).toContain('block 34');

    const bAliases = generateLocationAliases('B33');
    expect(bAliases).toContain('block 33');
    expect(bAliases).toContain('b33');

    const complexAliases = generateLocationAliases('Block 34, East Wing');
    expect(complexAliases).toContain('b34');
    expect(complexAliases).toContain('block 34');
  });

  it('initializes localStorage with seed reports when empty', () => {
    const initial = initializeStorage();
    expect(initial.length).toBe(SEED_REPORTS.length);
    expect(getAllReports().length).toBe(SEED_REPORTS.length);
  });

  it('saves user-submitted report with required defaults and tracks in myReports', () => {
    initializeStorage();

    const result = saveReport({
      location: 'Block 34',
      locationDetail: 'Main entrance lift',
      category: 'Lift / Elevator',
      title: 'Lift button stuck',
      description: 'Ground floor button fails to register calls intermittently.',
      reporterContext: 'Experienced it',
    });

    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();

    const created = result.report!;
    expect(created.id).toMatch(/^rep-/);
    expect(created.status).toBe('Active');
    expect(created.source).toBe('User-submitted');
    expect(created.isSample).toBe(false);
    expect(created.locationAliases).toContain('b34');
    expect(created.statusHistory.length).toBe(1);

    // Verify it appears in getAllReports()
    const all = getAllReports();
    expect(all.some((r) => r.id === created.id)).toBe(true);

    // Verify it appears in getMyReports()
    const my = getMyReports();
    expect(my.some((r) => r.id === created.id)).toBe(true);
    expect(my.every((r) => r.source === 'User-submitted')).toBe(true);
  });

  it('handles failure on the first localStorage write and leaves store unmodified', () => {
    initializeStorage();
    const countBefore = getAllReports().length;

    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = (key: string, val: string) => {
      if (key === 'accesspath.reports.v1') {
        throw new Error('First write failed (simulated disk error)');
      }
      originalSetItem(key, val);
    };

    try {
      const result = saveReport({
        location: 'Block 34',
        category: 'Lift / Elevator',
        title: 'First write fail test',
        description: 'Should fail immediately and cleanly.',
      });

      expect(result.success).toBe(false);
      expect(result.report).toBeUndefined();
      expect(getAllReports().length).toBe(countBefore);
      expect(getMyReports().length).toBe(0);
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('safely rolls back the first write when failure occurs on the second localStorage write', () => {
    initializeStorage();
    const countBefore = getAllReports().length;
    const initialRaw = localStorage.getItem('accesspath.reports.v1');

    const originalSetItem = localStorageMock.setItem;
    let callCount = 0;

    // Simulate write 1 succeeding, but write 2 (MY_REPORTS) failing
    localStorageMock.setItem = (key: string, val: string) => {
      callCount++;
      if (key === 'accesspath.my_reports.v1') {
        const quotaError = new Error('Second write failed due to quota limit');
        quotaError.name = 'QuotaExceededError';
        throw quotaError;
      }
      originalSetItem(key, val);
    };

    try {
      const result = saveReport({
        location: 'Block 34',
        category: 'Lift / Elevator',
        title: 'Second write fail test',
        description: 'Testing rollback when second key write fails.',
      });

      // 1. Must report failure truthfully
      expect(result.success).toBe(false);
      expect(result.report).toBeUndefined();
      expect(result.isQuotaError).toBe(true);

      // 2. Main reports list must be rolled back to original count
      expect(getAllReports().length).toBe(countBefore);
      expect(localStorage.getItem('accesspath.reports.v1')).toBe(initialRaw);

      // 3. My Reports list must not contain the failed report
      expect(getMyReports().length).toBe(0);
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('safely rolls back deletion if an error occurs while writing storage keys', () => {
    initializeStorage();
    const saveRes = saveReport({
      location: 'Block 34',
      category: 'Ramp',
      title: 'Rollback delete test',
      description: 'Report to test deletion failure rollback.',
    });
    const createdId = saveRes.report!.id;
    expect(getMyReports().some((r) => r.id === createdId)).toBe(true);

    const originalSetItem = localStorageMock.setItem;
    // Simulate failure on second write during delete
    localStorageMock.setItem = (key: string, val: string) => {
      if (key === 'accesspath.my_reports.v1') {
        throw new Error('Deletion second write failed');
      }
      originalSetItem(key, val);
    };

    try {
      const deleted = deleteLocalReport(createdId);
      expect(deleted.success).toBe(false);

      // Report should remain preserved due to rollback
      expect(getAllReports().some((r) => r.id === createdId)).toBe(true);
      expect(getMyReports().some((r) => r.id === createdId)).toBe(true);
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('updates report status without erasing original content and appends to statusHistory', () => {
    initializeStorage();
    const targetId = 'demo-b34-lift-001';
    const original = getReportById(targetId)!;

    const updated = updateReportStatus(
      targetId,
      'Under review',
      'Dispatched campus technician for inspection'
    );

    expect(updated.success).toBe(true);
    expect(updated.report).toBeDefined();
    expect(updated.report?.status).toBe('Under review');
    expect(updated.report?.title).toBe(original.title);
    expect(updated.report?.description).toBe(original.description);
    expect(updated.report?.statusHistory.length).toBe(original.statusHistory.length + 1);

    const latestEvent = updated.report?.statusHistory[updated.report.statusHistory.length - 1];
    expect(latestEvent?.status).toBe('Under review');
    expect(latestEvent?.note).toBe('Dispatched campus technician for inspection');
  });

  it('deletes locally submitted reports', () => {
    initializeStorage();
    const saveRes = saveReport({
      location: 'Block 14',
      category: 'Ramp',
      title: 'Ramp railing loose',
      description: 'The handrail near the entrance ramp needs tightening.',
    });

    const created = saveRes.report!;
    expect(getMyReports().some((r) => r.id === created.id)).toBe(true);

    const deleted = deleteLocalReport(created.id);
    expect(deleted.success).toBe(true);
    expect(getMyReports().some((r) => r.id === created.id)).toBe(false);
    expect(getReportById(created.id)).toBeUndefined();
  });

  it('resets only sample data while strictly preserving user reports', () => {
    initializeStorage();

    // User submits a report
    const saveRes = saveReport({
      location: 'User Block Test',
      category: 'Entrance / Door',
      title: 'User test issue',
      description: 'This is a genuine user submitted report that should not be wiped.',
    });
    const userReportId = saveRes.report!.id;

    // Reset only sample data
    const refreshed = resetSampleDataOnly();

    // User report must still exist in both getAllReports and getMyReports
    expect(refreshed.success).toBe(true);
    expect(refreshed.some((r) => r.id === userReportId)).toBe(true);
    expect(getMyReports().some((r) => r.id === userReportId)).toBe(true);
    // Seed reports must also be present
    expect(refreshed.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);
  });

  it('resets back to full seed demo data when factory reset is triggered', () => {
    initializeStorage();
    saveReport({
      location: 'Temporary Block',
      category: 'Other',
      title: 'Temporary test',
      description: 'This is a test description exceeding fifteen chars.',
    });

    expect(getAllReports().length).toBe(SEED_REPORTS.length + 1);

    const reset = resetToDemoData();
    expect(reset.success).toBe(true);
    expect(reset.length).toBe(SEED_REPORTS.length);
    expect(getMyReports().length).toBe(0);
  });

  // --- NEW TESTS FOR HARDENED ERROR HANDLING & VERIFICATION ---

  it('handles localStorage getItem throwing an error during saveReport', () => {
    initializeStorage();

    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = (key: string) => {
      if (key === 'accesspath.reports.v1') {
        const secErr = new Error('Access denied');
        secErr.name = 'SecurityError';
        throw secErr;
      }
      return originalGetItem(key);
    };

    try {
      const result = saveReport({
        location: 'Block 34',
        category: 'Lift / Elevator',
        title: 'Security error test',
        description: 'Testing getItem throwing security error.',
      });

      expect(result.success).toBe(false);
      expect(result.isSecurityError).toBe(true);
      expect(result.error).toContain('SecurityError');
    } finally {
      localStorageMock.getItem = originalGetItem;
    }
  });

  it('handles localStorage getItem throwing during getAllReports with storage_read_error and empty reports', () => {
    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = () => {
      throw new Error('Read failure');
    };

    try {
      const statusRes = getAllReportsWithStatus();
      expect(statusRes.success).toBe(false);
      expect(statusRes.status).toBe('storage_read_error');
      expect(statusRes.reports).toEqual([]);
      expect(statusRes.error).toContain('Failed to read reports');

      const reports = getAllReports();
      expect(reports).toBeDefined();
      expect(reports).toEqual([]);
    } finally {
      localStorageMock.getItem = originalGetItem;
    }
  });

  it('handles localStorage getItem throwing an error during deleteLocalReport', () => {
    initializeStorage();

    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = () => {
      const secErr = new Error('Storage disabled');
      secErr.name = 'SecurityError';
      throw secErr;
    };

    try {
      const result = deleteLocalReport('any-id');
      expect(result.success).toBe(false);
      expect(result.isSecurityError).toBe(true);
    } finally {
      localStorageMock.getItem = originalGetItem;
    }
  });

  it('reports rollback failures clearly when rollback write also fails during saveReport', () => {
    initializeStorage();

    const originalSetItem = localStorageMock.setItem;
    // Both write and subsequent rollback write fail
    localStorageMock.setItem = () => {
      throw new Error('Persistent storage failure');
    };

    try {
      const result = saveReport({
        location: 'Block 34',
        category: 'Ramp',
        title: 'Rollback fail report',
        description: 'Simulating failure where rollback also fails.',
      });

      expect(result.success).toBe(false);
      expect(result.rollbackFailed).toBe(true);
      expect(result.error).toContain('rollback also failed');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('reports rollback failure clearly when delete rollback write fails', () => {
    initializeStorage();
    const saveRes = saveReport({
      location: 'Block 34',
      category: 'Ramp',
      title: 'Delete rollback fail report',
      description: 'Report to test deletion rollback failure.',
    });
    const createdId = saveRes.report!.id;

    const originalSetItem = localStorageMock.setItem;
    // SetItem throws every time (write fails, and rollback fails)
    localStorageMock.setItem = () => {
      throw new Error('Fatal disk write error');
    };

    try {
      const result = deleteLocalReport(createdId);
      expect(result.success).toBe(false);
      expect(result.rollbackFailed).toBe(true);
      expect(result.error).toContain('rollback also failed');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('strictly rejects deleting sample / demo reports with clear error message', () => {
    initializeStorage();

    // Attempt to delete each sample report
    const sampleIds = ['demo-b34-lift-001', 'demo-b33-lift-002', 'demo-signage-003', 'demo-pathway-004'];

    for (const sampleId of sampleIds) {
      const result = deleteLocalReport(sampleId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Sample demonstration records cannot be deleted');

      // Verify the sample report was not removed
      const report = getReportById(sampleId);
      expect(report).toBeDefined();
      expect(report?.isSample).toBe(true);
    }

    // Verify all 4 sample reports remain in storage
    expect(getAllReports().length).toBe(SEED_REPORTS.length);
  });

  it('strictly rejects deleting unknown report IDs', () => {
    initializeStorage();

    const result = deleteLocalReport('non-existent-report-999');
    expect(result.success).toBe(false);
    expect(result.error).toContain('was not found');
  });

  it('safely handles failure and preserves state during resetSampleDataOnly', () => {
    initializeStorage();
    const userRes = saveReport({
      location: 'Block 55',
      category: 'Lift / Elevator',
      title: 'Block 55 lift issue',
      description: 'Valid description for preserving test.',
    });
    const userId = userRes.report!.id;

    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = () => {
      const err = new Error('Disk quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    };

    try {
      const result = resetSampleDataOnly();
      expect(result.success).toBe(false);
      expect(result.error).toContain('quota exceeded');
      // Original user report was not deleted
      expect(getMyReports().some((r) => r.id === userId)).toBe(true);
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('safely handles failure at every write step during resetSampleDataOnly and rolls back', () => {
    initializeStorage();
    saveReport({
      location: 'Block 55',
      category: 'Lift / Elevator',
      title: 'Block 55 lift issue',
      description: 'Valid description for preserving test.',
    });

    const originalSetItem = localStorageMock.setItem;

    // Test failure at step 2 (INITIALIZED key)
    localStorageMock.setItem = (key: string, val: string) => {
      if (key === 'accesspath.demo.initialized.v1') {
        throw new Error('Write failed at initialized step');
      }
      originalSetItem(key, val);
    };

    try {
      const res = resetSampleDataOnly();
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    } finally {
      localStorageMock.setItem = originalSetItem;
    }

    // Test failure at step 3 (SEED_VERSION key)
    localStorageMock.setItem = (key: string, val: string) => {
      if (key === 'accesspath.seed_version.v2') {
        throw new Error('Write failed at seed version step');
      }
      originalSetItem(key, val);
    };

    try {
      const res = resetSampleDataOnly();
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('reports rollback failure clearly when rollback fails during resetSampleDataOnly', () => {
    initializeStorage();
    const originalSetItem = localStorageMock.setItem;

    // Both initial write and rollback setItem fail
    localStorageMock.setItem = () => {
      throw new Error('Storage completely broken');
    };

    try {
      const res = resetSampleDataOnly();
      expect(res.success).toBe(false);
      expect(res.rollbackFailed).toBe(true);
      expect(res.error).toContain('Rollback also failed');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('safely handles failure during full resetToDemoData', () => {
    initializeStorage();

    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = () => {
      const err = new Error('Security permission denied');
      err.name = 'SecurityError';
      throw err;
    };

    try {
      const result = resetToDemoData();
      expect(result.success).toBe(false);
      expect(result.isSecurityError).toBe(true);
      expect(result.error).toContain('SecurityError');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('safely handles failure at removal step and rollback failure during resetToDemoData', () => {
    initializeStorage();
    const originalRemoveItem = localStorageMock.removeItem;
    const originalSetItem = localStorageMock.setItem;

    // Test failure at removeItem step
    localStorageMock.removeItem = (key: string) => {
      if (key === 'accesspath.my_reports.v1') {
        throw new Error('Remove MY_REPORTS failed');
      }
      originalRemoveItem(key);
    };

    try {
      const result = resetToDemoData();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    } finally {
      localStorageMock.removeItem = originalRemoveItem;
    }

    // Test rollback failure during resetToDemoData
    localStorageMock.setItem = () => {
      throw new Error('Permanent disk error');
    };

    try {
      const result = resetToDemoData();
      expect(result.success).toBe(false);
      expect(result.rollbackFailed).toBe(true);
      expect(result.error).toContain('Rollback also failed');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  // --- TESTS FOR UPDATE STATUS ERROR HANDLING ---

  it('updateReportStatus distinguishes report not found', () => {
    initializeStorage();
    const result = updateReportStatus('non-existent-report-xyz', 'Resolved', 'test note');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('not_found');
    expect(result.error).toContain('was not found');
  });

  it('updateReportStatus distinguishes storage security error', () => {
    initializeStorage();
    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = () => {
      const secErr = new Error('Security error');
      secErr.name = 'SecurityError';
      throw secErr;
    };

    try {
      const result = updateReportStatus('demo-b34-lift-001', 'Resolved', 'note');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('security_error');
      expect(result.isSecurityError).toBe(true);
      expect(result.error).toContain('SecurityError');
    } finally {
      localStorageMock.getItem = originalGetItem;
    }
  });

  it('updateReportStatus distinguishes storage quota error', () => {
    initializeStorage();
    const originalSetItem = localStorageMock.setItem;
    let writeAttempts = 0;
    localStorageMock.setItem = (key: string, val: string) => {
      writeAttempts++;
      if (writeAttempts === 1) {
        const quotaErr = new Error('Quota exceeded');
        quotaErr.name = 'QuotaExceededError';
        throw quotaErr;
      }
      originalSetItem(key, val);
    };

    try {
      const result = updateReportStatus('demo-b34-lift-001', 'Resolved', 'note');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('quota_error');
      expect(result.isQuotaError).toBe(true);
      expect(result.error).toContain('quota exceeded');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  it('updateReportStatus reports rollback failure when rollback write fails', () => {
    initializeStorage();
    const originalSetItem = localStorageMock.setItem;
    // Both write and rollback fail
    localStorageMock.setItem = () => {
      throw new Error('Fatal storage error');
    };

    try {
      const result = updateReportStatus('demo-b34-lift-001', 'Resolved', 'note');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('rollback_failed');
      expect(result.rollbackFailed).toBe(true);
      expect(result.error).toContain('rollback also failed');
    } finally {
      localStorageMock.setItem = originalSetItem;
    }
  });

  // --- TESTS FOR MY REPORTS ERROR HANDLING ---

  it('getMyReportsWithStatus returns empty list when no user reports exist', () => {
    initializeStorage();
    const result = getMyReportsWithStatus();
    expect(result.success).toBe(true);
    expect(result.status).toBe('ok');
    expect(result.reports.length).toBe(0);
    expect(result.ids.length).toBe(0);
  });

  it('getMyReportsWithStatus detects storage read errors without losing data silently', () => {
    initializeStorage();
    saveReport({
      location: 'Block 20',
      category: 'Ramp',
      title: 'Block 20 test report',
      description: 'Checking storage error handling in my reports.',
    });

    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = (key: string) => {
      if (key === 'accesspath.my_reports.v1' || key === 'accesspath.reports.v1') {
        const secErr = new Error('Storage disabled');
        secErr.name = 'SecurityError';
        throw secErr;
      }
      return originalGetItem(key);
    };

    try {
      const result = getMyReportsWithStatus();
      expect(result.success).toBe(false);
      expect(result.status).toBe('storage_read_error');
      expect(result.error).toBeDefined();
    } finally {
      localStorageMock.getItem = originalGetItem;
    }
  });

  // --- NEW TESTS FOR PROTECTING USER REPORTS & INITIALIZATION SAFETY ---

  it('resetSampleDataOnly aborts and returns error when stored data is corrupted or unreadable', () => {
    localStorageMock.setItem('accesspath.reports.v1', '{corrupted json string');
    localStorageMock.setItem('accesspath.initialized', 'true');
    localStorageMock.setItem('accesspath.seed_version', '1.0.0');

    const result = resetSampleDataOnly();
    expect(result.success).toBe(false);
    expect(result.error).toContain('corrupted or unreadable');

    // Verify localStorage key was NOT overwritten with an empty array or seeds
    expect(localStorageMock.getItem('accesspath.reports.v1')).toBe('{corrupted json string');
  });

  it('deleteLocalReport forbids deletion based only on source === "User-submitted"', () => {
    initializeStorage();

    // Fabricate a report that is "User-submitted" from an external source (NOT in local device myIds, isLocalDeviceSubmission false)
    const externalUserReport = {
      id: 'rep-external-user-123',
      location: 'Block 40',
      category: 'Ramp',
      title: 'External report title',
      description: 'Submitted on another device, not in this browser myIds.',
      status: 'Active',
      reportedAt: new Date().toISOString(),
      source: 'User-submitted',
      isSample: false,
      isLocalDeviceSubmission: false,
      locationAliases: ['block 40'],
      statusHistory: [],
    };

    const currentReports = getAllReports();
    localStorageMock.setItem(
      'accesspath.reports.v1',
      JSON.stringify([...currentReports, externalUserReport])
    );
    // Explicitly make sure it is NOT in MY_REPORTS
    localStorageMock.setItem('accesspath.my_reports.v1', JSON.stringify([]));

    const deleteResult = deleteLocalReport('rep-external-user-123');
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toContain('Only reports submitted from this browser can be deleted');

    // Still exists in storage
    expect(getAllReports().some((r) => r.id === 'rep-external-user-123')).toBe(true);
  });

  it('deleteLocalReport allows deletion if report has isLocalDeviceSubmission === true even if not yet in myIds', () => {
    initializeStorage();

    const localReport = {
      id: 'rep-local-device-456',
      location: 'Block 40',
      category: 'Ramp',
      title: 'Local device report',
      description: 'Submitted on this device with isLocalDeviceSubmission true.',
      status: 'Active',
      reportedAt: new Date().toISOString(),
      source: 'User-submitted',
      isSample: false,
      isLocalDeviceSubmission: true,
      locationAliases: ['block 40'],
      statusHistory: [],
    };

    const currentReports = getAllReports();
    localStorageMock.setItem(
      'accesspath.reports.v1',
      JSON.stringify([...currentReports, localReport])
    );
    localStorageMock.setItem('accesspath.my_reports.v1', JSON.stringify([]));

    const deleteResult = deleteLocalReport('rep-local-device-456');
    expect(deleteResult.success).toBe(true);
    expect(getAllReports().some((r) => r.id === 'rep-local-device-456')).toBe(false);
  });

  it('initializeStorage does not overwrite existing reports merely because initialized flag is missing', () => {
    // Storage has valid user report, but initialized flag is missing
    const userReport = {
      id: 'rep-existing-user-999',
      location: 'Block 34',
      category: 'Lift / Elevator',
      title: 'Existing user report',
      description: 'Must not be overwritten by initializeStorage call.',
      status: 'Active',
      reportedAt: new Date().toISOString(),
      source: 'User-submitted',
      isSample: false,
      isLocalDeviceSubmission: true,
      locationAliases: ['block 34', 'b34'],
      statusHistory: [],
    };

    localStorageMock.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([userReport]));
    // initialized flag is intentionally NOT set (null)
    localStorageMock.removeItem(STORAGE_KEYS.INITIALIZED);

    const result = initializeStorage();
    // Must preserve user report
    expect(result.some((r) => r.id === 'rep-existing-user-999')).toBe(true);
    // Should now be initialized
    expect(localStorageMock.getItem(STORAGE_KEYS.INITIALIZED)).toBe('true');
  });

  it('initializeStorage handles corrupted JSON safely without destroying storage', () => {
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, 'corrupted-non-json');
    const result = initializeStorage();

    // Returns fallback seed reports
    expect(result.length).toBe(SEED_REPORTS.length);
    // Does NOT silently overwrite the corrupted string in localStorage
    expect(localStorageMock.getItem(STORAGE_KEYS.REPORTS)).toBe('corrupted-non-json');
  });

  it('initializeStorage handles outdated seed versions while preserving user reports', () => {
    const userReport = {
      id: 'rep-outdated-test-888',
      location: 'Block 33',
      category: 'Ramp',
      title: 'Outdated version user report',
      description: 'Preserved across seed version migration.',
      status: 'Active',
      reportedAt: new Date().toISOString(),
      source: 'User-submitted',
      isSample: false,
      isLocalDeviceSubmission: true,
      locationAliases: ['block 33'],
      statusHistory: [],
    };

    localStorageMock.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([userReport]));
    localStorageMock.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorageMock.setItem(STORAGE_KEYS.SEED_VERSION, 'v1-outdated'); // Outdated

    const result = initializeStorage();
    expect(result.some((r) => r.id === 'rep-outdated-test-888')).toBe(true);
    expect(result.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);
    expect(localStorageMock.getItem(STORAGE_KEYS.SEED_VERSION)).toBe('v2');
  });

  // --- TESTS PROVING SAVE, UPDATE, DELETE DO NOT OVERWRITE CORRUPTED STORAGE ---

  it('saveReport aborts and never overwrites corrupted localStorage with demo seed data', () => {
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, '{bad-json-syntax');
    localStorageMock.setItem(STORAGE_KEYS.MY_REPORTS, JSON.stringify([]));

    const result = saveReport({
      location: 'Block 34',
      category: 'Lift / Elevator',
      title: 'Should not save over corrupt data',
      description: 'Testing corruption protection on saveReport.',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('corrupted');
    // Storage must remain untouched
    expect(localStorageMock.getItem(STORAGE_KEYS.REPORTS)).toBe('{bad-json-syntax');
  });

  it('updateReportStatus aborts and never overwrites corrupted localStorage with demo seed data', () => {
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, '{bad-json-syntax');

    const result = updateReportStatus('demo-b34-lift-001', 'Resolved', 'test note');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('storage_read_error');
    expect(result.error).toContain('corrupted');
    expect(localStorageMock.getItem(STORAGE_KEYS.REPORTS)).toBe('{bad-json-syntax');
  });

  it('deleteLocalReport aborts and never overwrites corrupted localStorage with demo seed data', () => {
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, '{bad-json-syntax');
    localStorageMock.setItem(STORAGE_KEYS.MY_REPORTS, JSON.stringify(['rep-some-id']));

    const result = deleteLocalReport('rep-some-id');

    expect(result.success).toBe(false);
    expect(result.error).toContain('corrupted');
    expect(localStorageMock.getItem(STORAGE_KEYS.REPORTS)).toBe('{bad-json-syntax');
  });

  it('repeated initializeStorage calls never introduce duplicate sample records', () => {
    // 1st initialization
    const first = initializeStorage();
    const countFirst = first.length;

    // 2nd initialization
    const second = initializeStorage();
    expect(second.length).toBe(countFirst);

    // 3rd initialization even if seed version is missing
    localStorageMock.removeItem(STORAGE_KEYS.SEED_VERSION);
    const third = initializeStorage();
    expect(third.length).toBe(countFirst);

    // Ensure sample IDs are strictly unique
    const ids = third.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  // --- TESTS PROVING GET ALL AND GET BY ID DO NOT RETURN FALLBACK SAMPLES ON CORRUPTED STORAGE ---

  it('getAllReportsWithStatus returns success: false and empty reports array when storage is corrupted', () => {
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, '{bad-json-syntax');

    const result = getAllReportsWithStatus();
    expect(result.success).toBe(false);
    expect(result.status).toBe('storage_read_error');
    expect(result.reports).toEqual([]);
    expect(result.error).toContain('corrupted');

    // getAllReports also returns empty array, NOT fallback seed reports
    const fallbackReports = getAllReports();
    expect(fallbackReports).toEqual([]);
  });

  it('getReportByIdWithStatus distinguishes between not_found and storage_read_error', () => {
    // 1. Genuine not_found on healthy storage
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    const notFoundResult = getReportByIdWithStatus('non-existent-report-999');
    expect(notFoundResult.success).toBe(false);
    expect(notFoundResult.status).toBe('not_found');
    expect(notFoundResult.report).toBeUndefined();
    expect(notFoundResult.error).toContain('non-existent-report-999');

    // 2. Storage read error on corrupted storage
    localStorageMock.setItem(STORAGE_KEYS.REPORTS, 'broken-json-string');
    const corruptResult = getReportByIdWithStatus('demo-b34-lift-001');
    expect(corruptResult.success).toBe(false);
    expect(corruptResult.status).toBe('storage_read_error');
    expect(corruptResult.report).toBeUndefined();
    expect(corruptResult.error).toContain('corrupted');

    // getReportById returns undefined, never fallback seed report
    expect(getReportById('demo-b34-lift-001')).toBeUndefined();
  });
});
