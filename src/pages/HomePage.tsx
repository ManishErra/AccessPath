import React, { useState } from 'react';
import { useRouter } from '../router';
import { AccessibilityReport, ISSUE_CATEGORIES, IssueCategory } from '../types';
import { ReportCard } from '../components/ReportCard';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Search,
  PlusCircle,
  Building2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

interface HomePageProps {
  reports: AccessibilityReport[];
}

export const HomePage: React.FC<HomePageProps> = ({ reports }) => {
  const { navigateToSearch, navigateToSubmit, navigateToReport, navigate } = useRouter();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch({ query: searchInput.trim() });
  };

  const handleCategoryClick = (cat: IssueCategory) => {
    navigateToSearch({ category: cat });
  };

  // Sort newest reports first for recent feed
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 4);

  // Calculate actual counts from local data
  const totalReportsCount = reports.length;
  const activeReportsCount = reports.filter((r) => r.status === 'Active').length;
  const sampleReportsCount = reports.filter((r) => r.isSample).length;
  const userReportsCount = reports.filter((r) => !r.isSample).length;

  return (
    <main id="main-content" tabIndex={-1} style={{ paddingBottom: '3.5rem' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '3rem 0 2.5rem 0',
        }}
      >
        <div className="container" style={{ maxWidth: '840px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-accent-bg)',
              color: 'var(--color-accent)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            <Shield size={14} />
            <span>Campus Accessibility Information Prototype</span>
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '0.75rem',
              lineHeight: 1.15,
            }}
          >
            Know before you go. <br />
            <span style={{ color: 'var(--color-accent)' }}>Report what you find.</span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.5,
              maxWidth: '680px',
              margin: '0 auto 2rem auto',
            }}
          >
            AccessPath helps students discover user-submitted accessibility barriers—such as lifts, ramps, pathways, and doors—across campus buildings before heading out.
          </p>

          {/* Primary Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Search campus accessibility reports"
            style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--color-border)',
              maxWidth: '680px',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '0.75rem',
                color: 'var(--color-text-subtle)',
              }}
            >
              <Search size={22} aria-hidden="true" />
            </div>

            <label htmlFor="home-search-input" className="sr-only">
              Search a block, building, or issue
            </label>
            <input
              id="home-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search a block, building, or issue (e.g. Block 34, B34, Block 33, lift, ramp)..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                padding: '0.5rem 0.25rem',
                color: 'var(--color-text-main)',
                backgroundColor: 'transparent',
              }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem', gap: '0.35rem' }}
            >
              <span>Search</span>
            </button>
          </form>

          {/* Quick Issue Category Chips */}
          <div style={{ marginTop: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-subtle)',
                marginBottom: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Quick category filters
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="badge badge-category"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                  title={`Filter reports by ${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Prominent Calm Advisory Disclaimer */}
        <DisclaimerBanner />

        {/* Local Demo Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            margin: '1.5rem 0 2.5rem 0',
          }}
        >
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderLeft: '4px solid var(--color-primary)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Layers size={20} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {totalReportsCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                Reports in this demo
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderLeft: '4px solid var(--color-active-text)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-active-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-active-text)',
              }}
            >
              <AlertCircle size={20} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-active-text)' }}>
                {activeReportsCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                Active observations in demo
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderLeft: '4px solid #6b21a8',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b21a8',
              }}
            >
              <Building2 size={20} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6b21a8' }}>
                {sampleReportsCount} / {userReportsCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                Sample vs User-submitted
              </div>
            </div>
          </div>
        </div>

        {/* Action Callout Section */}
        <section
          style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#115e59', marginBottom: '0.35rem' }}>
              Encountered an accessibility barrier on campus?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#134e4a', lineHeight: 1.5 }}>
              Help other students know what to expect. Submit an anonymous report with the block name, barrier type, and optional photograph.
            </p>
          </div>

          <button
            onClick={() => navigateToSubmit()}
            className="btn btn-accent"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <PlusCircle size={18} aria-hidden="true" />
            <span>Report an accessibility issue</span>
          </button>
        </section>

        {/* Recently Reported Grid */}
        <section aria-labelledby="recent-reports-heading" style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h2 id="recent-reports-heading" style={{ fontSize: '1.375rem', color: 'var(--color-primary)' }}>
                Recently Reported Issues
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Showing demo seed records and locally submitted reports.
              </p>
            </div>

            <button
              onClick={() => navigateToSearch()}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.25rem' }}
            >
              <span>View all reports</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} onSelect={navigateToReport} />
            ))}
          </div>
        </section>

        {/* How It Works Explainer Card */}
        <section
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <HelpCircle size={22} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              How AccessPath Works
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.25rem',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                1. Search by Block or Keyword
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Type a block like “Block 34”, alias “B34”, or barrier type “lift” to discover logged reports.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                2. Check Status &amp; Dates
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Review when the barrier was reported and its demonstration status. Remember reports are unverified.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                3. Submit What You Observe
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Encountered a non-functioning lift, broken ramp, or blocked doorway? Submit a brief report in under 60 seconds.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                4. Local Prototype Context
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Reports live in your local browser. No GPS or live lift tracking is used.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              onClick={() => navigate('#/about')}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <span>Read research background &amp; limitations</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

