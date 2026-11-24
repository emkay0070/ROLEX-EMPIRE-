import React, { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
import { SaveData, UpgradeCategory, UpgradeDef } from '../types/game';
import { PROGRESSION_TIERS, UPGRADES } from '../data/upgrades';

interface ShopModalProps {
  isOpen: boolean;
  saveData: SaveData;
  onClose: () => void;
  onBuyUpgrade: (upgrade: UpgradeDef) => void;
  onResetSave: () => void;
}

const CATEGORIES: Array<{ id: 'all' | UpgradeCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'staff', label: 'Staff' },
  { id: 'expansion', label: 'Expansion' },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  saveData,
  onClose,
  onBuyUpgrade,
  onResetSave,
}) => {
  const [filter, setFilter] = useState<'all' | UpgradeCategory>('all');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const visibleUpgrades =
    filter === 'all' ? UPGRADES : UPGRADES.filter((u) => u.category === filter);

  const nextTier = PROGRESSION_TIERS.find((t) => t.level > saveData.level);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Business Upgrades and Empire Progression"
    >
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-[#1b1714] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
              Business Upgrades &amp; Expansion
            </h2>
            <p className="text-xs text-[#c7bdb1] mt-0.5">
              Available Capital:{' '}
              <span className="font-mono-tabular font-bold text-[#fcdc04]">
                {saveData.cashUgx.toLocaleString()} UGX
              </span>
              <span className="mx-2 text-white/30">·</span>
              Level {saveData.level}
              {nextTier ? ` (Next milestone at ${nextTier.xpRequired} XP)` : ' (Empire Established)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#f7f3eb] transition-colors cursor-pointer"
            aria-label="Close upgrades shop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-white/10 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filter === cat.id
                  ? 'bg-[#f59e0b] text-[#14110f]'
                  : 'bg-white/5 text-[#d6cec3] hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Upgrades List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 rolex-scroll">
          {visibleUpgrades.map((up) => {
            const currentRank = saveData.upgrades[up.id] || 0;
            const isMaxed = currentRank >= up.maxRank;
            const scaledCost = Math.round(up.costUgx * Math.pow(1.6, currentRank));
            const levelLocked = saveData.level < up.requiredLevel;
            const canAfford = saveData.cashUgx >= scaledCost;

            return (
              <div
                key={up.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#241f1b] border border-white/10"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-display text-base font-bold text-[#f7f3eb]">
                      {up.name}
                    </h3>
                    <span className="text-xs font-mono-tabular text-[#d6cec3]">
                      Rank {currentRank}/{up.maxRank}
                    </span>
                  </div>
                  <p className="text-xs text-[#bfb5a8] leading-relaxed">{up.description}</p>
                  <p className="text-xs font-semibold text-[#fbbf24]">{up.effectLabel}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isMaxed ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold whitespace-nowrap">
                      <Check className="w-4 h-4" />
                      Maxed Out
                    </span>
                  ) : levelLocked ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[#9c9286] text-xs font-semibold whitespace-nowrap">
                      <Lock className="w-4 h-4" />
                      Requires Level {up.requiredLevel}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyUpgrade(up)}
                      className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold font-mono-tabular whitespace-nowrap transition-colors ${
                        canAfford
                          ? 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] cursor-pointer'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Buy · {scaledCost.toLocaleString()} UGX
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Progression Roadmap */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="font-display text-sm font-bold text-[#f7f3eb] mb-3">
              Kampala Empire Roadmap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROGRESSION_TIERS.map((tier) => {
                const unlocked = saveData.level >= tier.level;
                return (
                  <div
                    key={tier.level}
                    className={`p-3 rounded-lg border text-xs ${
                      unlocked
                        ? 'bg-[#262018] border-[#f59e0b]/40 text-[#f7f3eb]'
                        : 'bg-[#171411] border-white/5 text-[#8c8378]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>
                        Level {tier.level} · {tier.title}
                      </span>
                      <span className="font-mono-tabular">{tier.xpRequired} XP</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-85">{tier.locationName}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-t border-white/10 bg-[#15120f]">
          <div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-[#9c9286] hover:text-red-400 transition-colors cursor-pointer"
              >
                Reset Career Progress
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-300">Erase all UGX &amp; upgrades?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetSave();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 rounded bg-white/10 text-xs text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f7f3eb] transition-colors cursor-pointer"
          >
            Back to Stall
          </button>
        </div>
      </div>
    </div>
  );
};
