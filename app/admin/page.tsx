"use client";

import { useStore } from "@/store/useStore";
import { useMemo, useState, useEffect } from "react";
import {
  Users,
  Car,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import Link from "next/link";

type Period = "week" | "month" | "year" | "all";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;

const PERIOD_LABEL: Record<Period, string> = {
  week: "Semaine",
  month: "Mois",
  year: "Année",
  all: "Tout",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "À l'instant";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays < 30) return `Il y a ${diffDays} j`;
  if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
  return `Il y a ${diffYears} an${diffYears > 1 ? "s" : ""}`;
}

export default function AdminDashboard() {
  const {
    users,
    rides,
    bookings,
    kycDocuments,
    vehicles,
    debts,
    fetchKycDocuments,
    fetchKycVehicles,
    fetchUsers,
    fetchRides,
    fetchBookings,
    fetchAllDebts,
  } = useStore();
  const [period, setPeriod] = useState<Period>("all");
  const reduce = useReducedMotion();

  useEffect(() => {
    fetchUsers();
    fetchRides();
    fetchBookings();
    fetchKycDocuments();
    fetchKycVehicles();
    fetchAllDebts();
  }, [fetchUsers, fetchRides, fetchBookings, fetchKycDocuments, fetchKycVehicles, fetchAllDebts]);

  const overdueCount = useMemo(
    () => users.filter((u) => u.debtDays > 7 && (u.totalDebt || 0) > 0).length,
    [users]
  );

  const pendingKycDocs = useMemo(() => kycDocuments.filter((d) => d.status === "PENDING").length, [kycDocuments]);
  const unverifiedVehicles = useMemo(() => vehicles.filter((v) => !v.isVerified).length, [vehicles]);

  const pendingDocs = pendingKycDocs;
  const pendingVehicles = unverifiedVehicles;

  const stats = useMemo(() => {
    const now = new Date();
    const getDaysDiff = (dateStr?: string) => {
      if (!dateStr) return 0;
      const date = new Date(dateStr);
      return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    };

    const isInPeriod = (dateStr: string | undefined, p: Period, isPrevious = false) => {
      const diff = getDaysDiff(dateStr);
      if (p === "week") {
        return isPrevious ? diff > 7 && diff <= 14 : diff <= 7;
      }
      if (p === "month") {
        return isPrevious ? diff > 30 && diff <= 60 : diff <= 30;
      }
      if (p === "year") {
        return isPrevious ? diff > 365 && diff <= 730 : diff <= 365;
      }
      // "all": compare past 30 days vs prior 30 days for trend calculation
      return isPrevious ? diff > 30 && diff <= 60 : true;
    };

    const periodBookings = bookings.filter((b) => isInPeriod(b.date, period));
    const periodRides = rides.filter((r) => isInPeriod(r.date, period));

    const totalEarnings = periodBookings
      .filter((b) => b.status === "confirmed")
      .reduce((acc, b) => acc + b.commission, 0);

    const blockedUsers = users.filter((u) => u.isBlocked || u.status === "BLOCKED").length;
    const activeRides = periodRides.filter((r) => r.status === "available").length;

    // Previous period metrics for trend calculation
    const prevPeriodBookings = bookings.filter((b) => isInPeriod(b.date, period, true));
    const prevPeriodRides = rides.filter((r) => isInPeriod(r.date, period, true));
    const prevEarnings = prevPeriodBookings
      .filter((b) => b.status === "confirmed")
      .reduce((acc, b) => acc + b.commission, 0);

    const currUsersCount = users.filter((u) => isInPeriod(u.createdAt, period)).length;
    const prevUsersCount = users.filter((u) => isInPeriod(u.createdAt, period, true)).length;

    const prevActiveRides = prevPeriodRides.filter((r) => r.status === "available").length;
    const prevBlockedUsers = users.filter((u) => u.debtDays > 7 && isInPeriod(u.createdAt, period, true)).length;
    const prevPendingDocs = kycDocuments.filter((d) => d.status === "PENDING" && isInPeriod(d.createdAt, period, true)).length;
    const prevUnverifiedVehicles = vehicles.filter((v) => !v.isVerified && isInPeriod(v.createdAt, period, true)).length;

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) {
        if (curr === 0) return { trend: "0%", up: true };
        return { trend: "+100%", up: true };
      }
      const pct = Math.round(((curr - prev) / prev) * 100);
      if (pct >= 0) {
        return { trend: `+${pct}%`, up: true };
      }
      return { trend: `${pct}%`, up: false };
    };

    const earningsTrend = calcTrend(totalEarnings, prevEarnings);
    const usersTrend = calcTrend(currUsersCount, prevUsersCount);
    const ridesTrend = calcTrend(activeRides, prevActiveRides);
    const blockedTrend = calcTrend(blockedUsers, prevBlockedUsers);
    const kycDocsTrend = calcTrend(pendingKycDocs, prevPendingDocs);
    const vehiclesTrend = calcTrend(unverifiedVehicles, prevUnverifiedVehicles);

    return {
      earnings: {
        value: money(totalEarnings),
        trend: earningsTrend.trend,
        up: earningsTrend.up,
      },
      secondary: [
        {
          label: "Utilisateurs",
          value: String(users.length),
          icon: Users,
          trend: usersTrend.trend,
          up: usersTrend.up,
        },
        {
          label: "Trajets actifs",
          value: String(activeRides),
          icon: Car,
          trend: ridesTrend.trend,
          up: ridesTrend.up,
        },
        {
          label: "Conducteurs bloqués",
          value: String(blockedUsers),
          icon: ShieldAlert,
          trend: blockedTrend.trend,
          up: !blockedTrend.up,
          danger: blockedUsers > 0,
        },
        {
          label: "Documents KYC en attente",
          value: String(pendingDocs),
          icon: FileText,
          trend: kycDocsTrend.trend,
          up: !kycDocsTrend.up,
          danger: pendingDocs > 0,
        },
        {
          label: "Véhicules à valider",
          value: String(pendingVehicles),
          icon: Car,
          trend: vehiclesTrend.trend,
          up: !vehiclesTrend.up,
          danger: pendingVehicles > 0,
        },
      ],
    };
  }, [users, rides, bookings, period, kycDocuments, vehicles, pendingKycDocs, unverifiedVehicles]);

  const recentActivity = useMemo(
    () =>
      bookings.slice(0, 5).map((b) => ({
        id: b.id,
        user: b.passengerName,
        action: "a réservé un trajet",
        time: formatRelativeTime(b.date),
        status: b.status,
        amount: b.totalPrice,
      })),
    [bookings]
  );

  const commissionSeries = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const now = new Date();

    if (period === "week") {
      const buckets = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
        return { key: d.toDateString(), name: DAYS[d.getDay()], value: 0 };
      });
      confirmed.forEach((b) => {
        const key = new Date(b.date).toDateString();
        const bucket = buckets.find((x) => x.key === key);
        if (bucket) bucket.value += b.commission;
      });
      return buckets.map(({ name, value }) => ({ name, value }));
    }

    if (period === "month") {
      const buckets = Array.from({ length: 5 }, (_, i) => ({ name: `S${i + 1}`, value: 0 }));
      confirmed.forEach((b) => {
        const diff = (now.getTime() - new Date(b.date).getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 0 || diff > 34) return;
        const index = 4 - Math.min(4, Math.floor(diff / 7));
        buckets[index].value += b.commission;
      });
      return buckets;
    }

    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { month: d.getMonth(), year: d.getFullYear(), name: MONTHS[d.getMonth()], value: 0 };
    });
    confirmed.forEach((b) => {
      const d = new Date(b.date);
      const bucket = buckets.find((x) => x.month === d.getMonth() && x.year === d.getFullYear());
      if (bucket) bucket.value += b.commission;
    });
    return buckets.map(({ name, value }) => ({ name, value }));
  }, [bookings, period]);

  const alerts = useMemo(
    () =>
      users
        .map((u) => {
          const userDebts = debts.filter((d) => d.driverId === u.id && d.status !== "PAID");
          const computedDebt = userDebts.reduce((sum, d) => sum + d.amount, 0);
          const effectiveDebt = (u.totalDebt && u.totalDebt > 0) ? u.totalDebt : computedDebt;
          return {
            ...u,
            totalDebt: effectiveDebt,
          };
        })
        .filter((u) => (u.totalDebt || 0) > 0 && u.debtDays > 0)
        .sort((a, b) => b.debtDays - a.debtDays),
    [users, debts]
  );

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Vue d&apos;ensemble</h1>
          <p className="mt-1 text-sm text-slate">L&apos;activité de la plateforme en un coup d&apos;œil.</p>
        </div>

        <div className="scroll-x no-scrollbar -mx-1 shrink-0 px-1">
          <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
            {(["week", "month", "year", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                  period === p ? "bg-night text-on-night" : "text-slate hover:text-ink"
                }`}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Overdue alert — one thin line, not a slab */}
      <AnimatePresence initial={false}>
        {overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-col gap-3 rounded-[14px] border border-danger/25 bg-danger-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-ink">
              <ShieldAlert size={16} className="shrink-0 text-danger" />
              <span className="min-w-0">
                <span className="font-bold">{overdueCount} conducteur(s)</span> dépassent 7 jours de
                retard sur leur commission.
              </span>
            </p>
            <Link
              href="/admin/financials"
              className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-danger transition-opacity hover:opacity-70"
            >
              Gérer les dettes
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The money panel + the secondary counters */}
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <motion.section
          {...fade()}
          className="relative isolate overflow-hidden rounded-panel bg-night p-5 sm:p-6"
        >
          {/* the brand chevron, quietly, behind the numbers */}
          <svg
            viewBox="0 0 100 140"
            aria-hidden
            className="pointer-events-none absolute -right-6 top-1/2 h-[70%] w-auto -translate-y-1/2 text-white/[0.04]"
            fill="currentColor"
          >
            <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
          </svg>

          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/50">
                Commissions encaissées · {PERIOD_LABEL[period].toLowerCase()}
              </p>
              <p className="mt-2 text-display tabular-nums text-white">{stats.earnings.value}</p>
              <p className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="chip bg-brand/15 tabular-nums text-brand">
                  <TrendingUp size={13} />
                  {stats.earnings.trend}
                </span>
                <span className="text-xs font-semibold text-white/40">vs période précédente</span>
              </p>
            </div>

            <Link
              href="/admin/financials"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Finances
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="relative mt-5 h-[170px] w-full sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={commissionSeries} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="adminCommissionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 11, fontWeight: 600 }}
                  dy={8}
                  interval="preserveStartEnd"
                  minTickGap={6}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
                  formatter={(value) =>
                    [money(Number(value ?? 0)), "Commissions"] as [string, string]
                  }
                  contentStyle={{
                    background: "#1c1e25",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700 }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--brand)"
                  strokeWidth={2.5}
                  fill="url(#adminCommissionFill)"
                  activeDot={{ r: 4, fill: "var(--brand)", stroke: "#1c1e25", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Secondary counters: rows, not four identical slabs */}
        <motion.section
          {...fade(0.06)}
          className="card flex flex-col divide-y divide-line overflow-hidden"
        >
          {stats.secondary.map((s) => (
            <div key={s.label} className="flex flex-1 items-center gap-4 px-5 py-[1.15rem]">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-[11px] ${
                  s.danger ? "bg-danger-soft text-danger" : "bg-surface-alt text-graphite"
                }`}
              >
                <s.icon size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate">{s.label}</p>
                <p className="mt-0.5 text-title tabular-nums text-ink">{s.value}</p>
              </div>

              <span
                className={`chip shrink-0 tabular-nums ${
                  s.up ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                }`}
              >
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {s.trend}
              </span>
            </div>
          ))}
        </motion.section>

        {/* KYC Alerts */}
        {(pendingDocs > 0 || pendingVehicles > 0) && (
          <motion.section
            {...fade(0.1)}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <AlertTriangle size={15} className="text-slate" />
                Alertes KYC
              </h2>
              <span className="chip bg-warning-soft tabular-nums text-warning">
                {pendingDocs + pendingVehicles} en attente
              </span>
            </div>
            <div className="divide-y divide-line-soft">
              {pendingDocs > 0 && (
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning">
                      <FileText size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">Documents KYC en attente</p>
                      <p className="text-xs font-semibold text-muted">
                        {pendingDocs} document(s) nécessitent une vérification
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/kyc?section=documents"
                    className="btn btn-outline btn-sm shrink-0"
                  >
                    Vérifier
                  </Link>
                </div>
              )}
              {pendingVehicles > 0 && (
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning">
                      <Car size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">Véhicules à valider</p>
                      <p className="text-xs font-semibold text-muted">
                        {pendingVehicles} véhicule(s) en attente de validation
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/kyc?section=vehicles"
                    className="btn btn-outline btn-sm shrink-0"
                  >
                    Valider
                  </Link>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </div>

      {/* Activity + late commissions */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <motion.section {...fade(0.12)} className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Activité récente</h2>
            <Link
              href="/admin/rides"
              className="flex items-center gap-1 text-xs font-bold text-slate transition-colors hover:text-ink"
            >
              Voir tout
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentActivity.length > 0 ? (
            /* A timeline on the itinerary rail — the brand's own device */
            <ol className="px-5 py-4">
              {recentActivity.map((a, i) => (
                <li key={a.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < recentActivity.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[5px] top-4 bottom-0 w-px bg-line"
                    />
                  )}
                  <span
                    className={`relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ${
                      a.status === "confirmed"
                        ? "bg-brand ring-4 ring-brand-tint"
                        : a.status === "cancelled"
                          ? "bg-danger ring-4 ring-danger-soft"
                          : "bg-surface ring-[1.5px] ring-line"
                    }`}
                  />

                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{a.user}</p>
                      <p className="truncate text-xs font-semibold text-muted">
                        {a.action} · {a.time}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums text-ink">{money(a.amount)}</p>
                      <p
                        className={`text-[11px] font-bold ${
                          a.status === "confirmed"
                            ? "text-success"
                            : a.status === "cancelled"
                              ? "text-danger"
                              : "text-warning"
                        }`}
                      >
                        {a.status === "confirmed"
                          ? "Confirmée"
                          : a.status === "cancelled"
                            ? "Annulée"
                            : "En attente"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="p-5">
              <div className="rounded-[14px] border border-dashed border-line px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate">
                  Aucune réservation pour l&apos;instant.
                </p>
              </div>
            </div>
          )}
        </motion.section>

        <motion.section {...fade(0.18)} className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <AlertTriangle size={15} className="text-slate" />
              Commissions en retard
            </h2>
            <span className="chip bg-surface-alt tabular-nums text-graphite">{alerts.length}</span>
          </div>

          {alerts.length > 0 ? (
            <ul className="divide-y divide-line-soft">
              {alerts.map((u) => {
                const days = Math.min(u.debtDays, 7);
                const late = u.debtDays > 7;
                return (
                  <li key={u.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{u.name}</p>
                        <p className="mt-0.5 text-xs font-semibold tabular-nums text-muted">
                          {money(u.totalDebt || 0)} dus
                        </p>
                      </div>
                      <Link href="/admin/financials" className="btn btn-outline btn-sm shrink-0">
                        Relancer
                      </Link>
                    </div>

                    {/* the 7-day clock, made visible */}
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-alt">
                        <div
                          className={`h-full rounded-full ${late ? "bg-danger" : "bg-warning"}`}
                          style={{ width: `${(days / 7) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-bold tabular-nums ${
                          late ? "text-danger" : "text-slate"
                        }`}
                      >
                        {u.debtDays} j / 7
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5">
              <div className="rounded-[14px] border border-dashed border-line px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate">Aucun retard de commission.</p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  Tous les conducteurs sont à jour.
                </p>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
