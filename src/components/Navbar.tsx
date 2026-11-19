import React, { useState } from 'react';
import { useRouter } from '../router';
import { Compass, Search, PlusCircle, Bookmark, ShieldCheck, HelpCircle, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { route, navigate, navigateToSubmit, navigateToSearch } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (name: string) => {
    return route.name === name;
  };

  const handleNav = (to: string) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand / Logo */}
        <div
          onClick={() => handleNav('#/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNav('#/');
          }}
          aria-label="AccessPath Home"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-light)',
            }}
          >
            <Compass size={22} aria-hidden="true" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-primary)',
                }}
              >
                Access<span style={{ color: 'var(--color-accent)' }}>Path</span>
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                }}
              >
                Student Prototype
              </span>
            </div>
            <span
              style={{
                display: 'block',
                fontSize: '0.6875rem',
                color: 'var(--color-text-subtle)',
                marginTop: '-1px',
              }}
            >
              Know before you go. Report what you find.
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.25rem',
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => handleNav('#/')}
            className={`nav-link ${isActive('home') ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: isActive('home') ? 'var(--color-accent)' : 'var(--color-text-muted)',
              padding: '0.5rem 0.25rem',
              borderBottom: isActive('home') ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            Home
          </button>

          <button
            onClick={() => navigateToSearch()}
            className={`nav-link ${isActive('search') ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: isActive('search') ? 'var(--color-accent)' : 'var(--color-text-muted)',
              padding: '0.5rem 0.25rem',
              borderBottom: isActive('search') ? '2px solid var(--color-accent)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Search size={15} aria-hidden="true" />
            <span>Search</span>
          </button>

          <button
            onClick={() => handleNav('#/my-reports')}
            className={`nav-link ${isActive('my-reports') ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: isActive('my-reports') ? 'var(--color-accent)' : 'var(--color-text-muted)',
              padding: '0.5rem 0.25rem',
              borderBottom: isActive('my-reports') ? '2px solid var(--color-accent)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Bookmark size={15} aria-hidden="true" />
            <span>My Reports</span>
          </button>

          <button
            onClick={() => handleNav('#/moderation')}
            className={`nav-link ${isActive('moderation') ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: isActive('moderation') ? 'var(--color-accent)' : 'var(--color-text-muted)',
              padding: '0.5rem 0.25rem',
              borderBottom: isActive('moderation') ? '2px solid var(--color-accent)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Demo Moderation</span>
            <span
              style={{
                fontSize: '0.625rem',
                backgroundColor: '#ede9fe',
                color: '#6b21a8',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              Demo
            </span>
          </button>

          <button
            onClick={() => handleNav('#/about')}
            className={`nav-link ${isActive('about') ? 'active' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: isActive('about') ? 'var(--color-accent)' : 'var(--color-text-muted)',
              padding: '0.5rem 0.25rem',
              borderBottom: isActive('about') ? '2px solid var(--color-accent)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <HelpCircle size={15} aria-hidden="true" />
            <span>About</span>
          </button>

          {/* CTA: Report Issue */}
          <button
            onClick={() => navigateToSubmit()}
            className="btn btn-accent btn-sm"
            style={{ gap: '0.35rem', padding: '0.5rem 0.875rem' }}
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span>Report an Issue</span>
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-main)',
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
          className="mobile-nav-drawer"
        >
          <button
            onClick={() => handleNav('#/')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            Home
          </button>
          <button
            onClick={() => {
              navigateToSearch();
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', width: '100%', gap: '0.5rem' }}
          >
            <Search size={16} /> Search Reports
          </button>
          <button
            onClick={() => handleNav('#/my-reports')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', width: '100%', gap: '0.5rem' }}
          >
            <Bookmark size={16} /> My Reports (Local)
          </button>
          <button
            onClick={() => handleNav('#/moderation')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', width: '100%', gap: '0.5rem' }}
          >
            <ShieldCheck size={16} /> Demo Moderation (Local)
          </button>
          <button
            onClick={() => handleNav('#/about')}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', width: '100%', gap: '0.5rem' }}
          >
            <HelpCircle size={16} /> About &amp; Limitations
          </button>
          <button
            onClick={() => {
              navigateToSubmit();
              setMobileMenuOpen(false);
            }}
            className="btn btn-accent"
            style={{ justifyContent: 'center', width: '100%', gap: '0.5rem', marginTop: '0.25rem' }}
          >
            <PlusCircle size={18} /> Report an Issue
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-nav-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

