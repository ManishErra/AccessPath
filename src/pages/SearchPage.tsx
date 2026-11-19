import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../router';
import {
  AccessibilityReport,
  ISSUE_CATEGORIES,
  REPORT_STATUSES,
  IssueCategory,
  ReportStatus,
  SearchFilters,
} from '../types';
import { filterAndSortReports } from '../services/search';
import { ReportCard } from '../components/ReportCard';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Search as SearchIcon,
  Filter,
  X,
  AlertCircle,
  PlusCircle,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';

interface SearchPageProps {
  reports: AccessibilityReport[];
}

export const SearchPage: React.FC<SearchPageProps> = ({ reports }) => {
  const { route, navigateToReport, navigateToSubmit, navigateToSearch } = useRouter();

  // Parse initial state from route
  const initialQuery = route.name === 'search' ? route.query || '' : '';
  const initialCategory =
    route.name === 'search' && route.category ? (route.category as IssueCategory) : 'All';
  const initialStatus =
    route.name === 'search' && route.status ? (route.status as ReportStatus) : 'All';

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    category: initialCategory,
    status: initialStatus,
    sortBy: 'newest',
  });

  // Sync state if route changes
  useEffect(() => {
    if (route.name === 'search') {
      setFilters((prev) => ({
        ...prev,
        query: route.query || '',
        category: (route.category as IssueCategory) || 'All',
        status: (route.status as ReportStatus) || 'All',
      }));
    }
  }, [route]);

  const filteredReports = useMemo(() => {
    return filterAndSortReports(reports, filters);
  }, [reports, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch({
      query: filters.query,
      category: filters.category,
      status: filters.status,
    });
  };

  const handleClearFilters = () => {
    const resetFilters: SearchFilters = {
      query: '',
      category: 'All',
      status: 'All',
      sortBy: 'newest',
    };
    setFilters(resetFilters);
    navigateToSearch({ query: '' });
  };

  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.category !== 'All' ||
    filters.status !== 'All' ||
    filters.sortBy !== 'newest';

  return (
    <main id="main-content" tabIndex={-1} style={{ padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
            Search Accessibility Reports
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            Look up a block or building, issue keyword, or filter by category to inspect known barriers.
          </p>
        </div>

        {/* Advisory banner */}
        <DisclaimerBanner compact />

        {/* Search & Filter Controls Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '1.75rem',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Main search form */}
          <form onSubmit={handleSearchSubmit} role="search" aria-label="Search filter form">
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    color: 'var(--color-text-subtle)',
                    pointerEvents: 'none',
                    display: 'flex',
                  }}
                >
                  <SearchIcon size={18} aria-hidden="true" />
                </div>

                <label htmlFor="search-input" className="sr-only">
                  Search query
                </label>
                <input
                  id="search-input"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Try 'Block 34', 'B34', 'Block 33', 'lift', 'ramp', 'signage'..."
                />

                {filters.query && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, query: '' })}
                    aria-label="Clear search text"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                Search
              </button>
            </div>

            {/* Filter controls row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-text-subtle)',
                  }}
                >
                  <Filter size={14} aria-hidden="true" />
                  <span>Filters:</span>
                </span>

                {/* Category Select */}
                <div>
                  <label htmlFor="filter-category" className="sr-only">
                    Filter by issue category
                  </label>
                  <select
                    id="filter-category"
                    className="form-select"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem', width: 'auto' }}
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value as SearchFilters['category'] })
                    }
                  >
                    <option value="All">All Categories</option>
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <label htmlFor="filter-status" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="filter-status"
                    className="form-select"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem', width: 'auto' }}
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value as SearchFilters['status'] })
                    }
                  >
                    <option value="All">All Statuses</option>
                    {REPORT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort Order & Clear Filters */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ArrowUpDown size={14} color="var(--color-text-subtle)" aria-hidden="true" />
                  <label htmlFor="filter-sort" className="sr-only">
                    Sort reports
                  </label>
                  <select
                    id="filter-sort"
                    className="form-select"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem', width: 'auto' }}
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })
                    }
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.25rem', fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
                    title="Reset all search filters"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Results Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Showing {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
            {filters.query && <span> for &ldquo;{filters.query}&rdquo;</span>}
          </div>

          <button
            onClick={() => navigateToSubmit({ location: filters.query || undefined })}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <PlusCircle size={14} />
            <span>Submit new report</span>
          </button>
        </div>

        {/* Results List or Empty State */}
        {filteredReports.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} onSelect={navigateToReport} />
            ))}
          </div>
        ) : (
          /* Empty state - REQUIRED TEXT */
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            role="status"
            aria-live="polite"
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fffbeb',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={28} aria-hidden="true" />
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                color: 'var(--color-primary)',
                marginBottom: '0.75rem',
                fontWeight: 700,
              }}
            >
              No reports found for this search.
            </h2>

            <p
              style={{
                fontSize: '1rem',
                color: '#92400e',
                backgroundColor: '#fef3c7',
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 600,
                maxWidth: '600px',
                marginBottom: '1.5rem',
              }}
            >
              This does not confirm that the location is accessible.
            </p>

            <p
              style={{
                color: 'var(--color-text-muted)',
                maxWidth: '520px',
                margin: '0 auto 1.75rem auto',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
              }}
            >
              No reports have been submitted yet matching your criteria. Buildings may still have unrecorded barriers, temporary maintenance, or clear routes.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={handleClearFilters} className="btn btn-secondary">
                Clear search filters
              </button>
              <button
                onClick={() => navigateToSubmit({ location: filters.query || undefined })}
                className="btn btn-accent"
                style={{ gap: '0.35rem' }}
              >
                <PlusCircle size={16} />
                <span>Submit report for {filters.query || 'this location'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

