import React, { useEffect, useState } from 'react';
import { Play, BookOpen, Flame, Coins, TrendingUp } from 'lucide-react';
import { AppRoute } from '../components/SiteLayout';
import { AdBannerSlot } from '../components/AdBannerSlot';
import { hydrateSaveDataAsync, loadSaveData } from '../engine/SaveSystem';
import { getTierForLevel } from '../data/upgrades';

interface HomePageProps {
  onNavigate: (route: AppRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [save, setSave] = useState(() => loadSaveData());

  useEffect(() => {
    let active = true;
    void hydrateSaveDataAsync().then((hydrated) => {
      if (active) setSave(hydrated);
    });
    return () => {
      active = false;
    };
  }, []);

  const tier = getTierForLevel(save.level);
  const hasPlayedBefore = save.shiftCount > 0 || save.ordersCompletedTotal > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero Title Screen Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-xs font-semibold tracking-wide text-[#f59e0b]">
            Kampala 3D Street-Food Simulation · Version 1.0
          </p>
          <h1
            className="font-display font-extrabold tracking-tight text-[#f7f3eb] leading-[1.08]"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', textWrap: 'balance' }}
          >
            Build Kampala&apos;s Finest Rolex Empire
          </h1>
          <p className="text-base sm:text-lg text-[#cfc6ba] leading-relaxed max-w-2xl">
            Step behind a roadside charcoal <em>sigiri</em> in the streets of Kampala. Press and
            grill golden chapatis on a cast-iron <em>tava</em>, crack farm eggs with fresh
            Katungulu onions and Nyanya tomatoes, roll each Rolex tightly in kraft paper, and serve
            hungry street crowds before their patience runs out.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/play')}
              className="min-h-[48px] px-7 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold inline-flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{hasPlayedBefore ? 'Continue Stall Career' : 'Play Rolex Empire'}</span>
            </button>

            <a
              href="/how-to-play"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/how-to-play');
              }}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-white/8 hover:bg-white/14 border border-white/12 text-sm font-semibold text-[#f7f3eb] inline-flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#fcdc04]" />
              <span>How to Play</span>
            </a>
          </div>
        </div>

        {/* Career Snapshot / Game Summary Card */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-[#1d1915] border border-white/12 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-[#9c9286]">Active Stall Location</p>
                <p className="font-display text-lg font-bold text-[#f7f3eb] mt-0.5">
                  {tier.locationName}
                </p>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-[#fcdc04]">
                Level {save.level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#25201b] border border-white/8">
                <p className="text-xs text-[#9c9286]">Stall Cash</p>
                <p className="font-mono-tabular text-lg font-bold text-[#fcdc04] mt-1">
                  {save.cashUgx.toLocaleString()} UGX
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#25201b] border border-white/8">
                <p className="text-xs text-[#9c9286]">Rolex Served</p>
                <p className="font-mono-tabular text-lg font-bold text-[#f7f3eb] mt-1">
                  {save.ordersCompletedTotal}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#25201b] border border-white/8">
                <p className="text-xs text-[#9c9286]">Shifts Worked</p>
                <p className="font-mono-tabular text-lg font-bold text-[#f7f3eb] mt-1">
                  {save.shiftCount}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#25201b] border border-white/8">
                <p className="text-xs text-[#9c9286]">Best Shift Profit</p>
                <p className="font-mono-tabular text-lg font-bold text-emerald-400 mt-1">
                  {save.bestShiftProfitUgx.toLocaleString()} UGX
                </p>
              </div>
            </div>

            <p className="text-xs text-[#b8afa3] leading-relaxed">
              Plays directly in desktop and mobile browsers with mouse, touch, or keyboard controls.
              No downloads or accounts required.
            </p>
          </div>
        </div>
      </section>

      {/* Core Gameplay Pillars */}
      <section className="mt-16 pt-12 border-t border-white/10">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f7f3eb]">
          What Makes Rolex Empire Authentic
        </h2>
        <p className="text-sm text-[#b8afa3] mt-2 max-w-2xl">
          Inspired by Uganda&apos;s iconic street-food culture, every shift tests your timing on the
          pan, order accuracy, and reinvestment decisions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-2.5">
            <Flame className="w-5 h-5 text-[#f59e0b]" />
            <h3 className="font-display text-lg font-bold text-[#f7f3eb]">
              01. Skill-Based Tava Cooking
            </h3>
            <p className="text-sm text-[#bfb5a8] leading-relaxed">
              Every Rolex starts with blistering a fresh chapati on the cast-iron pan, cracking the
              exact egg count, tossing in chopped red onions, tomatoes, cabbage, beef, or avocado,
              and rolling tightly at peak golden heat.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-2.5">
            <Coins className="w-5 h-5 text-[#fcdc04]" />
            <h3 className="font-display text-lg font-bold text-[#f7f3eb]">
              02. 60-Second Kampala Rush Shifts
            </h3>
            <p className="text-sm text-[#bfb5a8] leading-relaxed">
              Serve boda-boda riders, Makerere students, market mamas, and office workers during
              intense 60-second rushes. Fast, accurate service earns generous UGX tips and keeps
              stall satisfaction high.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-2.5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display text-lg font-bold text-[#f7f3eb]">
              03. Grow From Stall to Bistro
            </h3>
            <p className="text-sm text-[#bfb5a8] leading-relaxed">
              Reinvest your Ugandan Shillings into heavy cast-iron tavas, dual-ring gas burners,
              Nakasero spice racks, expanded canopies, and Assistant Chef Juma as you climb from
              Makerere Kivulu to a flagship Kampala restaurant.
            </p>
          </div>
        </div>
      </section>

      {/* Non-intrusive AdSense Zone (separated from gameplay and primary buttons) */}
      <AdBannerSlot slotId={import.meta.env.VITE_ADSENSE_HOME_SLOT as string | undefined} />

      {/* Cultural Context Section for Visitors & Search Engines */}
      <section className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#1a1613] border border-white/10 space-y-3">
        <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
          What is a Ugandan Rolex?
        </h2>
        <p className="text-sm text-[#c7bdb1] leading-relaxed">
          In Uganda, a &ldquo;Rolex&rdquo; has nothing to do with wristwatches — the name comes from
          <strong> &ldquo;rolled eggs.&rdquo;</strong> Vendors fry a savoury vegetable omelette with
          red onions (<em>katungulu</em>), tomatoes (<em>nyanya</em>), and shredded cabbage (
          <em>emboga</em>), then bond it onto a hot pan-fried chapati and roll it up in paper for an
          affordable, filling meal enjoyed morning, noon, and night across Kampala.
        </p>
      </section>
    </div>
  );
};
