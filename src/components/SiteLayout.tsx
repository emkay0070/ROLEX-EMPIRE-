import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type AppRoute =
  | '/'
  | '/play'
  | '/owner'
  | '/how-to-play'
  | '/about'
  | '/privacy-policy'
  | '/contact';

interface SiteLayoutProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: React.ReactNode;
}

const NAV_LINKS: Array<{ route: AppRoute; label: string }> = [
  { route: '/', label: 'Home' },
  { route: '/how-to-play', label: 'How to Play' },
  { route: '/about', label: 'About' },
  { route: '/privacy-policy', label: 'Privacy Policy' },
  { route: '/contact', label: 'Contact' },
];

export const SiteLayout: React.FC<SiteLayoutProps> = ({
  currentRoute,
  onNavigate,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, route: AppRoute) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#14110f] text-[#f7f3eb]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-[#161310]/95 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="font-display text-xl font-extrabold tracking-tight text-[#fcdc04] whitespace-nowrap shrink-0"
          >
            Rolex Empire
          </a>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#d6cec3]"
          >
            {NAV_LINKS.map((item) => {
              const active = currentRoute === item.route;
              return (
                <a
                  key={item.route}
                  href={item.route}
                  onClick={(e) => handleLinkClick(e, item.route)}
                  className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                    active ? 'text-[#fcdc04] underline underline-offset-8 decoration-2' : ''
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA + Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/play"
              onClick={(e) => handleLinkClick(e, '/play')}
              className="min-h-[40px] px-5 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-xs font-bold inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors"
            >
              Play Game
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-[#f7f3eb] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="md:hidden border-t border-white/10 bg-[#1a1613] px-4 py-3 flex flex-col gap-1"
          >
            {NAV_LINKS.map((item) => {
              const active = currentRoute === item.route;
              return (
                <a
                  key={item.route}
                  href={item.route}
                  onClick={(e) => handleLinkClick(e, item.route)}
                  className={`min-h-[44px] px-3 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#f59e0b]/15 text-[#fcdc04]'
                      : 'text-[#d6cec3] hover:bg-white/8'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#110e0c] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-base font-bold text-[#fcdc04]">Rolex Empire</p>
            <p className="text-xs text-[#9c9286] mt-1 max-w-md">
              A 3D Ugandan street-food business simulation set in Kampala. Cook chapati and eggs,
              serve street traffic, and build your culinary business.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#c7bdb1]">
            <a
              href="/play"
              onClick={(e) => handleLinkClick(e, '/play')}
              className="hover:text-white transition-colors"
            >
              Play Game
            </a>
            <a
              href="/owner"
              onClick={(e) => handleLinkClick(e, '/owner')}
              className="hover:text-white transition-colors"
            >
              Owner Ledger
            </a>
            {NAV_LINKS.map((item) => (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => handleLinkClick(e, item.route)}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-white/5 py-4 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8c8378]">
          <span>&copy; {new Date().getFullYear()} Rolex Empire. Version 1.0 Web Release.</span>
          <span>Game progress is saved locally in your browser.</span>
        </div>
      </footer>
    </div>
  );
};
