import React from 'react';
import { Play } from 'lucide-react';
import { AppRoute } from '../components/SiteLayout';
import { AdBannerSlot } from '../components/AdBannerSlot';

interface HowToPlayPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const HowToPlayPage: React.FC<HowToPlayPageProps> = ({ onNavigate }) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="text-xs font-semibold text-[#f59e0b]">Player Guide</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#f7f3eb]">
          How to Play Rolex Empire
        </h1>
        <p className="text-base text-[#c7bdb1] leading-relaxed">
          Master the rhythm of a Kampala roadside Rolex stall in four cooking steps, manage
          customer patience during 60-second shifts, and reinvest your UGX profits.
        </p>
      </header>

      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-[#f7f3eb]">
          The 4-Step Cooking Workflow
        </h2>
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#1a1613] border border-white/10">
            <h3 className="font-display text-base font-bold text-[#fcdc04]">
              01. Grill the Chapati
            </h3>
            <p className="text-sm text-[#c7bdb1] mt-1.5 leading-relaxed">
              Click <strong>1. Grill Chapati on Tava</strong> (or tap the 3D prep board / tava pan).
              Watch the progress bar climb and click <strong>Lift Golden Chapati</strong> (or press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Space</kbd>) while inside the
              green sweet spot (58%&ndash;86%). Pulling too early leaves dough pale; waiting past 93%
              chars the edges.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#1a1613] border border-white/10">
            <h3 className="font-display text-base font-bold text-[#fcdc04]">
              02. Crack Eggs &amp; Choose Fillings
            </h3>
            <p className="text-sm text-[#c7bdb1] mt-1.5 leading-relaxed">
              Check the selected customer&apos;s ticket at the top-left. Crack the exact number of
              eggs requested (1 to 3), toggle every requested ingredient (Red Onion, Tomato,
              Cabbage, Green Pepper, Spiced Beef, or Avocado), and click{' '}
              <strong>Pour onto Hot Tava</strong>. Matching the order accurately protects your
              quality rating and tips.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#1a1613] border border-white/10">
            <h3 className="font-display text-base font-bold text-[#fcdc04]">
              03. Fry the Omelette &amp; Combine
            </h3>
            <p className="text-sm text-[#c7bdb1] mt-1.5 leading-relaxed">
              Listen to the sizzle and watch the omelette gauge. Press{' '}
              <strong>Combine Chapati &amp; Omelette</strong> (or{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Space</kbd>) in the green
              sweet spot (62%&ndash;88%) to bond the chapati onto the hot egg.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#1a1613] border border-white/10">
            <h3 className="font-display text-base font-bold text-[#fcdc04]">
              04. Roll &amp; Serve the Customer
            </h3>
            <p className="text-sm text-[#c7bdb1] mt-1.5 leading-relaxed">
              Tap <strong>Roll Rolex Tight!</strong> (or{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Space</kbd>) three times to
              wrap the Rolex in brown kraft paper. Then tap the matching customer&apos;s order
              ticket or click the customer character directly in the 3D street scene to collect
              your UGX payment and tip.
            </p>
          </div>
        </div>
      </section>

      <AdBannerSlot slotId={import.meta.env.VITE_ADSENSE_GUIDE_SLOT as string | undefined} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-[#1a1613] border border-white/10 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#f7f3eb]">Controls Summary</h2>
          <ul className="text-sm text-[#c7bdb1] space-y-2">
            <li>
              <strong>Mouse / Touch:</strong> Drag to orbit camera around your stall, pinch/scroll to
              zoom, tap 3D stations or HUD buttons to cook and serve.
            </li>
            <li>
              <strong>Spacebar:</strong> Advances active timed steps (Lift Chapati, Combine
              Omelette, Roll Rolex, or Serve active order).
            </li>
            <li>
              <strong>H Key:</strong> Collapse or expand the bottom cooking dock to view the full 3D
              Kampala stall.
            </li>
            <li>
              <strong>Esc Key:</strong> Pause or resume the current 60-second shift.
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-xl bg-[#1a1613] border border-white/10 space-y-2.5">
          <h2 className="font-display text-lg font-bold text-[#f7f3eb]">Business Tips</h2>
          <ul className="text-sm text-[#c7bdb1] space-y-2">
            <li>
              Prioritize <strong>Heavy Cast-Iron Tava</strong> early: it widens the Perfect timing
              window and speeds up cooking.
            </li>
            <li>
              Buy the <strong>Painted Roadside Signboard</strong> to increase base UGX menu prices
              across every order.
            </li>
            <li>
              At Level 2+, save 45,000 UGX to hire <strong>Assistant Chef Juma</strong>, who
              pre-grills chapatis and calms waiting customers.
            </li>
          </ul>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => onNavigate('/play')}
          className="min-h-[48px] px-7 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Playing Now</span>
        </button>
      </div>
    </article>
  );
};
