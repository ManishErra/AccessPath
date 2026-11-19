import { AccessibilityReport, SearchFilters } from '../types';

/**
 * Normalizes text by lowercasing, replacing punctuation/symbols with spaces,
 * and collapsing consecutive whitespace.
 * e.g., "  B---34!!  " -> "b 34"
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes text to a compact form (stripping all whitespace and punctuation).
 * e.g., "B-34" -> "b34", "Block 34" -> "block34", "B   -   34" -> "b34"
 */
export function compactText(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

/**
 * Helper to escape regex special characters.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks whether an accessibility report matches a search query string.
 * Matches across: location, locationAliases, locationDetail, category, title, description.
 */
export function matchesSearchQuery(
  report: AccessibilityReport,
  rawQuery: string
): boolean {
  const query = rawQuery.trim();
  if (!query) return true;

  const normQuery = normalizeText(query);
  const compQuery = compactText(query);
  const queryTokens = normQuery.split(' ').filter(Boolean);

  if (queryTokens.length === 0) return true;

  // Prepare searchable text fields from report
  const normLocation = normalizeText(report.location);
  const compLocation = compactText(report.location);

  const normAliases = report.locationAliases.map(normalizeText);
  const compAliases = report.locationAliases.map(compactText);

  const normDetail = normalizeText(report.locationDetail || '');
  const normCategory = normalizeText(report.category);
  const normTitle = normalizeText(report.title);
  const normDesc = normalizeText(report.description);

  // 1. Exact or prefix compact match for building codes and aliases
  // e.g. "b34", "b-34", "block34" matching aliases like "b34", "b-34", "block 34"
  if (compQuery.length >= 2) {
    if (compLocation === compQuery) return true;
    if (compAliases.some((alias) => alias === compQuery)) return true;
  }

  // 2. Word-boundary normalized phrase match in any field
  const allNormFields = [
    normLocation,
    ...normAliases,
    normDetail,
    normCategory,
    normTitle,
    normDesc,
  ];

  // Use word-boundary regex to prevent partial numeric matches
  // (e.g. "block 3" must NOT match "block 34" or "block 33")
  const phraseRegex = new RegExp(`\\b${escapeRegExp(normQuery)}\\b`, 'i');
  if (allNormFields.some((field) => phraseRegex.test(field))) {
    return true;
  }

  // 3. Multi-token match: every search token must match somewhere in the report.
  // To avoid false positives (e.g. search "3" or "Block 3" incorrectly matching "Block 34"),
  // numeric tokens must match on exact word boundaries or exact numeric segments.
  const searchableWords = allNormFields.join(' ').split(' ').filter(Boolean);
  const combinedCompactTokens = [compLocation, ...compAliases];

  const allTokensMatch = queryTokens.every((token) => {
    // If token is purely numeric (e.g. "3", "4", "33", "34"):
    if (/^\d+$/.test(token)) {
      // Must match as an exact word in the text, or exact numeric segment in compact codes
      const matchesWord = searchableWords.some((word) => word === token);
      const matchesCompactCode = combinedCompactTokens.some((code) => {
        const numMatch = code.match(/\d+/);
        return numMatch ? numMatch[0] === token : code === token;
      });
      return matchesWord || matchesCompactCode;
    }

    // If token is a building code like "b34" or "b33"
    if (/^b\d+$/i.test(token)) {
      return combinedCompactTokens.some((code) => code === token.toLowerCase());
    }

    // For words (e.g. "lift", "ramp", "signage", "pathway", "block"):
    // Check if any word equals or starts with the token (prefix match)
    if (token.length >= 3) {
      if (searchableWords.some((word) => word.startsWith(token) || word === token)) {
        return true;
      }
    } else {
      if (searchableWords.some((word) => word === token)) {
        return true;
      }
    }

    // Check alias list for match
    if (normAliases.some((alias) => alias.includes(token))) {
      return true;
    }

    // Fallback: check whole field regex
    const regex = new RegExp(`\\b${escapeRegExp(token)}`, 'i');
    return allNormFields.some((field) => regex.test(field));
  });

  return allTokensMatch;
}

/**
 * Filters and sorts reports according to user search filters.
 */
export function filterAndSortReports(
  reports: AccessibilityReport[],
  filters: SearchFilters
): AccessibilityReport[] {
  return reports
    .filter((report) => {
      // 1. Search query filter
      if (filters.query && !matchesSearchQuery(report, filters.query)) {
        return false;
      }

      // 2. Status filter
      if (filters.status !== 'All' && report.status !== filters.status) {
        return false;
      }

      // 3. Category filter
      if (filters.category !== 'All' && report.category !== filters.category) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.reportedAt).getTime();
      const timeB = new Date(b.reportedAt).getTime();
      return filters.sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
    });
}
