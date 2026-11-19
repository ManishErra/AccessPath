import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from './router';
import { AllReportsResult, getAllReportsWithStatus } from './services/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { SubmitReportPage } from './pages/SubmitReportPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { DemoModerationPage } from './pages/DemoModerationPage';
import { AboutPage } from './pages/AboutPage';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { route } = useRouter();
  const [reportsResult, setReportsResult] = useState<AllReportsResult>(() => getAllReportsWithStatus());

  const refreshReports = useCallback(() => {
    setReportsResult(getAllReportsWithStatus());
  }, []);

  // Listen to cross-tab or local storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accesspath.reports.v1') {
        refreshReports();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshReports]);

  const reports = reportsResult.reports;

  const renderCurrentPage = () => {
    switch (route.name) {
      case 'home':
        return <HomePage reports={reports} />;
      case 'search':
        return <SearchPage reports={reports} />;
      case 'report-detail':
        return (
          <ReportDetailPage
            reportId={route.id}
            reports={reports}
            storageStatus={reportsResult.status}
            storageError={reportsResult.error}
          />
        );
      case 'submit':
        return <SubmitReportPage onReportSubmitted={refreshReports} />;
      case 'my-reports':
        return <MyReportsPage onReportsChanged={refreshReports} />;
      case 'moderation':
        return <DemoModerationPage reports={reports} onReportsChanged={refreshReports} />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage reports={reports} />;
    }
  };

  return (
    <>
      {/* Keyboard Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Primary Navigation */}
      <Navbar />

      {/* Global Storage Read Error Banner */}
      {!reportsResult.success && (
        <aside
          role="alert"
          aria-label="Browser storage read error"
          className="container"
          style={{
            marginTop: '1.25rem',
            marginBottom: '0.25rem',
          }}
        >
          <div
            style={{
              padding: '0.875rem 1.25rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderLeft: '4px solid #dc2626',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.9375rem',
            }}
          >
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#7f1d1d' }}>
                Browser Storage Error — Unable to Load Accessibility Reports
              </strong>
              <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
                {reportsResult.error || 'Failed to read reports from browser storage. Stored reports cannot be displayed.'}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Main Page Content */}
      <div style={{ flex: 1 }}>{renderCurrentPage()}</div>

      {/* Coherent Footer with Prototype Notices */}
      <Footer onDataReset={refreshReports} />
    </>
  );
};

