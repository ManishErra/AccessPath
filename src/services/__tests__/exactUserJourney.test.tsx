import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { App } from '../../App';
import { RouterProvider } from '../../router';
import {
  initializeStorage,
  getAllReports,
  saveReport,
  getMyReportsWithStatus,
} from '../storage';
import { validateReportForm } from '../../utils/validation';

describe('Exact User Journey & Edge Cases Verification', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    window.location.hash = '#/';
    initializeStorage();
    vi.restoreAllMocks();
  });

  it('verifies exact user journey: Open -> Search Block 34 -> Open report -> Return to search -> Submit report -> View confirmation -> My Reports -> Moderate -> Verify updated status', async () => {
    // 1. Open AccessPath (Home view wrapped in RouterProvider)
    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );
    expect(screen.getAllByText(/Know before you go/i).length).toBeGreaterThanOrEqual(1);

    // 2. Search for Block 34
    const searchInput = (document.getElementById('home-search-input') ||
      screen.getByPlaceholderText(/Search a block/i)) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Block 34' } });
    const searchBtn = screen.getByRole('button', { name: /^Search$/i });
    fireEvent.click(searchBtn);

    // Hash should now be #/search?q=Block+34 or Block%2034
    expect(window.location.hash).toMatch(/Block(\+|%20)34/);

    // Verify search result shows Block 34 lift report
    expect(screen.getByText(/Question about lift floor coverage/i)).toBeDefined();

    // 3. Open its report
    const reportCard = screen.getByRole('button', { name: /Question about lift floor coverage/i });
    fireEvent.click(reportCard);

    // Should navigate to report details
    expect(window.location.hash).toContain('/report/demo-b34-lift-001');

    // 4. Return to search via search navigation
    const searchNavLinks = screen.getAllByRole('button', { name: /Search/i });
    fireEvent.click(searchNavLinks[0]);
    expect(window.location.hash).toContain('/search');

    // 5. Submit a new report
    // Navigate to submit page
    window.location.hash = '#/submit';
    await act(async () => {
      // Trigger hashchange event
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      await new Promise((r) => setTimeout(r, 20));
    });

    const locationInput = document.getElementById('field-location') as HTMLInputElement;
    const categorySelect = document.getElementById('field-category') as HTMLSelectElement;
    const titleInput = document.getElementById('field-title') as HTMLInputElement;
    const descInput = document.getElementById('field-description') as HTMLTextAreaElement;
    const guidelinesCheckbox = (document.getElementById('field-confirmedGuidelines') ||
      screen.getByRole('checkbox')) as HTMLInputElement;

    fireEvent.change(locationInput, { target: { value: 'Block 14' } });
    fireEvent.change(categorySelect, { target: { value: 'Ramp' } });
    fireEvent.change(titleInput, { target: { value: 'Ramp slope steep without railing' } });
    fireEvent.change(descInput, {
      target: { value: 'The entrance ramp has a very steep incline and is missing continuous grab rails on the left side.' },
    });
    fireEvent.click(guidelinesCheckbox);

    const submitBtn = screen.getByRole('button', { name: /Submit Accessibility Report/i });
    fireEvent.click(submitBtn);

    // 6. View confirmation
    expect(screen.getByText(/Report Submitted Successfully/i)).toBeDefined();

    // 7. Open My Reports
    const viewMyReportsBtn = screen.getByRole('button', { name: /Go to My Reports/i });
    fireEvent.click(viewMyReportsBtn);
    expect(window.location.hash).toBe('#/my-reports');

    // Verify submitted report is displayed in My Reports
    expect(screen.getByText(/Ramp slope steep without railing/i)).toBeDefined();

    // 8. Open the submitted report details
    const myViewDetails = screen.getAllByRole('button', { name: /View Details/i })[0];
    fireEvent.click(myViewDetails);
    expect(window.location.hash).toContain('/report/rep-');

    // 9. Change status in Demo Moderation
    const myReportsData = getMyReportsWithStatus();
    expect(myReportsData.reports.length).toBe(1);
    const submittedId = myReportsData.reports[0].id;

    window.location.hash = `#/moderation?id=${submittedId}`;
    await act(async () => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(screen.getAllByText(/Demo Moderation/i).length).toBeGreaterThanOrEqual(1);

    // Select "Under review" status and update
    const statusSelect = (document.getElementById('mod-status-select') ||
      document.getElementById('mod-status')) as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'Under review' } });

    const noteInput = (document.getElementById('mod-status-note') ||
      document.getElementById('mod-note')) as HTMLTextAreaElement;
    fireEvent.change(noteInput, { target: { value: 'Maintenance dispatched for inspection' } });

    const updateStatusBtn = screen.getByRole('button', { name: /Save Status/i });
    fireEvent.click(updateStatusBtn);

    // 10. Verify updated status
    const refreshedReports = getMyReportsWithStatus();
    expect(refreshedReports.reports[0].status).toBe('Under review');
    expect(refreshedReports.reports[0].statusHistory.length).toBe(2);
    expect(refreshedReports.reports[0].statusHistory[1].note).toBe('Maintenance dispatched for inspection');
  });

  it('tests invalid form submissions, empty search results, and browser refresh persistence', () => {
    // 1. Invalid form submission
    const invalidForm = {
      location: '',
      locationDetail: '',
      category: '' as const,
      title: '',
      description: 'short',
      reporterContext: '' as const,
      confirmedGuidelines: false,
    };
    const validation = validateReportForm(invalidForm);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.location).toBeDefined();
    expect(validation.errors.category).toBeDefined();
    expect(validation.errors.title).toBeDefined();
    expect(validation.errors.description).toBeDefined();
    expect(validation.errors.confirmedGuidelines).toBeDefined();

    // 2. Empty search results (Block 99)
    window.location.hash = '#/search?q=Block%2099';
    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );
    expect(screen.getByText(/No reports found for this search/i)).toBeDefined();
    expect(screen.getByText(/This does not confirm that the location is accessible/i)).toBeDefined();

    // 3. Browser refresh persistence: Data saved in storage persists across refreshes
    saveReport({
      location: 'Block 25',
      category: 'Pathway / Obstruction',
      title: 'Uneven paving stones',
      description: 'Paving stones near Block 25 entrance are uneven and create a tripping hazard.',
    });

    // Simulate page reload by re-reading reports from storage
    const reloaded = getAllReports();
    expect(reloaded.some((r) => r.location === 'Block 25')).toBe(true);
    const myReloaded = getMyReportsWithStatus();
    expect(myReloaded.reports.some((r) => r.location === 'Block 25')).toBe(true);
  });

  it('renders storage read error banner and handles report detail storage failures cleanly without fallback samples', async () => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('accesspath.reports.v1', '{corrupted-json-data');

    window.location.hash = '#/';
    render(
      <RouterProvider>
        <App />
      </RouterProvider>
    );

    // Global storage error banner must be rendered
    expect(screen.getByText(/Browser Storage Error — Unable to Load Accessibility Reports/i)).toBeDefined();

    // Navigate to a report detail page while storage is corrupted
    window.location.hash = '#/report/demo-b34-lift-001';
    await act(async () => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      await new Promise((r) => setTimeout(r, 20));
    });

    // ReportDetailPage must display Storage Read Error and NOT fallback sample data
    expect(screen.getByText(/Storage Read Error/i)).toBeDefined();
    expect(screen.queryByText(/Elevator access — floor coverage concern/i)).toBeNull();

    // Back to Search button preserves navigation
    const backBtn = screen.getByRole('button', { name: /Back to Search/i });
    fireEvent.click(backBtn);
    expect(window.location.hash).toContain('/search');
  });
});
