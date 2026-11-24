import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CameraPreset,
  CookQuality,
  CookingState,
  CustomerOrder,
  IngredientId,
  SaveData,
  ShiftStats,
  UpgradeDef,
} from '../types/game';
import { computeLevelFromXp, getTierForLevel } from '../data/upgrades';
import { INGREDIENTS } from '../data/recipes';
import { createCustomerOrder } from '../engine/CustomerSystem';
import { CameraFocusTarget, RolexGameEngine } from '../engine/RolexGameEngine';
import { AudioSystem } from '../engine/AudioSystem';
import {
  hydrateSaveDataAsync,
  loadSaveData,
  persistSaveData,
  recordOrderEvent,
  recordShiftCompleted,
  recordUpgradePurchased,
  resetSaveData,
} from '../engine/SaveSystem';
import { GameHUD } from './GameHUD';
import { ShopModal } from './ShopModal';
import { ShiftSummaryModal } from './ShiftSummaryModal';
import { AppRoute } from './SiteLayout';

const SHIFT_DURATION_SEC = 60;
const INGREDIENT_COST_PER_SERVE = 500;

const INITIAL_COOKING: CookingState = {
  stage: 'idle',
  chapatiProgress: 0,
  chapatiQuality: null,
  eggCount: 0,
  selectedIngredients: [],
  omeletteProgress: 0,
  omeletteQuality: null,
  rollProgress: 0,
  overallQuality: 'good',
  panHeat: 0.35,
  lastFeedback: 'Tap Start 60s Shift or click any station on the Kampala stall.',
};

interface GameViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const GameView: React.FC<GameViewProps> = ({ onNavigate }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<RolexGameEngine | null>(null);
  const audioRef = useRef<AudioSystem | null>(null);

  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [shiftActive, setShiftActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shiftTimeLeft, setShiftTimeLeft] = useState(SHIFT_DURATION_SEC);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cooking, setCooking] = useState<CookingState>(INITIAL_COOKING);

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [autoCamera, setAutoCamera] = useState(true);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<ShiftStats | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Live shift counters
  const [shiftServedCount, setShiftServedCount] = useState(0);
  const [shiftSalesUgx, setShiftSalesUgx] = useState(0);
  const [shiftTipsUgx, setShiftTipsUgx] = useState(0);

  // Mutable refs for reliable 50ms game loop & raycasting without impure state updaters
  const saveRef = useRef(saveData);
  saveRef.current = saveData;
  const shiftActiveRef = useRef(shiftActive);
  shiftActiveRef.current = shiftActive;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const autoCameraRef = useRef(autoCamera);
  autoCameraRef.current = autoCamera;
  const shiftRemainingRef = useRef(SHIFT_DURATION_SEC);
  const cookingRef = useRef(cooking);
  cookingRef.current = cooking;
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const selectedOrderRef = useRef(selectedOrderId);
  selectedOrderRef.current = selectedOrderId;

  const departureTimersRef = useRef<Set<number>>(new Set());

  const shiftCountersRef = useRef({
    served: 0,
    perfect: 0,
    missed: 0,
    sales: 0,
    tips: 0,
    expenses: 0,
    satisfactionSum: 0,
    satisfactionEvents: 0,
  });

  const spawnTimerRef = useRef(0);

  const clearDepartureTimers = useCallback(() => {
    departureTimersRef.current.forEach((id) => window.clearTimeout(id));
    departureTimersRef.current.clear();
  }, []);

  const scheduleOrderRemoval = useCallback((orderId: string, delayMs: number) => {
    const timerId = window.setTimeout(() => {
      departureTimersRef.current.delete(timerId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }, delayMs);
    departureTimersRef.current.add(timerId);
  }, []);

  // Hydrate & migrate rolex_empire_save_v1 into IndexedDB safely on mount
  const userMutatedSaveRef = useRef(false);
  useEffect(() => {
    let active = true;
    void hydrateSaveDataAsync().then((hydrated) => {
      if (!active || userMutatedSaveRef.current) return;
      setSaveData((current) => {
        if (
          hydrated.xp > current.xp ||
          hydrated.ordersCompletedTotal > current.ordersCompletedTotal ||
          hydrated.shiftCount > current.shiftCount
        ) {
          return hydrated;
        }
        return current;
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist save state automatically (localStorage + IndexedDB)
  useEffect(() => {
    persistSaveData(saveData);
    engineRef.current?.syncUpgradesVisuals(saveData.upgrades, saveData.employeeHired);
  }, [saveData]);

  // Helper: serve a specific customer order
  const serveCustomer = useCallback(
    (customerId: string) => {
      if (isPausedRef.current) return;
      const cook = cookingRef.current;
      if (cook.stage !== 'ready_to_serve') return;

      const target = ordersRef.current.find(
        (o) => o.id === customerId && (o.status === 'waiting' || o.status === 'walking_in'),
      );
      if (!target) return;

      const reqIngs = new Set(target.recipe.ingredients);
      const chosenIngs = new Set(cook.selectedIngredients);
      let matches = 0;
      reqIngs.forEach((ing) => {
        if (chosenIngs.has(ing)) matches++;
      });
      const extraWrong = Array.from(chosenIngs).filter((i) => !reqIngs.has(i)).length;
      const accuracyRatio = Math.max(
        0,
        (matches - extraWrong * 0.5) / Math.max(1, reqIngs.size),
      );
      const eggMatches = cook.eggCount === target.recipe.eggCount;

      let finalQuality: CookQuality = cook.overallQuality;
      if (!eggMatches || accuracyRatio < 0.65) {
        finalQuality = 'poor';
      } else if (accuracyRatio === 1 && finalQuality === 'perfect') {
        finalQuality = 'perfect';
      }

      const signboardRank = saveRef.current.upgrades['signboard'] || 0;
      const spiceRank = saveRef.current.upgrades['prep_crate'] || 0;
      const priceMultiplier = 1 + signboardRank * 0.15;
      const qualityPayMult =
        finalQuality === 'perfect' ? 1.15 : finalQuality === 'good' ? 1.0 : 0.7;

      const saleUgx =
        Math.round((target.recipe.basePriceUgx * priceMultiplier * qualityPayMult) / 100) * 100;
      const patienceBonus = target.patienceRemaining / target.patienceMax;
      const tipUgx =
        finalQuality === 'poor'
          ? 0
          : Math.round(
              (target.recipe.basePriceUgx *
                (finalQuality === 'perfect' ? 0.3 : 0.14) *
                target.tipMultiplier *
                (1 + spiceRank * 0.15) *
                (0.6 + patienceBonus * 0.6)) /
                100,
            ) * 100;

      const ingredientCost =
        saveRef.current.cashUgx >= INGREDIENT_COST_PER_SERVE ? INGREDIENT_COST_PER_SERVE : 0;
      const netEarned = saleUgx + tipUgx - ingredientCost;
      const satDelta = finalQuality === 'perfect' ? 3.5 : finalQuality === 'good' ? 1.5 : -6;
      const xpGain = finalQuality === 'perfect' ? 38 : finalQuality === 'good' ? 24 : 10;

      audioRef.current?.playCashChime(finalQuality === 'perfect');

      // Mark customer leaving happy
      const nextOrders = ordersRef.current.map((o) =>
        o.id === target.id ? { ...o, status: 'leaving_happy' as const } : o,
      );
      ordersRef.current = nextOrders;
      setOrders(nextOrders);
      scheduleOrderRemoval(target.id, 1750);

      shiftCountersRef.current.served += 1;
      if (finalQuality === 'perfect') shiftCountersRef.current.perfect += 1;
      shiftCountersRef.current.sales += saleUgx;
      shiftCountersRef.current.tips += tipUgx;
      shiftCountersRef.current.expenses += ingredientCost;
      shiftCountersRef.current.satisfactionSum += Math.max(
        0,
        Math.min(100, saveRef.current.satisfactionRating + satDelta),
      );
      shiftCountersRef.current.satisfactionEvents += 1;

      setShiftServedCount(shiftCountersRef.current.served);
      setShiftSalesUgx(shiftCountersRef.current.sales);
      setShiftTipsUgx(shiftCountersRef.current.tips);

      userMutatedSaveRef.current = true;
      recordOrderEvent({
        shiftNumber: saveRef.current.shiftCount + 1,
        recipeId: target.recipe.id,
        recipeName: target.recipe.name,
        personality: target.personality,
        quality: finalQuality,
        saleUgx,
        tipUgx,
        ingredientCostUgx: ingredientCost,
        netUgx: netEarned,
        status: 'served',
      });

      setSaveData((prev) => {
        const nextXp = prev.xp + xpGain;
        return {
          ...prev,
          cashUgx: Math.max(0, prev.cashUgx + netEarned),
          totalLifetimeUgx: prev.totalLifetimeUgx + saleUgx + tipUgx,
          xp: nextXp,
          level: computeLevelFromXp(nextXp),
          ordersCompletedTotal: prev.ordersCompletedTotal + 1,
          satisfactionRating: Math.max(15, Math.min(100, prev.satisfactionRating + satDelta)),
        };
      });

      const nextCook: CookingState = {
        ...INITIAL_COOKING,
        lastFeedback:
          finalQuality === 'perfect'
            ? `Perfect Rolex for ${target.customerName}! +${netEarned.toLocaleString()} UGX net (+${tipUgx.toLocaleString()} tip).`
            : finalQuality === 'good'
            ? `Served ${target.customerName} (+${netEarned.toLocaleString()} UGX net).`
            : `Served ${target.customerName}, order accuracy/cooking off (+${netEarned.toLocaleString()} UGX net).`,
      };
      cookingRef.current = nextCook;
      setCooking(nextCook);

      engineRef.current?.triggerCookingAction('serve');
      if (autoCameraRef.current) {
        engineRef.current?.setCameraFocus('counter');
        engineRef.current?.scheduleCameraFocus('overview', 1.15);
      }
    },
    [scheduleOrderRemoval],
  );

  // Cooking step handlers
  const handleStartChapati = useCallback(() => {
    if (!shiftActiveRef.current || isPausedRef.current) return;
    if (cookingRef.current.stage !== 'idle') return;
    const jumaStart = saveRef.current.employeeHired ? 22 : 0;
    audioRef.current?.startSizzle(0.5);
    engineRef.current?.triggerCookingAction('roll_dough');
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('prep');
      engineRef.current?.scheduleCameraFocus('tava', 1.05);
    }
    setCooking((prev) => ({
      ...prev,
      stage: 'chapati_grilling',
      chapatiProgress: jumaStart,
      chapatiQuality: null,
      eggCount: 0,
      selectedIngredients: [],
      omeletteProgress: 0,
      omeletteQuality: null,
      rollProgress: 0,
      panHeat: 0.75,
      lastFeedback: 'Rolling fresh dough & grilling chapati on the tava...',
    }));
  }, []);

  const handlePullChapati = useCallback(() => {
    if (isPausedRef.current) return;
    const c = cookingRef.current;
    if (c.stage !== 'chapati_grilling') return;
    const tavaBonus = (saveRef.current.upgrades['heavy_tava'] || 0) * 3;
    const minPerfect = 58 - tavaBonus;
    const maxPerfect = 86 + tavaBonus;

    let quality: CookQuality = 'good';
    let msg = 'Chapati lifted! Crack eggs and chop fresh fillings.';
    if (c.chapatiProgress >= minPerfect && c.chapatiProgress <= maxPerfect) {
      quality = 'perfect';
      msg = 'Golden blistered chapati! Now crack eggs & chop fillings.';
    } else if (c.chapatiProgress < 42 || c.chapatiProgress > 93) {
      quality = 'poor';
      msg =
        c.chapatiProgress < 42
          ? 'Chapati undercooked! Crack eggs & chop fillings.'
          : 'Chapati slightly charred! Crack eggs & chop fillings.';
    }

    audioRef.current?.stopSizzle();
    engineRef.current?.clearScheduledCamera();
    engineRef.current?.triggerCookingAction('flip_tava');
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('mix');
    }
    setCooking((prev) => ({
      ...prev,
      stage: 'chapati_ready',
      chapatiQuality: quality,
      panHeat: 0.4,
      lastFeedback: msg,
    }));
  }, []);

  const handleAddEgg = useCallback(() => {
    if (isPausedRef.current) return;
    const c = cookingRef.current;
    if (c.stage !== 'chapati_ready' && c.stage !== 'mixing_eggs') return;
    if (c.eggCount >= 3) return;
    audioRef.current?.playEggCrack();
    engineRef.current?.triggerCookingAction('crack_egg');
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('mix');
    }
    setCooking((prev) => ({
      ...prev,
      stage: 'mixing_eggs',
      eggCount: prev.eggCount + 1,
      lastFeedback: `Cracked ${prev.eggCount + 1} ${
        prev.eggCount + 1 === 1 ? 'egg' : 'eggs'
      } into the cup. Chop veggies and pour onto tava!`,
    }));
  }, []);

  const handleToggleIngredient = useCallback((id: IngredientId) => {
    if (isPausedRef.current) return;
    const c = cookingRef.current;
    if (c.stage !== 'chapati_ready' && c.stage !== 'mixing_eggs') return;
    audioRef.current?.playChop();
    engineRef.current?.triggerCookingAction('chop', INGREDIENTS[id].colorHex);
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('mix');
    }
    setCooking((prev) => {
      const exists = prev.selectedIngredients.includes(id);
      const next = exists
        ? prev.selectedIngredients.filter((x) => x !== id)
        : [...prev.selectedIngredients, id];
      return {
        ...prev,
        stage: 'mixing_eggs',
        selectedIngredients: next,
      };
    });
  }, []);

  const handleStartFryingOmelette = useCallback(() => {
    if (isPausedRef.current) return;
    const c = cookingRef.current;
    if (c.stage !== 'mixing_eggs' || c.eggCount === 0) return;
    audioRef.current?.startSizzle(0.85);
    engineRef.current?.triggerCookingAction('pour_egg');
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('tava');
    }
    setCooking((prev) => ({
      ...prev,
      stage: 'frying_omelette',
      omeletteProgress: 0,
      panHeat: 0.95,
      lastFeedback: 'Omelette sizzling! Press chapati onto egg in the golden sweet spot.',
    }));
  }, []);

  const handleCombineChapati = useCallback(() => {
    if (isPausedRef.current) return;
    const c = cookingRef.current;
    if (c.stage !== 'frying_omelette') return;

    const tavaBonus = (saveRef.current.upgrades['heavy_tava'] || 0) * 3;
    const minPerfect = 62 - tavaBonus;
    const maxPerfect = 88 + tavaBonus;

    let omeQuality: CookQuality = 'good';
    if (c.omeletteProgress >= minPerfect && c.omeletteProgress <= maxPerfect) {
      omeQuality = 'perfect';
    } else if (c.omeletteProgress < 45 || c.omeletteProgress > 94) {
      omeQuality = 'poor';
    }

    let overall: CookQuality = 'good';
    if (c.chapatiQuality === 'perfect' && omeQuality === 'perfect') {
      overall = 'perfect';
    } else if (c.chapatiQuality === 'poor' || omeQuality === 'poor') {
      overall = 'poor';
    }

    audioRef.current?.stopSizzle();
    audioRef.current?.playRoll();
    engineRef.current?.triggerCookingAction('roll_rolex');
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('roll');
    }

    setCooking((prev) => ({
      ...prev,
      stage: 'rolling',
      omeletteQuality: omeQuality,
      overallQuality: overall,
      rollProgress: 25,
      panHeat: 0.5,
      lastFeedback: 'Chapati bonded to omelette! Tap Roll to wrap tightly.',
    }));
  }, []);

  const handleRollStep = useCallback(() => {
    if (isPausedRef.current) return;
    const c = cookingRef.current;
    if (c.stage !== 'rolling' && c.stage !== 'combining') return;
    audioRef.current?.playRoll();
    engineRef.current?.triggerCookingAction('roll_rolex');
    const nextRoll = Math.min(100, c.rollProgress + 38);
    if (nextRoll >= 100) {
      if (autoCameraRef.current) {
        engineRef.current?.setCameraFocus('counter');
      }
      setCooking((prev) => ({
        ...prev,
        stage: 'ready_to_serve',
        rollProgress: 100,
        panHeat: 0.3,
        lastFeedback: 'Hot Rolex wrapped in kraft paper! Tap a customer to serve.',
      }));
    } else {
      if (autoCameraRef.current) {
        engineRef.current?.setCameraFocus('roll');
      }
      setCooking((prev) => ({
        ...prev,
        rollProgress: nextRoll,
      }));
    }
  }, []);

  const handleDiscardPan = useCallback(() => {
    audioRef.current?.stopSizzle();
    engineRef.current?.clearScheduledCamera();
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('overview');
    }
    setCooking({
      ...INITIAL_COOKING,
      lastFeedback: 'Tava cleared. Ready to grill a fresh chapati!',
    });
  }, []);

  // Mount Three.js engine & procedural audio once
  useEffect(() => {
    const audio = new AudioSystem();
    audio.setMuted(saveRef.current.soundMuted);
    audioRef.current = audio;

    const mount = canvasMountRef.current;
    if (!mount) return;

    let engine: RolexGameEngine | null = null;
    try {
      engine = new RolexGameEngine(mount, {
        onStationClicked: (station) => {
          const c = cookingRef.current;
          if (!shiftActiveRef.current || isPausedRef.current) return;
          if (station === 'prep' && c.stage === 'idle') {
            handleStartChapati();
          } else if (station === 'tava') {
            if (c.stage === 'idle') handleStartChapati();
            else if (c.stage === 'chapati_grilling') handlePullChapati();
            else if (c.stage === 'mixing_eggs' && c.eggCount > 0) handleStartFryingOmelette();
            else if (c.stage === 'frying_omelette') handleCombineChapati();
            else if (c.stage === 'rolling') handleRollStep();
          } else if (station === 'ingredients') {
            if (c.stage === 'chapati_ready' || c.stage === 'mixing_eggs') {
              handleAddEgg();
            }
          } else if (station === 'serve' && c.stage === 'ready_to_serve') {
            const targetId = selectedOrderRef.current || ordersRef.current[0]?.id;
            if (targetId) serveCustomer(targetId);
          }
        },
        onCustomerClicked: (customerId) => {
          setSelectedOrderId(customerId);
          if (cookingRef.current.stage === 'ready_to_serve') {
            serveCustomer(customerId);
          }
        },
        onUserCameraInteract: () => setAutoCamera(false),
        onWebglError: (msg) => setWebglError(msg),
      });

      engineRef.current = engine;
      engine
        .initialize()
        .then(() => {
          engine?.syncUpgradesVisuals(saveRef.current.upgrades, saveRef.current.employeeHired);
          engine?.syncCookingVisuals(cookingRef.current);
        })
        .catch(() => {
          setWebglError('Unable to initialize 3D WebGL graphics on this device.');
        });
    } catch {
      setWebglError('WebGL graphics are unavailable in this browser.');
    }

    return () => {
      clearDepartureTimers();
      audio.dispose();
      engine?.dispose();
      engineRef.current = null;
      audioRef.current = null;
    };
  }, [
    clearDepartureTimers,
    handleStartChapati,
    handlePullChapati,
    handleAddEgg,
    handleStartFryingOmelette,
    handleCombineChapati,
    handleRollStep,
    serveCustomer,
  ]);

  // Sync React state to 3D engine
  useEffect(() => {
    engineRef.current?.syncCookingVisuals(cooking);
  }, [cooking]);

  useEffect(() => {
    engineRef.current?.syncCustomers(orders);
  }, [orders]);

  // Pause sound sizzle when paused or shop open
  useEffect(() => {
    if (isPaused || shopOpen) {
      audioRef.current?.stopSizzle();
    }
  }, [isPaused, shopOpen]);

  // Start / Restart a 60-second shift cleanly
  const handleStartShift = useCallback(() => {
    clearDepartureTimers();
    audioRef.current?.stopSizzle();

    setShiftSummary(null);
    setShopOpen(false);
    setIsPaused(false);
    shiftRemainingRef.current = SHIFT_DURATION_SEC;
    setShiftTimeLeft(SHIFT_DURATION_SEC);

    shiftCountersRef.current = {
      served: 0,
      perfect: 0,
      missed: 0,
      sales: 0,
      tips: 0,
      expenses: 0,
      satisfactionSum: 0,
      satisfactionEvents: 0,
    };
    setShiftServedCount(0);
    setShiftSalesUgx(0);
    setShiftTipsUgx(0);

    const startCook: CookingState = {
      ...INITIAL_COOKING,
      lastFeedback: 'Shift started! First Kampala customer arriving now.',
    };
    cookingRef.current = startCook;
    setCooking(startCook);

    const s = saveRef.current;
    const canopyRank = s.upgrades['canopy_expand'] || 0;
    const patienceMult = 1 + canopyRank * 0.25 + (s.employeeHired ? 0.2 : 0);
    const hasSpice = (s.upgrades['prep_crate'] || 0) > 0;
    const firstCustomer = createCustomerOrder(0, s.level, patienceMult, hasSpice);

    ordersRef.current = [firstCustomer];
    setOrders([firstCustomer]);
    setSelectedOrderId(firstCustomer.id);
    audioRef.current?.playCustomerArrive();

    spawnTimerRef.current = 0;
    setShiftActive(true);
    engineRef.current?.clearScheduledCamera();
    if (autoCameraRef.current) {
      engineRef.current?.setCameraFocus('overview');
    }
  }, [clearDepartureTimers]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (shopOpen || shiftSummary) return;
      if (e.code === 'Escape' && shiftActiveRef.current) {
        e.preventDefault();
        setIsPaused((p) => !p);
        return;
      }
      if (isPausedRef.current) return;
      if (e.code === 'KeyH') {
        setDockCollapsed((d) => !d);
        return;
      }
      if (e.code === 'Space' && shiftActiveRef.current) {
        e.preventDefault();
        const c = cookingRef.current;
        if (c.stage === 'idle') handleStartChapati();
        else if (c.stage === 'chapati_grilling') handlePullChapati();
        else if (c.stage === 'frying_omelette') handleCombineChapati();
        else if (c.stage === 'rolling') handleRollStep();
        else if (c.stage === 'ready_to_serve') {
          const id = selectedOrderRef.current || ordersRef.current[0]?.id;
          if (id) serveCustomer(id);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    shopOpen,
    shiftSummary,
    handleStartChapati,
    handlePullChapati,
    handleCombineChapati,
    handleRollStep,
    serveCustomer,
  ]);

  // Clean 50ms gameplay simulation loop (no impure side-effects inside React state updaters)
  useEffect(() => {
    if (!shiftActive || isPaused || shopOpen) return;

    const intervalMs = 50;
    const dt = intervalMs / 1000;

    const timer = window.setInterval(() => {
      // 1. Shift countdown
      const nextRemaining = Math.max(0, shiftRemainingRef.current - dt);
      shiftRemainingRef.current = nextRemaining;
      setShiftTimeLeft(nextRemaining);

      if (nextRemaining <= 0) {
        setShiftActive(false);
        setIsPaused(false);
        clearDepartureTimers();
        audioRef.current?.stopSizzle();
        engineRef.current?.clearScheduledCamera();
        if (autoCameraRef.current) {
          engineRef.current?.setCameraFocus('overview');
        }

        const c = shiftCountersRef.current;
        const netProfit = Math.max(0, c.sales + c.tips - c.expenses);
        const avgSat =
          c.satisfactionEvents > 0
            ? Math.round(c.satisfactionSum / c.satisfactionEvents)
            : Math.round(saveRef.current.satisfactionRating);

        const nextShiftNum = saveRef.current.shiftCount + 1;
        const levelAfter = saveRef.current.level;
        const completedStats: ShiftStats = {
          shiftNumber: nextShiftNum,
          durationSeconds: SHIFT_DURATION_SEC,
          customersServed: c.served,
          perfectServes: c.perfect,
          missedOrders: c.missed,
          totalSalesUgx: c.sales,
          tipsEarnedUgx: c.tips,
          expensesUgx: c.expenses,
          netProfitUgx: netProfit,
          satisfactionAvg: avgSat,
        };

        userMutatedSaveRef.current = true;
        recordShiftCompleted(
          completedStats,
          getTierForLevel(levelAfter).locationName,
          levelAfter,
        );

        setSaveData((prevSave) => ({
          ...prevSave,
          shiftCount: prevSave.shiftCount + 1,
          bestShiftProfitUgx: Math.max(prevSave.bestShiftProfitUgx, netProfit),
        }));

        setShiftSummary(completedStats);

        ordersRef.current = [];
        setOrders([]);
        cookingRef.current = INITIAL_COOKING;
        setCooking(INITIAL_COOKING);
        return;
      }

      // 2. Cooking progress
      const s = saveRef.current;
      const tavaRank = s.upgrades['heavy_tava'] || 0;
      const gasRank = s.upgrades['gas_sigiri'] || 0;
      const speedMult = 1 + tavaRank * 0.16 + gasRank * 0.22;
      const curCook = cookingRef.current;

      if (curCook.stage === 'chapati_grilling') {
        const nextProg = curCook.chapatiProgress + dt * 27 * speedMult;
        if (nextProg >= 100) {
          audioRef.current?.stopSizzle();
          engineRef.current?.clearScheduledCamera();
          if (autoCameraRef.current) {
            engineRef.current?.setCameraFocus('mix');
          }
          const burned: CookingState = {
            ...curCook,
            stage: 'chapati_ready',
            chapatiProgress: 100,
            chapatiQuality: 'poor',
            panHeat: 0.4,
            lastFeedback: 'Chapati burned on the edge! Crack eggs & keep moving.',
          };
          cookingRef.current = burned;
          setCooking(burned);
        } else {
          const updatedCook = { ...curCook, chapatiProgress: nextProg };
          cookingRef.current = updatedCook;
          setCooking(updatedCook);
        }
      } else if (curCook.stage === 'frying_omelette') {
        const nextProg = curCook.omeletteProgress + dt * 25 * speedMult;
        if (nextProg >= 100) {
          audioRef.current?.stopSizzle();
          if (autoCameraRef.current) {
            engineRef.current?.setCameraFocus('roll');
          }
          const overcooked: CookingState = {
            ...curCook,
            stage: 'rolling',
            omeletteProgress: 100,
            omeletteQuality: 'poor',
            overallQuality: 'poor',
            rollProgress: 25,
            panHeat: 0.4,
            lastFeedback: 'Omelette overcooked! Roll quickly and serve.',
          };
          cookingRef.current = overcooked;
          setCooking(overcooked);
        } else {
          const updatedCook = { ...curCook, omeletteProgress: nextProg };
          cookingRef.current = updatedCook;
          setCooking(updatedCook);
        }
      }

      // 3. Customer patience & spawning
      const tier = getTierForLevel(s.level);
      spawnTimerRef.current += dt;

      let ordersChanged = false;
      let missedDelta = 0;
      const nextOrders: CustomerOrder[] = [];

      for (const o of ordersRef.current) {
        if (o.status === 'waiting') {
          const nextPat = o.patienceRemaining - dt;
          if (nextPat <= 0) {
            ordersChanged = true;
            missedDelta += 1;
            audioRef.current?.playAngryLeave();
            shiftCountersRef.current.missed += 1;
            recordOrderEvent({
              shiftNumber: s.shiftCount + 1,
              recipeId: o.recipe.id,
              recipeName: o.recipe.name,
              personality: o.personality,
              quality: 'missed',
              saleUgx: 0,
              tipUgx: 0,
              ingredientCostUgx: 0,
              netUgx: 0,
              status: 'missed',
            });
            scheduleOrderRemoval(o.id, 1700);
            nextOrders.push({ ...o, patienceRemaining: 0, status: 'leaving_angry' });
          } else {
            ordersChanged = true;
            nextOrders.push({ ...o, patienceRemaining: nextPat });
          }
        } else {
          nextOrders.push(o);
        }
      }

      if (missedDelta > 0) {
        setSaveData((prevSave) => ({
          ...prevSave,
          satisfactionRating: Math.max(15, prevSave.satisfactionRating - 5 * missedDelta),
        }));
      }

      const activeWaiting = nextOrders.filter(
        (o) => o.status === 'walking_in' || o.status === 'waiting',
      );
      if (
        spawnTimerRef.current >= tier.spawnIntervalSec &&
        activeWaiting.length < tier.maxConcurrentCustomers
      ) {
        spawnTimerRef.current = 0;
        const usedSlots = new Set(nextOrders.map((o) => o.slotIndex));
        const freeSlot = [0, 1, 2].find((idx) => !usedSlots.has(idx));
        if (freeSlot !== undefined) {
          const canopyRank = s.upgrades['canopy_expand'] || 0;
          const patienceMult = 1 + canopyRank * 0.25 + (s.employeeHired ? 0.2 : 0);
          const hasSpice = (s.upgrades['prep_crate'] || 0) > 0;
          const newCustomer = createCustomerOrder(freeSlot, s.level, patienceMult, hasSpice);
          nextOrders.push(newCustomer);
          audioRef.current?.playCustomerArrive();
          ordersChanged = true;
        }
      }

      if (ordersChanged) {
        ordersRef.current = nextOrders;
        setOrders(nextOrders);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [shiftActive, isPaused, shopOpen, clearDepartureTimers, scheduleOrderRemoval]);

  const handleBuyUpgrade = useCallback((upgrade: UpgradeDef) => {
    const prev = saveRef.current;
    const currentRank = prev.upgrades[upgrade.id] || 0;
    if (currentRank >= upgrade.maxRank || prev.level < upgrade.requiredLevel) return;
    const cost = Math.round(upgrade.costUgx * Math.pow(1.6, currentRank));
    if (prev.cashUgx < cost) return;

    userMutatedSaveRef.current = true;
    audioRef.current?.playCashChime(true);
    recordUpgradePurchased(upgrade.id, upgrade.name, currentRank + 1, cost, prev.level);

    setSaveData((curr) => {
      const rank = curr.upgrades[upgrade.id] || 0;
      if (rank >= upgrade.maxRank || curr.level < upgrade.requiredLevel) return curr;
      const actualCost = Math.round(upgrade.costUgx * Math.pow(1.6, rank));
      if (curr.cashUgx < actualCost) return curr;
      return {
        ...curr,
        cashUgx: curr.cashUgx - actualCost,
        upgrades: {
          ...curr.upgrades,
          [upgrade.id]: rank + 1,
        },
        employeeHired: curr.employeeHired || upgrade.id === 'hire_juma',
      };
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setSaveData((prev) => {
      const nextMuted = !prev.soundMuted;
      audioRef.current?.setMuted(nextMuted);
      return { ...prev, soundMuted: nextMuted };
    });
  }, []);

  const handleChangeCamera = useCallback((preset: CameraPreset) => {
    setAutoCamera(false);
    setCameraPreset(preset);
    engineRef.current?.setCameraPreset(preset);
  }, []);

  const handleToggleAutoCamera = useCallback(() => {
    setAutoCamera((prev) => {
      const next = !prev;
      if (next) {
        const st = cookingRef.current.stage;
        let focus: CameraFocusTarget = 'overview';
        if (st === 'chapati_grilling') focus = 'tava';
        else if (st === 'chapati_ready' || st === 'mixing_eggs') focus = 'mix';
        else if (st === 'frying_omelette') focus = 'tava';
        else if (st === 'combining' || st === 'rolling') focus = 'roll';
        else if (st === 'ready_to_serve') focus = 'counter';
        engineRef.current?.setCameraFocus(focus);
      } else {
        engineRef.current?.clearScheduledCamera();
      }
      return next;
    });
  }, []);

  const handleResetSave = useCallback(() => {
    const fresh = resetSaveData();
    setSaveData(fresh);
    setShopOpen(false);
  }, []);

  const currentTier = getTierForLevel(saveData.level);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#14110f] select-none">
      {/* Dedicated WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full"
        aria-label="3D Kampala Roadside Rolex Stall Viewport"
      />

      {/* Graceful WebGL Fallback */}
      {webglError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14110f]/95 p-6">
          <div className="max-w-md p-6 rounded-2xl bg-[#1d1815] border border-white/15 space-y-4 text-center">
            <h2 className="font-display text-xl font-bold text-[#fcdc04]">
              3D Graphics Unavailable
            </h2>
            <p className="text-sm text-[#cfc6ba]">{webglError}</p>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#f59e0b] text-[#14110f] text-xs font-bold cursor-pointer"
            >
              Return to Home Page
            </button>
          </div>
        </div>
      )}

      <GameHUD
        saveData={saveData}
        shiftActive={shiftActive}
        isPaused={isPaused}
        shiftTimeLeft={shiftTimeLeft}
        ordersCompletedShift={shiftServedCount}
        shiftEarningsUgx={shiftSalesUgx}
        shiftTipsUgx={shiftTipsUgx}
        orders={orders}
        selectedOrderId={selectedOrderId}
        cooking={cooking}
        cameraPreset={cameraPreset}
        autoCamera={autoCamera}
        dockCollapsed={dockCollapsed}
        onSelectOrder={setSelectedOrderId}
        onServeOrder={serveCustomer}
        onStartShift={handleStartShift}
        onTogglePause={() => setIsPaused((p) => !p)}
        onExitToHome={() => onNavigate('/')}
        onOpenShop={() => setShopOpen(true)}
        onToggleMute={handleToggleMute}
        onChangeCamera={handleChangeCamera}
        onToggleAutoCamera={handleToggleAutoCamera}
        onToggleDock={() => setDockCollapsed((d) => !d)}
        onStartChapati={handleStartChapati}
        onPullChapati={handlePullChapati}
        onAddEgg={handleAddEgg}
        onToggleIngredient={handleToggleIngredient}
        onStartFryingOmelette={handleStartFryingOmelette}
        onCombineChapati={handleCombineChapati}
        onRollStep={handleRollStep}
        onDiscardPan={handleDiscardPan}
      />

      {/* Pause Menu Modal */}
      {isPaused && shiftActive && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Game Paused"
        >
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#1b1714] border border-white/15 space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-[#f7f3eb]">Shift Paused</h2>
            <p className="text-xs text-[#b8afa3]">
              Remaining Shift Time: {Math.ceil(shiftTimeLeft)}s · Level {saveData.level}
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full min-h-[44px] rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold cursor-pointer"
              >
                Resume Shift
              </button>
              <button
                type="button"
                onClick={handleStartShift}
                className="w-full min-h-[44px] rounded-xl bg-white/10 hover:bg-white/18 text-[#f7f3eb] text-sm font-semibold cursor-pointer"
              >
                Restart 60s Shift
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/how-to-play')}
                className="w-full min-h-[44px] rounded-xl bg-white/6 hover:bg-white/12 text-[#d6cec3] text-sm font-semibold cursor-pointer"
              >
                View How to Play
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full min-h-[44px] rounded-xl bg-white/6 hover:bg-red-950/60 text-[#d6cec3] hover:text-red-200 text-sm font-semibold cursor-pointer"
              >
                Exit to Title Screen
              </button>
            </div>
          </div>
        </div>
      )}

      <ShopModal
        isOpen={shopOpen}
        saveData={saveData}
        onClose={() => setShopOpen(false)}
        onBuyUpgrade={handleBuyUpgrade}
        onResetSave={handleResetSave}
      />

      <ShiftSummaryModal
        stats={shiftSummary}
        cashUgx={saveData.cashUgx}
        level={saveData.level}
        locationName={currentTier.locationName}
        onStartNextShift={handleStartShift}
        onOpenShop={() => {
          setShiftSummary(null);
          setShopOpen(true);
        }}
        onExitToHome={() => onNavigate('/')}
      />
    </div>
  );
};
