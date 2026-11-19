import React from 'react';
import { useRouter } from '../router';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  HelpCircle,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateToSearch, navigateToSubmit } = useRouter();

  return (
    <main id="main-content" tabIndex={-1} style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              color: 'var(--color-text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <HelpCircle size={14} color="var(--color-accent)" />
            <span>Product Documentation &bull; Coursework Prototype</span>
          </div>

          <h1 style={{ fontSize: '2.125rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            About AccessPath
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            A student-led human-centered design prototype created to bridge the information gap regarding campus accessibility barriers.
          </p>
        </div>

        {/* Advisory banner */}
        <DisclaimerBanner />

        {/* Section 1: How It Works */}
        <section
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.375rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
            How the Prototype Works
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Search a Block or Keyword</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Enter standard block designations (e.g., “Block 34”, “B34”, “Block 33”) or accessibility terms (e.g., “lift”, “ramp”, “signage”, “pathway”). The search engine normalizes variations and matches against recorded barrier reports.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Inspect Dates, Context, &amp; Status</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Examine when the report was submitted, whether the reporter experienced or observed it, and whether it has been triaged in this prototype. Remember that reports reflect user observations and are not official university statements.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Submit Structured Issues</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Encounter a locked accessible washroom, an out-of-order lift, or a pathway blocked by construction? Submit an anonymous report with an optional photo in under a minute without needing an account.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Community Awareness</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  The primary goal is giving students transparent, crowd-sourced foresight before traveling across a large campus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Research Context & University Information */}
        <section
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileText size={22} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.375rem', color: 'var(--color-primary)' }}>
              Project Research Context &amp; Public Sources
            </h2>
          </div>

          <div style={{ fontSize: '0.9375rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '1rem' }}>
              AccessPath originated from user research conducted for coursework <strong>INT335-12</strong>. Student interviews and field observation sessions surfaced practical accessibility challenges:
            </p>

            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--color-text-muted)' }}>
              <li>
                <strong>Block 34 lift floor coverage:</strong> Interview findings highlighted student concerns regarding lift floor coverage and accessible floor traversal.
              </li>
              <li>
                <strong>Block 33 lift availability:</strong> Interview participants reported that Block 33 lacks elevator access.
              </li>
              <li>
                <strong>Ramp signage &amp; directional clarity:</strong> Directional signage locating accessible ramps was noted as unclear, making barrier-free routes difficult to locate.
              </li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              Public University Infrastructure Context
            </h3>

            <p style={{ marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>
              Public Lovely Professional University documents state broad commitments to campus accessibility, including lifts in over 80% of buildings, ramps at academic blocks, and dedicated support via the Disability Support Office.
            </p>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                Public Reference Links:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>
                  &bull; LPU Disability Support Office: <span style={{ color: '#0f766e' }}>lpu.in/disability-support-office.php</span>
                </li>
                <li>
                  &bull; LPU Campus Infrastructure: <span style={{ color: '#0f766e' }}>lpu.in/about-lpu/infrastructure.php</span>
                </li>
                <li>
                  &bull; LPU Sustainability &amp; Annual Report: <span style={{ color: '#0f766e' }}>lpu.in/sustainable/doc/annual-report-2024.pdf</span>
                </li>
              </ul>
            </div>

            <p style={{ color: 'var(--color-text-muted)' }}>
              <strong>The Practical Gap:</strong> While high-level institutional infrastructure is present, public websites do not provide live maintenance status, floor-by-floor lift service maps, or temporary obstruction advisories. AccessPath addresses this everyday information gap.
            </p>
          </div>
        </section>

        {/* Section 3: Prototype Limitations & Ethics */}
        <section
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            marginBottom: '2rem',
            borderLeft: '4px solid #b45309',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={22} color="#b45309" />
            <h2 style={{ fontSize: '1.375rem', color: 'var(--color-primary)' }}>
              Non-Negotiable Scope &amp; Honest Limitations
            </h2>
          </div>

          <div style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.75rem' }}>
              To maintain academic integrity and ethical data handling, this prototype operates within strict boundaries:
            </p>

            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <strong>No full-campus map or GPS tracking:</strong> AccessPath uses text/alias matching rather than location tracking, GPS, or route navigation.
              </li>
              <li>
                <strong>No live telemetry or fake counts:</strong> The app does not pretend to monitor elevator sensors in real-time. Report counts reflect local records only.
              </li>
              <li>
                <strong>Empty results do not prove accessibility:</strong> If searching a block returns no reports, the app explicitly reminds users that absence of a report does not guarantee accessibility.
              </li>
              <li>
                <strong>Sample data is clearly badged:</strong> Seed records are labelled &ldquo;Sample report (Demo)&rdquo;.
              </li>
              <li>
                <strong>Zero student identification:</strong> The app does not collect student IDs, names, or contact numbers.
              </li>
              <li>
                <strong>Local device storage:</strong> Reports are kept in browser localStorage. No live university dispatch receives these reports.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Future Scope */}
        <section
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={22} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.375rem', color: 'var(--color-primary)' }}>
              Suggested Future Roadmap
            </h2>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            If adopted for university-wide rollout, future development could incorporate:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Official Verification</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-subtle)' }}>
                Partnership with LPU Disability Support Office to conduct verified building audits.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Facilities Integration</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-subtle)' }}>
                Direct API link to dispatch tickets to campus maintenance teams.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Indoor Accessibility Maps</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-subtle)' }}>
                Accessible corridor and ramp pathfinding with step-free navigation.
              </p>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigateToSearch()} className="btn btn-primary" style={{ gap: '0.35rem' }}>
            <Search size={16} />
            <span>Search Reports</span>
          </button>
          <button onClick={() => navigateToSubmit()} className="btn btn-accent" style={{ gap: '0.35rem' }}>
            <PlusCircle size={16} />
            <span>Submit a Report</span>
          </button>
        </div>
      </div>
    </main>
  );
};
