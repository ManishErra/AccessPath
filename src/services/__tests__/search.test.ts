import { describe, it, expect } from 'vitest';
import { normalizeText, compactText, matchesSearchQuery, filterAndSortReports } from '../search';
import { SEED_REPORTS } from '../../data/seedReports';

describe('Search Normalization and Matching', () => {
  it('normalizes text properly (lowercases, strips punctuation, collapses spaces)', () => {
    expect(normalizeText('  Block---34!!  ')).toBe('block 34');
    expect(normalizeText('Lift / Elevator')).toBe('lift elevator');
    expect(normalizeText('B   -   34')).toBe('b 34');
  });

  it('compacts text properly for code/alias matching', () => {
    expect(compactText('B-34')).toBe('b34');
    expect(compactText('B   -   34')).toBe('b34');
    expect(compactText('Block 33')).toBe('block33');
  });

  it('matches exact block name "Block 34" and case variations', () => {
    const report34 = SEED_REPORTS.find((r) => r.id === 'demo-b34-lift-001')!;
    expect(matchesSearchQuery(report34, 'Block 34')).toBe(true);
    expect(matchesSearchQuery(report34, 'block 34')).toBe(true);
    expect(matchesSearchQuery(report34, 'BLOCK 34')).toBe(true);
  });

  it('matches aliases "B34", "B-34", "Block-34", and "Block34" for Block 34', () => {
    const report34 = SEED_REPORTS.find((r) => r.id === 'demo-b34-lift-001')!;
    expect(matchesSearchQuery(report34, 'B34')).toBe(true);
    expect(matchesSearchQuery(report34, 'b34')).toBe(true);
    expect(matchesSearchQuery(report34, 'B-34')).toBe(true);
    expect(matchesSearchQuery(report34, 'b-34')).toBe(true);
    expect(matchesSearchQuery(report34, 'Block-34')).toBe(true);
    expect(matchesSearchQuery(report34, 'block-34')).toBe(true);
    expect(matchesSearchQuery(report34, 'Block34')).toBe(true);
    expect(matchesSearchQuery(report34, 'block34')).toBe(true);
    expect(matchesSearchQuery(report34, 'B   -   34')).toBe(true);
  });

  it('matches "Block 33" and alias "B33" for Block 33', () => {
    const report33 = SEED_REPORTS.find((r) => r.id === 'demo-b33-lift-002')!;
    expect(matchesSearchQuery(report33, 'Block 33')).toBe(true);
    expect(matchesSearchQuery(report33, 'B33')).toBe(true);
    expect(matchesSearchQuery(report33, 'b-33')).toBe(true);
    expect(matchesSearchQuery(report33, 'Block-33')).toBe(true);
    expect(matchesSearchQuery(report33, 'Block34')).toBe(false);
  });

  it('strictly ensures "Block 3" does NOT falsely match "Block 33" or "Block 34"', () => {
    const report34 = SEED_REPORTS.find((r) => r.id === 'demo-b34-lift-001')!;
    const report33 = SEED_REPORTS.find((r) => r.id === 'demo-b33-lift-002')!;

    // Block 3 must NOT match Block 34
    expect(matchesSearchQuery(report34, 'Block 3')).toBe(false);
    expect(matchesSearchQuery(report34, 'block 3')).toBe(false);
    expect(matchesSearchQuery(report34, 'B3')).toBe(false);
    expect(matchesSearchQuery(report34, 'b3')).toBe(false);

    // Block 3 must NOT match Block 33
    expect(matchesSearchQuery(report33, 'Block 3')).toBe(false);
    expect(matchesSearchQuery(report33, 'block 3')).toBe(false);
    expect(matchesSearchQuery(report33, 'B3')).toBe(false);
    expect(matchesSearchQuery(report33, 'b3')).toBe(false);

    // Filter and sort over all seed reports for "Block 3" must yield 0 results
    const resultsForBlock3 = filterAndSortReports(SEED_REPORTS, {
      query: 'Block 3',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });
    expect(resultsForBlock3.length).toBe(0);
  });

  it('matches keyword "lift" across categories and descriptions', () => {
    const liftReports = SEED_REPORTS.filter((r) => matchesSearchQuery(r, 'lift'));
    expect(liftReports.length).toBeGreaterThanOrEqual(2);
    expect(liftReports.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);
    expect(liftReports.some((r) => r.id === 'demo-b33-lift-002')).toBe(true);
  });

  it('matches keyword "ramp" across records with ramp references', () => {
    const rampReports = SEED_REPORTS.filter((r) => matchesSearchQuery(r, 'ramp'));
    expect(rampReports.length).toBeGreaterThanOrEqual(1);
    expect(rampReports.some((r) => r.id === 'demo-signage-003')).toBe(true);
  });

  it('matches keyword "signage" for signage reports', () => {
    const signageReports = SEED_REPORTS.filter((r) => matchesSearchQuery(r, 'signage'));
    expect(signageReports.length).toBeGreaterThanOrEqual(1);
    expect(signageReports.some((r) => r.id === 'demo-signage-003')).toBe(true);
  });

  it('matches keyword "pathway" for pathway reports', () => {
    const pathwayReports = SEED_REPORTS.filter((r) => matchesSearchQuery(r, 'pathway'));
    expect(pathwayReports.length).toBeGreaterThanOrEqual(1);
    expect(pathwayReports.some((r) => r.id === 'demo-pathway-004')).toBe(true);
  });

  it('strictly ensures "Block 33" does NOT match "Block 34" and vice versa', () => {
    const report34 = SEED_REPORTS.find((r) => r.id === 'demo-b34-lift-001')!;
    const report33 = SEED_REPORTS.find((r) => r.id === 'demo-b33-lift-002')!;

    // Block 33 must NOT match Block 34
    expect(matchesSearchQuery(report34, 'Block 33')).toBe(false);
    expect(matchesSearchQuery(report34, 'block 33')).toBe(false);
    expect(matchesSearchQuery(report34, 'B33')).toBe(false);
    expect(matchesSearchQuery(report34, 'b33')).toBe(false);
    expect(matchesSearchQuery(report34, 'B-33')).toBe(false);
    expect(matchesSearchQuery(report34, 'Block-33')).toBe(false);
    expect(matchesSearchQuery(report34, 'Block33')).toBe(false);

    // Block 34 must NOT match Block 33
    expect(matchesSearchQuery(report33, 'Block 34')).toBe(false);
    expect(matchesSearchQuery(report33, 'block 34')).toBe(false);
    expect(matchesSearchQuery(report33, 'B34')).toBe(false);
    expect(matchesSearchQuery(report33, 'b34')).toBe(false);
    expect(matchesSearchQuery(report33, 'B-34')).toBe(false);
    expect(matchesSearchQuery(report33, 'Block-34')).toBe(false);
    expect(matchesSearchQuery(report33, 'Block34')).toBe(false);
  });

  it('does NOT match Block 34 if searching for an unrecorded block like "Block 99"', () => {
    const report34 = SEED_REPORTS.find((r) => r.id === 'demo-b34-lift-001')!;
    expect(matchesSearchQuery(report34, 'Block 99')).toBe(false);
  });

  it('filters and sorts reports correctly when combining multiple filters', () => {
    const filtered = filterAndSortReports(SEED_REPORTS, {
      query: 'lift',
      status: 'Active',
      category: 'Lift / Elevator',
      sortBy: 'newest',
    });

    expect(filtered.every((r) => r.status === 'Active')).toBe(true);
    expect(filtered.every((r) => r.category === 'Lift / Elevator')).toBe(true);
    expect(filtered.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);
  });

  it('clearing filters restores all stored reports', () => {
    const all = filterAndSortReports(SEED_REPORTS, {
      query: '',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });

    expect(all.length).toBe(SEED_REPORTS.length);
  });

  it('returns empty array when query finds no matches', () => {
    const emptyResults = filterAndSortReports(SEED_REPORTS, {
      query: 'NonExistentBuildingXYZ',
      status: 'All',
      category: 'All',
      sortBy: 'newest',
    });

    expect(emptyResults.length).toBe(0);
  });

  it('comprehensive search verification: Block 3, Block 33, Block 34, B33, B34, B-34, Block-34, Block34, Lift, Ramp, Signage, Pathway, Block 99', () => {
    // 1. Block 3 must NEVER match Block 33 or Block 34
    const resBlock3 = filterAndSortReports(SEED_REPORTS, { query: 'Block 3', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBlock3.length).toBe(0);

    // 2. Block 33
    const resBlock33 = filterAndSortReports(SEED_REPORTS, { query: 'Block 33', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBlock33.some((r) => r.id === 'demo-b33-lift-002')).toBe(true);

    // 3. Block 34
    const resBlock34 = filterAndSortReports(SEED_REPORTS, { query: 'Block 34', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBlock34.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);

    // 4. B33
    const resB33 = filterAndSortReports(SEED_REPORTS, { query: 'B33', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resB33.some((r) => r.id === 'demo-b33-lift-002')).toBe(true);

    // 5. B34
    const resB34 = filterAndSortReports(SEED_REPORTS, { query: 'B34', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resB34.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);

    // 6. B-34
    const resBDash34 = filterAndSortReports(SEED_REPORTS, { query: 'B-34', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBDash34.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);

    // 7. Block-34
    const resBlockDash34 = filterAndSortReports(SEED_REPORTS, { query: 'Block-34', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBlockDash34.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);

    // 8. Block34
    const resBlockConcat34 = filterAndSortReports(SEED_REPORTS, { query: 'Block34', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBlockConcat34.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);

    // 9. Lift
    const resLift = filterAndSortReports(SEED_REPORTS, { query: 'Lift', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resLift.length).toBeGreaterThanOrEqual(2);
    expect(resLift.some((r) => r.id === 'demo-b34-lift-001')).toBe(true);

    // 10. Ramp
    const resRamp = filterAndSortReports(SEED_REPORTS, { query: 'Ramp', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resRamp.length).toBeGreaterThanOrEqual(1);

    // 11. Signage
    const resSignage = filterAndSortReports(SEED_REPORTS, { query: 'Signage', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resSignage.length).toBeGreaterThanOrEqual(1);

    // 12. Pathway
    const resPathway = filterAndSortReports(SEED_REPORTS, { query: 'Pathway', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resPathway.length).toBeGreaterThanOrEqual(1);

    // 13. Block 99 (unrecorded block)
    const resBlock99 = filterAndSortReports(SEED_REPORTS, { query: 'Block 99', status: 'All', category: 'All', sortBy: 'newest' });
    expect(resBlock99.length).toBe(0);
  });
});
