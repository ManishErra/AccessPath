import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeStorage,
  getAllReports,
  getReportById,
  saveReport,
  updateReportStatus,
  deleteLocalReport,
  getMyReports,
  resetSampleDataOnly,
} from '../storage';
import { filterAndSortReports } from '../search';

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

describe('Complete AccessPath User Flow Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('runs complete lifecycle: explore -> search -> submit -> verify My Reports -> moderate -> delete', () => {
    // 1. Initial Launch
    const initialReports = initializeStorage();
    expect(initialReports.length).toBe(4);
    expect(initialReports.every((r) => r.isSample)).toBe(true);

    // 2. Search flows
    // 2a. Search Block 34
    const b34Results = filterAndSortReports(getAllReports(), {
      query: 'Block 34',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(b34Results.length).toBe(1);
    expect(b34Results[0].id).toBe('demo-b34-lift-001');

    // 2b. Search B34 alias
    const aliasResults = filterAndSortReports(getAllReports(), {
      query: 'B34',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(aliasResults.length).toBe(1);
    expect(aliasResults[0].id).toBe('demo-b34-lift-001');

    // 2c. Search keywords: ramp and signage
    const rampResults = filterAndSortReports(getAllReports(), {
      query: 'ramp',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(rampResults.some((r) => r.id === 'demo-signage-003')).toBe(true);

    const signageResults = filterAndSortReports(getAllReports(), {
      query: 'signage',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(signageResults.some((r) => r.id === 'demo-signage-003')).toBe(true);

    // 2d. Search unrecorded block
    const unknownResults = filterAndSortReports(getAllReports(), {
      query: 'Block 99',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(unknownResults.length).toBe(0);

    // 3. User Submits a New Report
    const submissionResult = saveReport({
      location: 'Block 12',
      locationDetail: 'Ground floor west entrance',
      category: 'Accessible Washroom',
      title: 'Accessible washroom door latch broken',
      description: 'The latch on the accessible stall cannot be secured from the inside.',
      reporterContext: 'Experienced it',
    });

    expect(submissionResult.success).toBe(true);
    expect(submissionResult.report).toBeDefined();
    const newReportId = submissionResult.report!.id;

    // 4. Verify Immediate Appearance in Storage & Search
    const allAfterSubmit = getAllReports();
    expect(allAfterSubmit.length).toBe(5);
    expect(allAfterSubmit.some((r) => r.id === newReportId)).toBe(true);

    // Search for newly submitted report by location and alias
    const searchNewReport = filterAndSortReports(allAfterSubmit, {
      query: 'Block 12',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(searchNewReport.length).toBe(1);
    expect(searchNewReport[0].id).toBe(newReportId);

    const searchNewAlias = filterAndSortReports(allAfterSubmit, {
      query: 'B12',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(searchNewAlias.length).toBe(1);
    expect(searchNewAlias[0].id).toBe(newReportId);

    // 5. Verify My Reports
    const myReports = getMyReports();
    expect(myReports.length).toBe(1);
    expect(myReports[0].id).toBe(newReportId);
    expect(myReports[0].source).toBe('User-submitted');

    // 6. Demo Moderation Triage
    const moderated = updateReportStatus(
      newReportId,
      'Under review',
      'Dispatched campus maintenance technician for lock repair'
    );

    expect(moderated.success).toBe(true);
    expect(moderated.report).toBeDefined();
    expect(moderated.report?.status).toBe('Under review');
    expect(moderated.report?.title).toBe('Accessible washroom door latch broken');
    expect(moderated.report?.description).toBe('The latch on the accessible stall cannot be secured from the inside.');
    expect(moderated.report?.statusHistory.length).toBe(2);
    expect(moderated.report?.statusHistory[1].status).toBe('Under review');
    expect(moderated.report?.statusHistory[1].note).toContain('Dispatched campus maintenance');

    // 7. Verify Safe Sample Refresh does not erase user's report
    const refreshed = resetSampleDataOnly();
    expect(refreshed.length).toBe(5);
    expect(refreshed.some((r) => r.id === newReportId)).toBe(true);
    expect(getMyReports().some((r) => r.id === newReportId)).toBe(true);

    // 8. Delete Report from My Reports
    const deleted = deleteLocalReport(newReportId);
    expect(deleted.success).toBe(true);

    // Verify deletion propagated
    expect(getMyReports().length).toBe(0);
    expect(getAllReports().length).toBe(4);
    expect(getReportById(newReportId)).toBeUndefined();

    // Search for Block 12 returns empty again
    const searchDeleted = filterAndSortReports(getAllReports(), {
      query: 'Block 12',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(searchDeleted.length).toBe(0);
  });
});
