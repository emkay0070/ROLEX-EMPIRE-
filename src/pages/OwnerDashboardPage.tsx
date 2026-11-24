import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Box,
  Check,
  Copy,
  Database,
  Download,
  History,
  Play,
  Receipt,
  Search,
  Trash2,
  Upload,
  Wrench,
} from 'lucide-react';
import { AppRoute } from '../components/SiteLayout';
import { AssetDescriptor, fetchModelsManifest } from '../engine/AssetManager';
import {
  exportCareerArchive,
  getPersistenceSummary,
  hydrateSaveDataAsync,
  importCareerArchive,
  loadOrderLedger,
  loadSaveData,
  loadShiftHistory,
  loadUpgradeLog,
  resetSaveData,
} from '../engine/SaveSystem';
import { getTierForLevel, UPGRADES } from '../data/upgrades';
import {
  CustomerPersonality,
  OrderLedgerRecord,
  PersistenceSummary,
  SaveData,
  ShiftRecord,
  UpgradePurchaseRecord,
} from '../types/game';

interface OwnerDashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

type DashboardSection = 'overview' | 'shifts' | 'orders' | 'data' | 'models';
type OrderQualityFilter = 'all' | 'perfect' | 'good' | 'poor' | 'missed';

const PERSONALITY_LABELS: Record<CustomerPersonality, string> = {
  friendly_boda: 'Boda Rider',
  student_rush: 'Student',
  office_pro: 'Office Worker',
  market_mama: 'Market Trader',
  food_critic: 'Food Critic',
};

const SECTION_META: Array<{
  id: DashboardSection;
  label: string;
  title: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', title: 'Business Overview', icon: BarChart3 },
  { id: 'shifts', label: 'Shifts', title: 'Shift History', icon: History },
  { id: 'orders', label: 'Orders', title: 'Order Ledger', icon: Receipt },
  { id: 'models', label: '3D Models', title: '3D Models Directory', icon: Box },
  { id: 'data', label: 'Data & Upgrades', title: 'Upgrades & Storage', icon: Database },
];

function formatDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({ onNavigate }) => {
  const [section, setSection] = useState<DashboardSection>('overview');
  const [loading, setLoading] = useState(true);
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [orders, setOrders] = useState<OrderLedgerRecord[]>([]);
  const [upgrades, setUpgrades] = useState<UpgradePurchaseRecord[]>([]);
  const [summary, setSummary] = useState<PersistenceSummary | null>(null);
  const [manifestModels, setManifestModels] = useState<AssetDescriptor[]>([]);

  const [orderSearch, setOrderSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<OrderQualityFilter>('all');
  const [shiftSearch, setShiftSearch] = useState('');
  const [modelFolderFilter, setModelFolderFilter] = useState<string>('all');
  const [modelSearch, setModelSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAllFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, shiftRows, orderRows, upgradeRows, persistMeta, modelsManifest] =
        await Promise.all([
          hydrateSaveDataAsync(),
          loadShiftHistory(),
          loadOrderLedger(500),
          loadUpgradeLog(),
          getPersistenceSummary(),
          fetchModelsManifest(),
        ]);
      setSaveData(profile);
      setShifts(shiftRows);
      setOrders(orderRows);
      setUpgrades(upgradeRows);
      setSummary(persistMeta);
      setManifestModels(modelsManifest?.models || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllFromStorage();
  }, [loadAllFromStorage]);

  const tier = getTierForLevel(saveData.level);

  const analytics = useMemo(() => {
    const totalSalesUgx = shifts.reduce((acc, s) => acc + s.totalSalesUgx, 0);
    const totalTipsUgx = shifts.reduce((acc, s) => acc + s.tipsEarnedUgx, 0);
    const totalExpensesUgx = shifts.reduce((acc, s) => acc + s.expensesUgx, 0);
    const totalNetProfitUgx = shifts.reduce((acc, s) => acc + s.netProfitUgx, 0);

    const servedOrders = orders.filter((o) => o.status === 'served');
    const perfectCount = servedOrders.filter((o) => o.quality === 'perfect').length;
    const perfectRate =
      servedOrders.length > 0 ? Math.round((perfectCount / servedOrders.length) * 100) : 0;

    // Recipe breakdown
    const recipeMap = new Map<
      string,
      { recipeName: string; count: number; revenueUgx: number; tipsUgx: number }
    >();
    for (const ord of servedOrders) {
      const prev = recipeMap.get(ord.recipeId) || {
        recipeName: ord.recipeName,
        count: 0,
        revenueUgx: 0,
        tipsUgx: 0,
      };
      prev.count += 1;
      prev.revenueUgx += ord.saleUgx;
      prev.tipsUgx += ord.tipUgx;
      recipeMap.set(ord.recipeId, prev);
    }
    const topRecipes = Array.from(recipeMap.values()).sort((a, b) => b.revenueUgx - a.revenueUgx);

    // Customer mix breakdown
    const custMap = new Map<CustomerPersonality, { count: number; tipsUgx: number }>();
    for (const ord of servedOrders) {
      const prev = custMap.get(ord.personality) || { count: 0, tipsUgx: 0 };
      prev.count += 1;
      prev.tipsUgx += ord.tipUgx;
      custMap.set(ord.personality, prev);
    }
    const customerMix = Array.from(custMap.entries())
      .map(([personality, val]) => ({
        personality,
        label: PERSONALITY_LABELS[personality] || personality,
        ...val,
      }))
      .sort((a, b) => b.count - a.count);

    // Chronological last 10 shifts for trend bars
    const recentShiftsAsc = [...shifts].slice(0, 10).reverse();
    const maxShiftProfit = Math.max(1000, ...recentShiftsAsc.map((s) => s.netProfitUgx));

    return {
      totalSalesUgx,
      totalTipsUgx,
      totalExpensesUgx,
      totalNetProfitUgx,
      perfectRate,
      topRecipes,
      customerMix,
      recentShiftsAsc,
      maxShiftProfit,
    };
  }, [shifts, orders]);

  const filteredShifts = useMemo(() => {
    const q = shiftSearch.trim().toLowerCase();
    if (!q) return shifts;
    return shifts.filter(
      (s) =>
        `shift ${s.shiftNumber}`.includes(q) ||
        s.locationName.toLowerCase().includes(q),
    );
  }, [shifts, shiftSearch]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      if (qualityFilter !== 'all' && o.quality !== qualityFilter) return false;
      if (!q) return true;
      return (
        o.recipeName.toLowerCase().includes(q) ||
        PERSONALITY_LABELS[o.personality].toLowerCase().includes(q) ||
        `shift ${o.shiftNumber}`.includes(q)
      );
    });
  }, [orders, qualityFilter, orderSearch]);

  const modelFolders = useMemo(() => {
    const set = new Set<string>();
    for (const m of manifestModels) {
      if (m.folder) set.add(m.folder);
    }
    return ['all', ...Array.from(set)];
  }, [manifestModels]);

  const filteredModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    return manifestModels.filter((m) => {
      if (modelFolderFilter !== 'all' && m.folder !== modelFolderFilter) return false;
      if (!q) return true;
      return (
        m.id.toLowerCase().includes(q) ||
        (m.slotLabel || '').toLowerCase().includes(q) ||
        (m.glbUrl || '').toLowerCase().includes(q) ||
        (m.notes || '').toLowerCase().includes(q)
      );
    });
  }, [manifestModels, modelFolderFilter, modelSearch]);

  const activeGlbCount = useMemo(
    () => manifestModels.filter((m) => m.enabled && Boolean(m.glbUrl)).length,
    [manifestModels],
  );

  const handleCopyModelPath = async (id: string, path: string) => {
    try {
      await navigator.clipboard.writeText(`public${path}`);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      setNotice({ kind: 'ok', text: `Target path: public${path}` });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'RecordType',
      'Timestamp',
      'ShiftNumber',
      'ItemOrLocation',
      'QualityOrServed',
      'SalesUGX',
      'TipsUGX',
      'NetUGX',
    ];
    const rows: string[] = [headers.map(escapeCsvCell).join(',')];

    for (const s of shifts) {
      rows.push(
        [
          'SHIFT',
          new Date(s.completedAt).toISOString(),
          s.shiftNumber,
          s.locationName,
          `${s.customersServed} served / ${s.missedOrders} missed`,
          s.totalSalesUgx,
          s.tipsEarnedUgx,
          s.netProfitUgx,
        ]
          .map(escapeCsvCell)
          .join(','),
      );
    }

    for (const o of orders) {
      rows.push(
        [
          'ORDER',
          new Date(o.servedAt).toISOString(),
          o.shiftNumber,
          `${o.recipeName} (${PERSONALITY_LABELS[o.personality]})`,
          o.quality,
          o.saleUgx,
          o.tipUgx,
          o.netUgx,
        ]
          .map(escapeCsvCell)
          .join(','),
      );
    }

    downloadFile(
      `rolex-empire-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.join('\n'),
      'text/csv;charset=utf-8',
    );
    setNotice({ kind: 'ok', text: 'Exported shift and order accounting CSV.' });
  };

  const handleExportJsonBackup = async () => {
    const payload = await exportCareerArchive();
    downloadFile(
      `rolex-empire-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    );
    setNotice({ kind: 'ok', text: 'Downloaded full career JSON backup from IndexedDB.' });
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importCareerArchive(text);
      await loadAllFromStorage();
      setNotice({ kind: 'ok', text: `Restored backup from ${file.name}.` });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Unable to parse backup file.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleResetAll = async () => {
    const fresh = resetSaveData();
    setSaveData(fresh);
    setShifts([]);
    setOrders([]);
    setUpgrades([]);
    setConfirmReset(false);
    setNotice({ kind: 'ok', text: 'Local stall career and IndexedDB history cleared.' });
    window.setTimeout(() => {
      void loadAllFromStorage();
    }, 150);
  };

  const activeSectionMeta = SECTION_META.find((s) => s.id === section) || SECTION_META[0];

  return (
    <div className="min-h-screen bg-[#14110f] text-[#f7f3eb] flex flex-col lg:flex-row">
      {/* Desktop Left Workspace Sidebar */}
      <aside className="hidden lg:flex lg:w-[252px] shrink-0 flex-col border-r border-white/10 bg-[#171411]">
        <div className="px-6 py-5 border-b border-white/10">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="font-display text-xl font-extrabold tracking-tight text-[#fcdc04] whitespace-nowrap"
          >
            Rolex Empire
          </a>
          <p className="text-xs text-[#9c9286] mt-1">Owner Operations Ledger</p>
        </div>

        <nav aria-label="Dashboard Sections" className="flex-1 p-3 space-y-1">
          {SECTION_META.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#f59e0b] text-[#14110f] font-semibold'
                    : 'text-[#d6cec3] hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2 text-xs">
          <p className="text-[#9c9286]">Active Branch</p>
          <p className="font-semibold text-[#f7f3eb]">{tier.locationName}</p>
          <p className="text-[#bfb5a8] font-mono-tabular">
            Level {saveData.level} · {tier.title}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Breadcrumb Bar */}
        <header className="sticky top-0 z-20 bg-[#161310]/95 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 text-sm">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-xs font-semibold text-[#f7f3eb] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#9c9286] truncate">
              <span>Rolex Empire</span>
              <span aria-hidden="true">/</span>
              <span>Owner Ledger</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#f7f3eb] font-medium">{activeSectionMeta.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#f7f3eb] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/play')}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Open Stall</span>
            </button>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden border-b border-white/10 bg-[#171411] px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
          {SECTION_META.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'bg-[#f59e0b] text-[#14110f]' : 'bg-white/6 text-[#d6cec3]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          {notice && (
            <div
              role="status"
              className={`px-4 py-3 rounded-xl border text-xs flex items-center justify-between gap-4 ${
                notice.kind === 'ok'
                  ? 'bg-emerald-950/50 border-emerald-500/35 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/35 text-red-200'
              }`}
            >
              <span>{notice.text}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-xs underline opacity-80 hover:opacity-100 cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-6" aria-label="Loading IndexedDB ledger">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-[#1b1714] border border-white/10 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-64 rounded-xl bg-[#1b1714] border border-white/10 animate-pulse" />
            </div>
          ) : (
            <>
              {/* SECTION 1: OVERVIEW */}
              {section === 'overview' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#f7f3eb]">
                        Owner Operations Overview
                      </h1>
                      <p className="text-xs text-[#9c9286] mt-1">
                        {tier.locationName} · Level {saveData.level} · {saveData.xp.toLocaleString()} XP
                      </p>
                    </div>
                    <p className="text-xs text-[#bfb5a8]">
                      Local Store:{' '}
                      <span className="font-mono-tabular text-[#f7f3eb]">
                        {summary?.backend === 'indexeddb' ? 'IndexedDB (rolex_empire_db)' : 'localStorage'}
                      </span>
                    </p>
                  </div>

                  {/* Primary KPI Strip */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-[#1b1714] border border-white/10">
                      <p className="text-xs text-[#9c9286]">Cash On Hand</p>
                      <p className="font-mono-tabular text-2xl font-bold text-[#fcdc04] mt-1.5">
                        {saveData.cashUgx.toLocaleString()} UGX
                      </p>
                      <p className="text-xs text-[#bfb5a8] mt-1 font-mono-tabular">
                        Lifetime: {saveData.totalLifetimeUgx.toLocaleString()} UGX
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-[#1b1714] border border-white/10">
                      <p className="text-xs text-[#9c9286]">Best Shift Net Profit</p>
                      <p className="font-mono-tabular text-2xl font-bold text-emerald-400 mt-1.5">
                        {saveData.bestShiftProfitUgx.toLocaleString()} UGX
                      </p>
                      <p className="text-xs text-[#bfb5a8] mt-1 font-mono-tabular">
                        Shifts Worked: {saveData.shiftCount}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-[#1b1714] border border-white/10">
                      <p className="text-xs text-[#9c9286]">Total Rolex Served</p>
                      <p className="font-mono-tabular text-2xl font-bold text-[#f7f3eb] mt-1.5">
                        {saveData.ordersCompletedTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#bfb5a8] mt-1 font-mono-tabular">
                        Perfect Rate: {analytics.perfectRate}%
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-[#1b1714] border border-white/10">
                      <p className="text-xs text-[#9c9286]">Customer Satisfaction</p>
                      <p className="font-mono-tabular text-2xl font-bold text-[#f7f3eb] mt-1.5">
                        {Math.round(saveData.satisfactionRating)}%
                      </p>
                      <p className="text-xs text-[#bfb5a8] mt-1">
                        {saveData.employeeHired ? 'Staff: Chef Juma Active' : 'Staff: Solo Chef'}
                      </p>
                    </div>
                  </div>

                  {/* Empty State if no shifts recorded in IndexedDB yet */}
                  {shifts.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#1b1714] border border-white/10 text-center space-y-3">
                      <h2 className="font-display text-lg font-bold text-[#f7f3eb]">
                        No Completed Shifts Recorded Yet
                      </h2>
                      <p className="text-sm text-[#bfb5a8] max-w-lg mx-auto">
                        Complete a 60-second roadside shift at Kireka to record detailed profit,
                        recipe sales, customer mix, and cooking quality entries in IndexedDB.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('/play')}
                          className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start First Shift</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Recent Shifts Net Profit Bar Chart */}
                      <section className="p-6 rounded-xl bg-[#1b1714] border border-white/10 space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h2 className="font-display text-base font-bold text-[#f7f3eb]">
                              Recent Shift Net Profit
                            </h2>
                            <p className="text-xs text-[#9c9286] mt-0.5">
                              Last {analytics.recentShiftsAsc.length} recorded shifts · Total logged
                              profit{' '}
                              <span className="font-mono-tabular text-[#f7f3eb]">
                                {analytics.totalNetProfitUgx.toLocaleString()} UGX
                              </span>
                            </p>
                          </div>
                          <span className="text-xs text-[#bfb5a8] font-mono-tabular">
                            Tips: {analytics.totalTipsUgx.toLocaleString()} UGX
                          </span>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 items-end h-44 pt-4 border-b border-white/10 pb-2">
                          {analytics.recentShiftsAsc.map((s) => {
                            const heightPct = Math.max(
                              8,
                              Math.round((s.netProfitUgx / analytics.maxShiftProfit) * 100),
                            );
                            return (
                              <div key={s.id} className="flex flex-col items-center gap-2 h-full justify-end">
                                <span className="text-[11px] font-mono-tabular text-[#d6cec3]">
                                  {Math.round(s.netProfitUgx / 1000)}k
                                </span>
                                <div
                                  className="w-full max-w-[34px] rounded-t-md bg-[#f59e0b] transition-opacity hover:opacity-90"
                                  style={{ height: `${heightPct}%` }}
                                  title={`Shift #${s.shiftNumber}: ${s.netProfitUgx.toLocaleString()} UGX net`}
                                />
                                <span className="text-[11px] font-mono-tabular text-[#9c9286]">
                                  #{s.shiftNumber}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* Recipe Performance & Customer Mix Tables */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="rounded-xl bg-[#1b1714] border border-white/10 overflow-hidden">
                          <div className="px-5 py-4 border-b border-white/10">
                            <h2 className="font-display text-base font-bold text-[#f7f3eb]">
                              Revenue by Rolex Recipe
                            </h2>
                          </div>
                          {analytics.topRecipes.length === 0 ? (
                            <p className="p-5 text-xs text-[#9c9286]">
                              Serve orders during shifts to populate recipe revenue.
                            </p>
                          ) : (
                            <table className="w-full text-xs">
                              <thead className="border-b border-white/10 text-[#9c9286]">
                                <tr>
                                  <th className="text-left font-medium px-5 py-2.5">Recipe</th>
                                  <th className="text-right font-medium px-4 py-2.5">Orders</th>
                                  <th className="text-right font-medium px-5 py-2.5">Sales + Tips</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {analytics.topRecipes.map((r) => (
                                  <tr key={r.recipeName} className="hover:bg-white/[0.03]">
                                    <td className="px-5 py-2.5 font-medium text-[#f7f3eb]">
                                      {r.recipeName}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-mono-tabular text-[#d6cec3]">
                                      {r.count}
                                    </td>
                                    <td className="px-5 py-2.5 text-right font-mono-tabular text-[#fcdc04]">
                                      {(r.revenueUgx + r.tipsUgx).toLocaleString()} UGX
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </section>

                        <section className="rounded-xl bg-[#1b1714] border border-white/10 overflow-hidden">
                          <div className="px-5 py-4 border-b border-white/10">
                            <h2 className="font-display text-base font-bold text-[#f7f3eb]">
                              Customer Traffic Breakdown
                            </h2>
                          </div>
                          {analytics.customerMix.length === 0 ? (
                            <p className="p-5 text-xs text-[#9c9286]">
                              Customer archetype stats appear after serving orders.
                            </p>
                          ) : (
                            <table className="w-full text-xs">
                              <thead className="border-b border-white/10 text-[#9c9286]">
                                <tr>
                                  <th className="text-left font-medium px-5 py-2.5">Customer Type</th>
                                  <th className="text-right font-medium px-4 py-2.5">Served</th>
                                  <th className="text-right font-medium px-5 py-2.5">Tips Earned</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {analytics.customerMix.map((c) => (
                                  <tr key={c.personality} className="hover:bg-white/[0.03]">
                                    <td className="px-5 py-2.5 font-medium text-[#f7f3eb]">
                                      {c.label}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-mono-tabular text-[#d6cec3]">
                                      {c.count}
                                    </td>
                                    <td className="px-5 py-2.5 text-right font-mono-tabular text-emerald-400">
                                      +{c.tipsUgx.toLocaleString()} UGX
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </section>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SECTION 2: SHIFT HISTORY */}
              {section === 'shifts' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-[#f7f3eb]">
                        Shift Financial History
                      </h1>
                      <p className="text-xs text-[#9c9286] mt-0.5">
                        {shifts.length} shifts recorded in IndexedDB
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-[#9c9286] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={shiftSearch}
                        onChange={(e) => setShiftSearch(e.target.value)}
                        placeholder="Filter by shift or location..."
                        aria-label="Filter shift history"
                        className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-lg bg-[#1b1714] border border-white/12 text-xs text-[#f7f3eb] placeholder:text-[#8c8378] focus:outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                  </div>

                  {filteredShifts.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#1b1714] border border-white/10 text-center space-y-3">
                      <p className="text-sm text-[#bfb5a8]">
                        {shifts.length === 0
                          ? 'No shifts completed yet. Run a 60-second shift to record your first financial close.'
                          : 'No shifts match your current search filter.'}
                      </p>
                      {shifts.length === 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigate('/play')}
                          className="min-h-[42px] px-5 py-2 rounded-lg bg-[#f59e0b] text-[#14110f] text-xs font-extrabold cursor-pointer"
                        >
                          Play a Shift
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#1b1714] border border-white/10 overflow-x-auto">
                      <table className="w-full text-xs min-w-[740px]">
                        <thead className="border-b border-white/10 text-[#9c9286]">
                          <tr>
                            <th className="text-left font-medium px-4 py-3">Shift</th>
                            <th className="text-left font-medium px-4 py-3">Location</th>
                            <th className="text-right font-medium px-3 py-3">Served</th>
                            <th className="text-right font-medium px-3 py-3">Perfect</th>
                            <th className="text-right font-medium px-3 py-3">Missed</th>
                            <th className="text-right font-medium px-3 py-3">Sales</th>
                            <th className="text-right font-medium px-3 py-3">Tips</th>
                            <th className="text-right font-medium px-3 py-3">Net Profit</th>
                            <th className="text-right font-medium px-4 py-3">Closed At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredShifts.map((s) => (
                            <tr key={s.id} className="hover:bg-white/[0.03]">
                              <td className="px-4 py-3 font-mono-tabular font-semibold text-[#f7f3eb]">
                                #{s.shiftNumber}
                              </td>
                              <td className="px-4 py-3 text-[#d6cec3]">{s.locationName}</td>
                              <td className="px-3 py-3 text-right font-mono-tabular text-[#f7f3eb]">
                                {s.customersServed}
                              </td>
                              <td className="px-3 py-3 text-right font-mono-tabular text-emerald-400">
                                {s.perfectServes}
                              </td>
                              <td className="px-3 py-3 text-right font-mono-tabular text-[#bfb5a8]">
                                {s.missedOrders}
                              </td>
                              <td className="px-3 py-3 text-right font-mono-tabular text-[#d6cec3]">
                                {s.totalSalesUgx.toLocaleString()}
                              </td>
                              <td className="px-3 py-3 text-right font-mono-tabular text-[#d6cec3]">
                                {s.tipsEarnedUgx.toLocaleString()}
                              </td>
                              <td className="px-3 py-3 text-right font-mono-tabular font-bold text-[#fcdc04]">
                                {s.netProfitUgx.toLocaleString()} UGX
                              </td>
                              <td className="px-4 py-3 text-right font-mono-tabular text-[#9c9286]">
                                {formatDateTime(s.completedAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: ORDER LEDGER */}
              {section === 'orders' && (
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-[#f7f3eb]">
                        Customer Order Ledger
                      </h1>
                      <p className="text-xs text-[#9c9286] mt-0.5">
                        Showing {filteredOrders.length} of {orders.length} recorded orders
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1b1714] border border-white/10">
                        {(['all', 'perfect', 'good', 'poor', 'missed'] as OrderQualityFilter[]).map(
                          (qf) => (
                            <button
                              key={qf}
                              type="button"
                              onClick={() => setQualityFilter(qf)}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap cursor-pointer ${
                                qualityFilter === qf
                                  ? 'bg-[#f59e0b] text-[#14110f] font-semibold'
                                  : 'text-[#bfb5a8] hover:text-white'
                              }`}
                            >
                              {qf}
                            </button>
                          ),
                        )}
                      </div>

                      <div className="relative w-full sm:w-56">
                        <Search className="w-4 h-4 text-[#9c9286] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="search"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          placeholder="Search recipe or customer..."
                          aria-label="Search order ledger"
                          className="w-full min-h-[38px] pl-9 pr-3 py-1.5 rounded-lg bg-[#1b1714] border border-white/12 text-xs text-[#f7f3eb] placeholder:text-[#8c8378] focus:outline-none focus:border-[#f59e0b]"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#1b1714] border border-white/10 text-center space-y-2">
                      <p className="text-sm text-[#bfb5a8]">
                        {orders.length === 0
                          ? 'No orders logged yet. Serve customers on the stall to record transactions.'
                          : 'No orders match this quality filter or search query.'}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#1b1714] border border-white/10 overflow-x-auto">
                      <table className="w-full text-xs min-w-[700px]">
                        <thead className="border-b border-white/10 text-[#9c9286]">
                          <tr>
                            <th className="text-left font-medium px-4 py-3">Time</th>
                            <th className="text-right font-medium px-3 py-3">Shift</th>
                            <th className="text-left font-medium px-4 py-3">Recipe</th>
                            <th className="text-left font-medium px-4 py-3">Customer</th>
                            <th className="text-left font-medium px-4 py-3">Result</th>
                            <th className="text-right font-medium px-3 py-3">Sale</th>
                            <th className="text-right font-medium px-3 py-3">Tip</th>
                            <th className="text-right font-medium px-4 py-3">Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredOrders.map((o) => {
                            const qualityText =
                              o.quality === 'perfect'
                                ? 'text-emerald-400'
                                : o.quality === 'good'
                                  ? 'text-[#fcdc04]'
                                  : o.quality === 'poor'
                                    ? 'text-amber-400'
                                    : 'text-red-400';

                            return (
                              <tr key={o.id} className="hover:bg-white/[0.03]">
                                <td className="px-4 py-2.5 font-mono-tabular text-[#9c9286]">
                                  {formatDateTime(o.servedAt)}
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono-tabular text-[#bfb5a8]">
                                  #{o.shiftNumber}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-[#f7f3eb]">
                                  {o.recipeName}
                                </td>
                                <td className="px-4 py-2.5 text-[#d6cec3]">
                                  {PERSONALITY_LABELS[o.personality]}
                                </td>
                                <td className={`px-4 py-2.5 font-semibold capitalize ${qualityText}`}>
                                  {o.quality}
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono-tabular text-[#d6cec3]">
                                  {o.saleUgx.toLocaleString()}
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono-tabular text-[#d6cec3]">
                                  {o.tipUgx.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono-tabular font-semibold text-[#f7f3eb]">
                                  {o.netUgx.toLocaleString()} UGX
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3.5: 3D MODELS DIRECTORY */}
              {section === 'models' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div>
                      <h1 className="font-display text-2xl font-bold text-[#f7f3eb]">
                        3D Models Directory &amp; Manifest
                      </h1>
                      <p className="text-xs text-[#9c9286] mt-1">
                        Drop <code className="text-[#f7f3eb]">.glb</code> files into{' '}
                        <code className="text-[#f7f3eb]">public/assets/models/&lt;folder&gt;/</code>{' '}
                        and set <code className="text-[#fcdc04]">enabled: true</code> in{' '}
                        <code className="text-[#f7f3eb]">public/assets/models/manifest.json</code>.
                      </p>
                    </div>
                    <p className="text-xs font-mono-tabular text-[#bfb5a8]">
                      Active GLBs:{' '}
                      <span className="text-[#fcdc04] font-semibold">
                        {activeGlbCount} / {manifestModels.length}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#1b1714] border border-white/10">
                      {modelFolders.map((folder) => (
                        <button
                          key={folder}
                          type="button"
                          onClick={() => setModelFolderFilter(folder)}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap cursor-pointer ${
                            modelFolderFilter === folder
                              ? 'bg-[#f59e0b] text-[#14110f] font-semibold'
                              : 'text-[#bfb5a8] hover:text-white'
                          }`}
                        >
                          {folder}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full lg:w-64">
                      <Search className="w-4 h-4 text-[#9c9286] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Search asset ID or file..."
                        aria-label="Search 3D model slots"
                        className="w-full min-h-[38px] pl-9 pr-3 py-1.5 rounded-lg bg-[#1b1714] border border-white/12 text-xs text-[#f7f3eb] placeholder:text-[#8c8378] focus:outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#1b1714] border border-white/10 overflow-x-auto">
                    <table className="w-full text-xs min-w-[780px]">
                      <thead className="border-b border-white/10 text-[#9c9286]">
                        <tr>
                          <th className="text-left font-medium px-4 py-3">Slot &amp; Asset ID</th>
                          <th className="text-left font-medium px-4 py-3">Target Drop-In Path</th>
                          <th className="text-right font-medium px-3 py-3">Target Size</th>
                          <th className="text-left font-medium px-4 py-3">Active Mode</th>
                          <th className="text-right font-medium px-4 py-3">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredModels.map((m) => {
                          const isGlb = Boolean(m.enabled && m.glbUrl);
                          const scaleLabel = m.targetHeight
                            ? `${m.targetHeight}m height`
                            : m.targetMaxDim
                              ? `${m.targetMaxDim}m max`
                              : 'auto';
                          const targetFile = m.glbUrl || `/assets/models/${m.folder || 'misc'}/${m.id}.glb`;

                          return (
                            <tr key={m.id} className="hover:bg-white/[0.03]">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-[#f7f3eb]">
                                  {m.slotLabel || m.id}
                                </p>
                                <p className="font-mono-tabular text-[11px] text-[#9c9286] mt-0.5">
                                  {m.id}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-mono-tabular text-[#d6cec3]">
                                  public{targetFile}
                                </p>
                                {m.notes && (
                                  <p className="text-[11px] text-[#9c9286] mt-0.5">{m.notes}</p>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right font-mono-tabular text-[#d6cec3] whitespace-nowrap">
                                {scaleLabel}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`font-semibold ${
                                    isGlb ? 'text-emerald-400' : 'text-[#9c9286]'
                                  }`}
                                >
                                  {isGlb ? 'GLB Active' : 'Procedural'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => void handleCopyModelPath(m.id, targetFile)}
                                  className="min-h-[32px] px-2.5 py-1 rounded-md bg-white/8 hover:bg-white/15 text-[#f7f3eb] inline-flex items-center gap-1 cursor-pointer"
                                  title={`Copy public${targetFile}`}
                                >
                                  {copiedId === m.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Path</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 4: UPGRADES & STORAGE */}
              {section === 'data' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-[#f7f3eb]">
                      Equipment Investments &amp; Storage
                    </h1>
                    <p className="text-xs text-[#9c9286] mt-1">
                      Manage IndexedDB backups, upgrade investment records, and local career reset
                    </p>
                  </div>

                  {/* Installed Equipment Status */}
                  <section className="rounded-xl bg-[#1b1714] border border-white/10 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
                      <h2 className="font-display text-base font-bold text-[#f7f3eb]">
                        Current Stall Equipment &amp; Staff Ranks
                      </h2>
                      <Wrench className="w-4 h-4 text-[#9c9286]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-px bg-white/10">
                      {UPGRADES.map((u) => {
                        const rank = saveData.upgrades[u.id] || 0;
                        return (
                          <div key={u.id} className="p-4 bg-[#1b1714] space-y-1">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-[#f7f3eb]">{u.name}</span>
                              <span className="font-mono-tabular text-[#fcdc04]">
                                {rank}/{u.maxRank}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#9c9286]">{u.effectLabel}</p>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Upgrade Purchase Log */}
                  <section className="rounded-xl bg-[#1b1714] border border-white/10 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10">
                      <h2 className="font-display text-base font-bold text-[#f7f3eb]">
                        Capital Expenditure Log
                      </h2>
                    </div>
                    {upgrades.length === 0 ? (
                      <p className="p-5 text-xs text-[#9c9286]">
                        No equipment purchases logged yet in IndexedDB.
                      </p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead className="border-b border-white/10 text-[#9c9286]">
                          <tr>
                            <th className="text-left font-medium px-5 py-2.5">Date</th>
                            <th className="text-left font-medium px-4 py-2.5">Upgrade</th>
                            <th className="text-right font-medium px-4 py-2.5">Rank</th>
                            <th className="text-right font-medium px-5 py-2.5">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {upgrades.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.03]">
                              <td className="px-5 py-2.5 font-mono-tabular text-[#9c9286]">
                                {formatDateTime(u.purchasedAt)}
                              </td>
                              <td className="px-4 py-2.5 font-medium text-[#f7f3eb]">
                                {u.upgradeName}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono-tabular text-[#d6cec3]">
                                Rank {u.rank}
                              </td>
                              <td className="px-5 py-2.5 text-right font-mono-tabular text-[#fcdc04]">
                                {u.costUgx.toLocaleString()} UGX
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>

                  {/* IndexedDB Backup & Reset */}
                  <section className="p-6 rounded-xl bg-[#1b1714] border border-white/10 space-y-5">
                    <div>
                      <h2 className="font-display text-base font-bold text-[#f7f3eb]">
                        IndexedDB Storage &amp; Career Backup
                      </h2>
                      <p className="text-xs text-[#bfb5a8] mt-1 font-mono-tabular">
                        Shifts: {summary?.shiftRecordsCount ?? 0} · Orders:{' '}
                        {summary?.orderLedgerCount ?? 0} · Upgrades: {summary?.upgradeLogCount ?? 0}
                        {summary?.lastSavedAt ? ` · Last saved ${formatDateTime(summary.lastSavedAt)}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleExportJsonBackup()}
                        className="min-h-[42px] px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export JSON Backup</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[42px] px-4 py-2 rounded-lg bg-white/8 hover:bg-white/15 border border-white/12 text-xs font-semibold text-[#f7f3eb] inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Restore JSON Backup</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={(e) => void handleImportJson(e)}
                        className="hidden"
                      />

                      {!confirmReset ? (
                        <button
                          type="button"
                          onClick={() => setConfirmReset(true)}
                          className="min-h-[42px] px-4 py-2 rounded-lg bg-white/6 hover:bg-red-950/70 border border-white/10 text-xs font-semibold text-[#bfb5a8] hover:text-red-300 inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Reset Local Data</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-300">Erase IndexedDB &amp; save?</span>
                          <button
                            type="button"
                            onClick={() => void handleResetAll()}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Confirm Erase
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
