import React from 'react';
import { ArrowRight, ShoppingBag, Home } from 'lucide-react';
import { ShiftStats } from '../types/game';

interface ShiftSummaryModalProps {
  stats: ShiftStats | null;
  cashUgx: number;
  level: number;
  locationName: string;
  onStartNextShift: () => void;
  onOpenShop: () => void;
  onExitToHome: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({
  stats,
  cashUgx,
  level,
  locationName,
  onStartNextShift,
  onOpenShop,
  onExitToHome,
}) => {
  if (!stats) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Shift Financial Summary"
    >
      <div className="w-full max-w-lg bg-[#1b1714] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-xs font-semibold text-[#fbbf24]">
            Shift {stats.shiftNumber} Complete · Level {level}
          </p>
          <h2 className="font-display text-2xl font-extrabold text-[#f7f3eb] mt-1">
            Daily Stall Tally
          </h2>
          <p className="text-xs text-[#b8afa3] mt-0.5">{locationName}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-[#241f1b] border border-white/10">
              <p className="text-xs text-[#b8afa3]">Customers Served</p>
              <p className="font-mono-tabular text-xl font-bold text-[#f7f3eb] mt-1">
                {stats.customersServed}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#241f1b] border border-white/10">
              <p className="text-xs text-[#b8afa3]">Missed Orders</p>
              <p className="font-mono-tabular text-xl font-bold text-red-400 mt-1">
                {stats.missedOrders}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#241f1b] border border-white/10">
              <p className="text-xs text-[#b8afa3]">Total Sales</p>
              <p className="font-mono-tabular text-lg font-bold text-[#f7f3eb] mt-1">
                {stats.totalSalesUgx.toLocaleString()} UGX
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#241f1b] border border-white/10">
              <p className="text-xs text-[#b8afa3]">Tips Earned</p>
              <p className="font-mono-tabular text-lg font-bold text-emerald-400 mt-1">
                +{stats.tipsEarnedUgx.toLocaleString()} UGX
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#272017] border border-[#f59e0b]/40 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#d6cec3]">
                Net Shift Profit (Ingredient Cost: {stats.expensesUgx.toLocaleString()} UGX)
              </p>
              <p className="text-xs text-[#9c9286] mt-0.5">
                Perfect Rolls: {stats.perfectServes} · Cash Balance: {cashUgx.toLocaleString()} UGX
              </p>
            </div>
            <p className="font-mono-tabular text-2xl font-extrabold text-[#fcdc04] shrink-0">
              +{stats.netProfitUgx.toLocaleString()} UGX
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-6 py-4 border-t border-white/10 bg-[#15120f]">
          <button
            type="button"
            onClick={onExitToHome}
            className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/12 text-xs font-semibold text-[#c7bdb1] inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenShop}
              className="min-h-[44px] px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f7f3eb] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Upgrades Shop
            </button>
            <button
              type="button"
              onClick={onStartNextShift}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-xs font-bold text-[#14110f] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Start Next 60s Shift
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
