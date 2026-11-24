import React from 'react';
import {
  Volume2,
  VolumeX,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Pause,
  Home,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Video,
} from 'lucide-react';
import {
  CameraPreset,
  CookingState,
  CustomerOrder,
  IngredientId,
  SaveData,
} from '../types/game';
import { INGREDIENTS } from '../data/recipes';
import { getTierForLevel } from '../data/upgrades';

interface GameHUDProps {
  saveData: SaveData;
  shiftActive: boolean;
  isPaused: boolean;
  shiftTimeLeft: number;
  ordersCompletedShift: number;
  shiftEarningsUgx: number;
  shiftTipsUgx: number;
  orders: CustomerOrder[];
  selectedOrderId: string | null;
  cooking: CookingState;
  cameraPreset: CameraPreset;
  autoCamera: boolean;
  dockCollapsed: boolean;
  onSelectOrder: (id: string) => void;
  onServeOrder: (id: string) => void;
  onStartShift: () => void;
  onTogglePause: () => void;
  onExitToHome: () => void;
  onOpenShop: () => void;
  onToggleMute: () => void;
  onChangeCamera: (preset: CameraPreset) => void;
  onToggleAutoCamera: () => void;
  onToggleDock: () => void;
  onStartChapati: () => void;
  onPullChapati: () => void;
  onAddEgg: () => void;
  onToggleIngredient: (id: IngredientId) => void;
  onStartFryingOmelette: () => void;
  onCombineChapati: () => void;
  onRollStep: () => void;
  onDiscardPan: () => void;
}

const CAMERA_OPTIONS: Array<{ id: CameraPreset; label: string }> = [
  { id: 'overview', label: 'Stall' },
  { id: 'tava', label: 'Tava Pan' },
  { id: 'prep', label: 'Chapati' },
  { id: 'counter', label: 'Counter' },
];

export const GameHUD: React.FC<GameHUDProps> = ({
  saveData,
  shiftActive,
  isPaused,
  shiftTimeLeft,
  ordersCompletedShift,
  shiftEarningsUgx,
  shiftTipsUgx,
  orders,
  selectedOrderId,
  cooking,
  cameraPreset,
  autoCamera,
  dockCollapsed,
  onSelectOrder,
  onServeOrder,
  onStartShift,
  onTogglePause,
  onExitToHome,
  onOpenShop,
  onToggleMute,
  onChangeCamera,
  onToggleAutoCamera,
  onToggleDock,
  onStartChapati,
  onPullChapati,
  onAddEgg,
  onToggleIngredient,
  onStartFryingOmelette,
  onCombineChapati,
  onRollStep,
  onDiscardPan,
}) => {
  const tier = getTierForLevel(saveData.level);
  const availableIngredients = (Object.keys(INGREDIENTS) as IngredientId[]).filter((id) => {
    const def = INGREDIENTS[id];
    const hasBonus = (saveData.upgrades['prep_crate'] || 0) > 0;
    const effectiveLevel = hasBonus ? Math.max(saveData.level, 3) : saveData.level;
    return def.unlockLevel <= effectiveLevel;
  });

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between">
      {/* TOP BAR */}
      <header className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-[#161310]/95 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitToHome}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-[#f7f3eb] cursor-pointer transition-colors shrink-0"
            aria-label="Back to Home"
            title="Exit to Home"
          >
            <Home className="w-4 h-4" />
          </button>
          <span className="font-display text-sm sm:text-lg font-extrabold tracking-tight text-[#fcdc04] whitespace-nowrap shrink-0">
            Rolex Empire
          </span>
          <span className="hidden lg:inline text-xs text-[#bfb5a8] truncate">
            Lvl {saveData.level} · {tier.title} · {tier.locationName}
          </span>
        </div>

        {/* Live Economy & Shift Metrics */}
        <div className="flex items-center gap-2.5 sm:gap-5 text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#9c9286]">Cash</span>
            <span className="font-mono-tabular font-bold text-[#fcdc04] whitespace-nowrap">
              {saveData.cashUgx.toLocaleString()} UGX
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#9c9286]">Shift</span>
            <span
              className={`font-mono-tabular font-bold whitespace-nowrap ${
                shiftActive && shiftTimeLeft <= 10 ? 'text-red-400' : 'text-[#f7f3eb]'
              }`}
            >
              {shiftActive ? `${Math.ceil(shiftTimeLeft)}s` : 'Ready'}
            </span>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-[#9c9286]">Served · Tips</span>
            <span className="font-mono-tabular font-semibold text-[#e6dfd3] whitespace-nowrap">
              {ordersCompletedShift} · +{shiftTipsUgx.toLocaleString()}
            </span>
          </div>

          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-[#9c9286]">Satisfaction</span>
            <span className="font-mono-tabular font-semibold text-emerald-400 whitespace-nowrap">
              {Math.round(saveData.satisfactionRating)}%
            </span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {shiftActive && (
            <button
              type="button"
              onClick={onTogglePause}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-[#f7f3eb] cursor-pointer transition-colors"
              aria-label={isPaused ? 'Resume shift' : 'Pause shift'}
              title={isPaused ? 'Resume (Esc)' : 'Pause (Esc)'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={onOpenShop}
            className="min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Upgrades</span>
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-[#f7f3eb] cursor-pointer transition-colors"
            aria-label={saveData.soundMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {saveData.soundMuted ? (
              <VolumeX className="w-4 h-4 text-red-300" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* CUSTOMER ORDER TICKETS (Horizontally scrollable on narrow phones so center 3D pan stays clear) */}
      <div className="px-3 sm:px-4 pt-2.5 flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex flex-nowrap overflow-x-auto sm:flex-wrap gap-2 w-full sm:max-w-[780px] pb-1">
          {orders.length === 0 ? (
            <div className="px-3.5 py-2 rounded-xl bg-[#181411]/92 border border-white/10 text-xs text-[#d6cec3]">
              {shiftActive
                ? 'Customers approaching along Kampala road...'
                : 'Stall open. Press Start 60s Shift below to begin serving customers.'}
            </div>
          ) : (
            orders.map((order) => {
              const patienceRatio = Math.max(
                0,
                Math.min(1, order.patienceRemaining / order.patienceMax),
              );
              const isSelected = activeOrder?.id === order.id;
              const urgencyLabel =
                patienceRatio > 0.5
                  ? 'Patient'
                  : patienceRatio > 0.25
                  ? 'Hurry'
                  : 'Critical';

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className={`w-[210px] sm:w-[232px] shrink-0 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#251f19]/95 border-[#f59e0b]'
                      : 'bg-[#171310]/92 border-white/12 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-display font-bold text-[#f7f3eb] truncate">
                      {order.customerName}
                    </span>
                    <span className="font-mono-tabular text-[11px] font-semibold text-[#fcdc04] shrink-0">
                      {order.recipe.basePriceUgx.toLocaleString()} UGX
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-[#f59e0b] mt-0.5 truncate">
                    {order.recipe.name}
                  </p>
                  <p className="text-[11px] text-[#c7bdb1] truncate">
                    {order.recipe.eggCount} {order.recipe.eggCount === 1 ? 'Egg' : 'Eggs'} ·{' '}
                    {order.recipe.ingredients.map((id) => INGREDIENTS[id].name).join(', ')}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 ${
                          patienceRatio > 0.5
                            ? 'bg-emerald-400'
                            : patienceRatio > 0.25
                            ? 'bg-amber-400'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.round(patienceRatio * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono-tabular text-[#d6cec3] shrink-0">
                      {urgencyLabel} · {Math.ceil(order.patienceRemaining)}s
                    </span>
                  </div>

                  {cooking.stage === 'ready_to_serve' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onServeOrder(order.id);
                      }}
                      className="mt-2 w-full min-h-[38px] py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d1f14] text-xs font-bold cursor-pointer transition-colors"
                    >
                      Serve {order.customerName}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {shiftActive && (
          <div className="hidden md:block pointer-events-auto px-3.5 py-2 rounded-xl bg-[#171310]/92 border border-white/10 text-right shrink-0">
            <p className="text-[10px] text-[#9c9286]">Shift Sales</p>
            <p className="font-mono-tabular text-sm font-bold text-emerald-400">
              +{shiftEarningsUgx.toLocaleString()} UGX
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM COOKING DOCK */}
      <div className="pointer-events-auto flex flex-col items-center px-3 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={onToggleDock}
            className="min-h-[32px] px-3 py-1 rounded-t-lg bg-[#191512]/95 border border-b-0 border-white/15 text-[11px] font-semibold text-[#e6dfd3] inline-flex items-center gap-1.5 cursor-pointer hover:text-white"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Kitchen Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="w-full max-w-[920px] rounded-2xl bg-[#171411]/95 border border-white/15 shadow-2xl p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <Flame className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <span className="font-semibold text-[#f7f3eb] truncate">
                  {cooking.lastFeedback}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={onToggleAutoCamera}
                  title="Automatically follow cooking steps with action close-ups"
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    autoCamera
                      ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                      : 'bg-white/6 border border-transparent text-[#9c9286] hover:bg-white/12'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>Auto</span>
                </button>
                {CAMERA_OPTIONS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => onChangeCamera(cam.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      !autoCamera && cameraPreset === cam.id
                        ? 'bg-[#f59e0b] text-[#14110f]'
                        : 'bg-white/6 text-[#c7bdb1] hover:bg-white/12'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>

            {!shiftActive ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#d6cec3]">
                  <p className="font-semibold text-[#f7f3eb]">
                    Ready for a 60-second Kampala street shift?
                  </p>
                  <p className="text-[11px] text-[#9c9286] mt-0.5">
                    Grill chapati to the golden zone, crack eggs + fillings, fry omelette, roll &amp;
                    serve.
                    {saveData.employeeHired ? ' Assistant Chef Juma is on prep duty.' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartShift}
                  className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start 60s Shift</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cooking.stage === 'idle' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-xs text-[#d6cec3]">
                      Step 1: Press fresh dough onto the hot cast-iron tava
                      {activeOrder
                        ? ` for ${activeOrder.customerName}'s ${activeOrder.recipe.name}`
                        : ''}
                      .
                    </div>
                    <button
                      type="button"
                      onClick={onStartChapati}
                      className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      1. Grill Chapati on Tava
                    </button>
                  </div>
                )}

                {cooking.stage === 'chapati_grilling' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#f7f3eb]">
                        Grilling Chapati — Tap Lift in the Golden Sweet Spot (58%&ndash;86%)
                      </span>
                      <span className="font-mono-tabular text-[#fcdc04]">
                        {Math.round(cooking.chapatiProgress)}%
                      </span>
                    </div>
                    <div className="relative h-5 rounded-lg bg-white/10 overflow-hidden border border-white/10">
                      <div
                        className="absolute top-0 bottom-0 bg-emerald-500/35 border-x border-emerald-400"
                        style={{ left: '58%', width: '28%' }}
                      />
                      <div
                        className="absolute top-0 bottom-0 right-0 bg-red-500/35"
                        style={{ width: '14%' }}
                      />
                      <div
                        className="h-full bg-[#f59e0b] transition-none"
                        style={{ width: `${Math.min(100, cooking.chapatiProgress)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={onPullChapati}
                        className="min-h-[46px] px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0d1f14] text-sm font-extrabold cursor-pointer transition-colors"
                      >
                        Lift Golden Chapati (Space)
                      </button>
                    </div>
                  </div>
                )}

                {(cooking.stage === 'chapati_ready' || cooking.stage === 'mixing_eggs') && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onAddEgg}
                          disabled={cooking.eggCount >= 3}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                            cooking.eggCount >= 3
                              ? 'bg-white/10 text-white/40 cursor-not-allowed'
                              : 'bg-[#fcdc04] hover:bg-[#fde047] text-[#14110f] cursor-pointer'
                          }`}
                        >
                          Crack Egg ({cooking.eggCount}/3)
                        </button>
                        <span className="text-xs text-[#c7bdb1]">
                          {activeOrder
                            ? `Order needs ${activeOrder.recipe.eggCount} ${
                                activeOrder.recipe.eggCount === 1 ? 'egg' : 'eggs'
                              }`
                            : 'Select fillings:'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onDiscardPan}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-white/8 hover:bg-red-950/70 text-xs text-[#d6cec3] hover:text-red-300 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                        <button
                          type="button"
                          disabled={cooking.eggCount === 0}
                          onClick={onStartFryingOmelette}
                          className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                            cooking.eggCount > 0
                              ? 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] cursor-pointer'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          Pour onto Hot Tava
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {availableIngredients.map((id) => {
                        const def = INGREDIENTS[id];
                        const selected = cooking.selectedIngredients.includes(id);
                        const needed = activeOrder?.recipe.ingredients.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onToggleIngredient(id)}
                            className={`min-h-[42px] px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                              selected
                                ? 'bg-[#f59e0b]/25 border-[#f59e0b] text-[#fcdc04]'
                                : needed
                                ? 'bg-[#26211c] border-white/25 text-[#f7f3eb] hover:bg-white/10'
                                : 'bg-[#1d1916] border-white/10 text-[#a89e92] hover:bg-white/8'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: def.colorHex }}
                            />
                            <span className="truncate">{def.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cooking.stage === 'frying_omelette' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#f7f3eb]">
                        Frying Omelette — Press Chapati on Top in Golden Zone (62%&ndash;88%)
                      </span>
                      <span className="font-mono-tabular text-[#fcdc04]">
                        {Math.round(cooking.omeletteProgress)}%
                      </span>
                    </div>
                    <div className="relative h-5 rounded-lg bg-white/10 overflow-hidden border border-white/10">
                      <div
                        className="absolute top-0 bottom-0 bg-emerald-500/35 border-x border-emerald-400"
                        style={{ left: '62%', width: '26%' }}
                      />
                      <div
                        className="absolute top-0 bottom-0 right-0 bg-red-500/35"
                        style={{ width: '12%' }}
                      />
                      <div
                        className="h-full bg-[#fcdc04] transition-none"
                        style={{ width: `${Math.min(100, cooking.omeletteProgress)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={onDiscardPan}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-white/8 text-xs text-[#d6cec3] cursor-pointer"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={onCombineChapati}
                        className="min-h-[46px] px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0d1f14] text-sm font-extrabold cursor-pointer transition-colors"
                      >
                        Combine Chapati &amp; Omelette (Space)
                      </button>
                    </div>
                  </div>
                )}

                {(cooking.stage === 'combining' || cooking.stage === 'rolling') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#f7f3eb]">
                        Tap Roll 3 times (or Space) to wrap tight in brown kraft paper!
                      </span>
                      <span className="font-mono-tabular text-[#fcdc04]">
                        {Math.round(cooking.rollProgress)}%
                      </span>
                    </div>
                    <div className="h-3.5 rounded-lg bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-[#f59e0b] transition-all duration-100"
                        style={{ width: `${cooking.rollProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onRollStep}
                        className="min-h-[48px] px-8 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold cursor-pointer transition-colors"
                      >
                        Roll Rolex Tight! (Space)
                      </button>
                    </div>
                  </div>
                )}

                {cooking.stage === 'ready_to_serve' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      {cooking.overallQuality === 'poor' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span>
                        Hot{' '}
                        <strong className="text-[#fcdc04] uppercase">
                          {cooking.overallQuality}
                        </strong>{' '}
                        Rolex ready on serving tray! Tap a customer ticket or click them in 3D.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={onDiscardPan}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-white/8 hover:bg-red-950/70 text-xs text-[#d6cec3] cursor-pointer"
                      >
                        Trash
                      </button>
                      {activeOrder && (
                        <button
                          type="button"
                          onClick={() => onServeOrder(activeOrder.id)}
                          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0d1f14] text-sm font-extrabold whitespace-nowrap cursor-pointer transition-colors"
                        >
                          Serve to {activeOrder.customerName}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
