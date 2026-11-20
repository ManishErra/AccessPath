import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { App } from '../../App';
import { RouterProvider, parseRouteFromLocation } from '../../router';
import { initializeStorage } from '../storage';

describe('Vercel Routing, Direct URL Entry & Browser Refresh Verification', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    initializeStorage();
    vi.restoreAllMocks();
  });

  describe('Direct URL entry with clean pathnames', () => {
    it('loads the Search page directly when visiting /search', () => {
      // Direct browser entry: pathname is /search, hash is empty
      window.history.pushState(null, '', '/search');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      // Verify Search page elements are rendered directly without 404 or falling back to home
      expect(screen.getByRole('heading', { name: /Search Accessibility Reports/i })).toBeDefined();
      expect(document.getElementById('search-input')).toBeDefined();
    });

    it('loads the Search page with prefilled query when visiting /search?q=Block+34', () => {
      window.history.pushState(null, '', '/search?q=Block+34');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      const searchInput = document.getElementById('search-input') as HTMLInputElement;
      expect(searchInput.value).toBe('Block 34');
      // Block 34 report should be displayed
      expect(screen.getByText(/Question about lift floor coverage/i)).toBeDefined();
    });

    it('loads the Submit page directly when visiting /submit', () => {
      window.history.pushState(null, '', '/submit');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      expect(screen.getByRole('heading', { name: /Report an Accessibility Issue/i })).toBeDefined();
      expect(document.getElementById('field-location')).toBeDefined();
      expect(screen.getByRole('button', { name: /Submit Accessibility Report/i })).toBeDefined();
    });

    it('loads the Submit page with prefilled params when visiting /submit?loc=Block+34&cat=Lift%20%2F%20Elevator', () => {
      window.history.pushState(null, '', '/submit?loc=Block+34&cat=Lift%20%2F%20Elevator');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      const locationInput = document.getElementById('field-location') as HTMLInputElement;
      const categorySelect = document.getElementById('field-category') as HTMLSelectElement;
      expect(locationInput.value).toBe('Block 34');
      expect(categorySelect.value).toBe('Lift / Elevator');
    });

    it('loads My Reports directly when visiting /my-reports', () => {
      window.history.pushState(null, '', '/my-reports');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      expect(screen.getByRole('heading', { name: /My Submitted Reports/i })).toBeDefined();
      expect(screen.getByText(/Accessibility barriers reported from this browser/i)).toBeDefined();
    });

    it('loads the About page directly when visiting /about', () => {
      window.history.pushState(null, '', '/about');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      expect(screen.getByRole('heading', { name: /About AccessPath/i })).toBeDefined();
      expect(screen.getByText(/How the Prototype Works/i)).toBeDefined();
    });

    it('loads Report Detail page directly when visiting /report/demo-b34-lift-001', () => {
      window.history.pushState(null, '', '/report/demo-b34-lift-001');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      expect(screen.getByRole('heading', { name: /Question about lift floor coverage/i })).toBeDefined();
      expect(screen.getAllByText(/Block 34/i).length).toBeGreaterThan(0);
    });
  });

  describe('Browser Refresh Simulation on Direct URLs', () => {
    it('keeps user on /search when refreshed', () => {
      window.history.pushState(null, '', '/search');

      const { unmount } = render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /Search Accessibility Reports/i })).toBeDefined();

      // Simulate browser refresh: unmount and remount with the rewritten /index.html served by Vercel
      unmount();
      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /Search Accessibility Reports/i })).toBeDefined();
    });

    it('keeps user on /submit when refreshed', () => {
      window.history.pushState(null, '', '/submit');

      const { unmount } = render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /Report an Accessibility Issue/i })).toBeDefined();

      unmount();
      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /Report an Accessibility Issue/i })).toBeDefined();
    });

    it('keeps user on /my-reports when refreshed', () => {
      window.history.pushState(null, '', '/my-reports');

      const { unmount } = render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /My Submitted Reports/i })).toBeDefined();

      unmount();
      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /My Submitted Reports/i })).toBeDefined();
    });

    it('keeps user on /about when refreshed', () => {
      window.history.pushState(null, '', '/about');

      const { unmount } = render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /About AccessPath/i })).toBeDefined();

      unmount();
      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );
      expect(screen.getByRole('heading', { name: /About AccessPath/i })).toBeDefined();
    });
  });

  describe('Browser Back and Forward Navigation (popstate / hashchange)', () => {
    it('handles navigation and browser popstate/hashchange events correctly', async () => {
      window.history.pushState(null, '', '/#/');

      render(
        <RouterProvider>
          <App />
        </RouterProvider>
      );

      // Verify Home loaded
      expect(screen.getAllByText(/Know before you go/i).length).toBeGreaterThan(0);

      // Navigate to Search via Navbar
      const searchNavButton = screen.getAllByRole('button', { name: /^Search$/i, hidden: true })[0];
      fireEvent.click(searchNavButton);
      expect(screen.getByRole('heading', { name: /Search Accessibility Reports/i })).toBeDefined();

      // Navigate to About via Navbar
      const aboutNavButton = screen.getAllByRole('button', { name: /^About$/i, hidden: true })[0];
      fireEvent.click(aboutNavButton);
      expect(screen.getByRole('heading', { name: /About AccessPath/i })).toBeDefined();

      // Simulate Browser Back: window.location changes back to search and popstate/hashchange fires
      window.location.hash = '#/search';
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(screen.getByRole('heading', { name: /Search Accessibility Reports/i })).toBeDefined();

      // Simulate Browser Back to Home
      window.location.hash = '#/';
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(screen.getAllByText(/Know before you go/i).length).toBeGreaterThan(0);
    });
  });

  describe('parseRouteFromLocation Unit Edge Cases', () => {
    it('returns home for empty or root path/hash', () => {
      expect(parseRouteFromLocation({ pathname: '/', hash: '' })).toEqual({ name: 'home' });
      expect(parseRouteFromLocation({ pathname: '', hash: '#' })).toEqual({ name: 'home' });
      expect(parseRouteFromLocation({ pathname: '', hash: '#/' })).toEqual({ name: 'home' });
    });

    it('returns home for unknown paths gracefully', () => {
      expect(parseRouteFromLocation({ pathname: '/non-existent-page', hash: '' })).toEqual({ name: 'home' });
    });

    it('prioritizes hash over pathname when both are present', () => {
      expect(
        parseRouteFromLocation({
          pathname: '/search',
          hash: '#/about',
        })
      ).toEqual({ name: 'about' });
    });
  });
});
