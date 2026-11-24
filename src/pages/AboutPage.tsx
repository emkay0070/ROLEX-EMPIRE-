import React from 'react';
import { Play } from 'lucide-react';
import { AppRoute } from '../components/SiteLayout';
import { AdBannerSlot } from '../components/AdBannerSlot';

interface AboutPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="text-xs font-semibold text-[#f59e0b]">About the Game</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#f7f3eb]">
          Celebrating Uganda&apos;s Roadside Culinary Craft
        </h1>
        <p className="text-base text-[#c7bdb1] leading-relaxed">
          Rolex Empire is an original 3D browser business simulation rooted in the street-food
          traditions of Kampala, Uganda.
        </p>
      </header>

      <section className="space-y-4 text-sm sm:text-base text-[#cfc6ba] leading-relaxed">
        <h2 className="font-display text-2xl font-bold text-[#f7f3eb]">Why Kampala Street Food?</h2>
        <p>
          Walk down almost any busy stage in Kampala &mdash; from Makerere Kivulu and Wandegeya to
          Ntinda and Nakasero &mdash; and you will hear the unmistakable scrape of a metal spatula
          against a seasoned cast-iron <em>tava</em> pan. The Ugandan Rolex (&ldquo;rolled
          eggs&rdquo;) is a national staple: fast, nourishing, customizable, and cooked fresh in
          front of every customer.
        </p>
        <p>
          Most cooking games default to generic burger diners or pizzerias. Rolex Empire was created
          to put an authentic East African roadside kitchen center stage, translating the real steps
          of chapati grilling, egg mixing, vegetable prep, and paper-wrapped rolling into tactile
          3D gameplay.
        </p>
      </section>

      <AdBannerSlot slotId={import.meta.env.VITE_ADSENSE_ABOUT_SLOT as string | undefined} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#f7f3eb]">Version 1.0 Focus</h2>
          <p className="text-sm text-[#bfb5a8] leading-relaxed">
            Our public launch prioritizes fast browser loading, responsive controls across desktop
            and mobile phones, reliable 60-second shifts, local save persistence, and a clear
            progression loop from a single roadside kiosk toward a full Kampala bistro.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#f7f3eb]">Planned Future Updates</h2>
          <p className="text-sm text-[#bfb5a8] leading-relaxed">
            Future releases will introduce expanded Kampala neighborhoods, higher-detail 3D
            character and building models, regional Ugandan dishes, daily challenges, and optional
            cloud progress saving driven by community feedback.
          </p>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => onNavigate('/play')}
          className="min-h-[48px] px-7 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play Version 1.0</span>
        </button>
      </div>
    </article>
  );
};
