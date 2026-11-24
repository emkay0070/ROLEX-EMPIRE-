import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AppRoute, SiteLayout } from './components/SiteLayout';
import { HomePage } from './pages/HomePage';
import { HowToPlayPage } from './pages/HowToPlayPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ContactPage } from './pages/ContactPage';

const LazyGameView = lazy(() =>
  import('./components/GameView').then((mod) => ({ default: mod.GameView })),
);

const VALID_ROUTES = new Set<AppRoute>([
  '/',
  '/play',
  '/how-to-play',
  '/about',
  '/privacy-policy',
  '/contact',
]);

const ROUTE_TITLES: Record<AppRoute, string> = {
  '/': 'Rolex Empire — 3D Ugandan Street-Food Simulation',
  '/play': 'Play Rolex Empire — Kampala Roadside Stall',
  '/how-to-play': 'How to Play — Rolex Empire',
  '/about': 'About — Rolex Empire',
  '/privacy-policy': 'Privacy Policy — Rolex Empire',
  '/contact': 'Contact — Rolex Empire',
};

function parseRoute(pathname: string): AppRoute {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (VALID_ROUTES.has(normalized as AppRoute)) {
    return normalized as AppRoute;
  }
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));

  const navigate = useCallback((nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.title = ROUTE_TITLES[route];
  }, [route]);

  if (route === '/play') {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#14110f] text-[#f7f3eb] p-6">
            <p className="font-display text-2xl font-extrabold text-[#fcdc04]">Rolex Empire</p>
            <p className="text-sm text-[#c7bdb1] mt-2">
              Preparing your Kampala roadside stall...
            </p>
          </div>
        }
      >
        <LazyGameView onNavigate={navigate} />
      </Suspense>
    );
  }

  return (
    <SiteLayout currentRoute={route} onNavigate={navigate}>
      {route === '/' && <HomePage onNavigate={navigate} />}
      {route === '/how-to-play' && <HowToPlayPage onNavigate={navigate} />}
      {route === '/about' && <AboutPage onNavigate={navigate} />}
      {route === '/privacy-policy' && <PrivacyPolicyPage onNavigate={navigate} />}
      {route === '/contact' && <ContactPage />}
    </SiteLayout>
  );
}
