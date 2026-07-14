"use client";

import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { TrendingUp, Wallet, AlertCircle, PiggyBank, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import type { LucideIcon } from "lucide-react";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;

export default function AdminFinancialsPage() {
  const { bookings, users, resetUserDebt } = useStore();

  const debtors = useMemo(() => {
    return users.filter((u) => (u.totalDebt || 0) > 0);
  }, [users]);

  const chartData = useMemo(() => {
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];

    const now = new Date();
    const last12Months: { month: string; year: number; monthIndex: number; revenue: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last12Months.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        revenue: 0
      });
    }

    bookings.filter(b => b.status === "confirmed").forEach(b => {
      const bDate = new Date(b.date);
      const monthData = last12Months.find(m =>
        m.monthIndex === bDate.getMonth() && m.year === bDate.getFullYear()
      );
      if (monthData) {
        monthData.revenue += b.commission;
      }
    });

    return last12Months.map(m => ({
      name: m.month,
      revenue: m.revenue
    }));
  }, [bookings]);

  const financialStats = useMemo(() => {
    const confirmedBookings = bookings.filter(b => b.status === "confirmed");
    const totalVolume = confirmedBookings.reduce((acc, b) => acc + (b.seatsReserved * 1500), 0); // Mock price calculation
    const totalCommission = confirmedBookings.reduce((acc, b) => acc + b.commission, 0);

    return {
      volume: totalVolume,
      commission: totalCommission,
      pending: 12500, // Mock pending
      payouts: 450000 // Mock total payouts
    };
  }, [bookings]);

  const unpaid = useMemo(
    () => debtors.reduce((acc, u) => acc + (u.totalDebt || 0), 0),
    [debtors]
  );

  const recoveryRate = useMemo(() => {
    const due = financialStats.commission + unpaid;
    if (due <= 0) return 100;
    return Math.round((financialStats.commission / due) * 100);
  }, [financialStats.commission, unpaid]);

  const splitData = useMemo(
    () => [
      { name: "Commissions perçues", value: financialStats.commission, color: "var(--brand)" },
      { name: "En attente", value: financialStats.pending, color: "var(--ink)" },
      { name: "Impayés", value: unpaid, color: "var(--line)" },
    ],
    [financialStats.commission, financialStats.pending, unpaid]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Finances</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Revenus, commissions et dettes conducteurs.
          </p>
        </div>
        <button className="btn btn-outline btn-sm w-full shrink-0 sm:w-auto">
          <Download size={16} />
          Exporter le rapport
        </button>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <FinancialCard
          label="Volume d'affaires"
          value={money(financialStats.volume)}
          caption="+12,5 % vs période précédente"
          icon={TrendingUp}
          tone="neutral"
        />
        <FinancialCard
          label="Commissions perçues"
          value={money(financialStats.commission)}
          caption="+15,2 % vs période précédente"
          icon={PiggyBank}
          tone="brand"
        />
        <FinancialCard
          label="Impayés"
          value={money(unpaid)}
          caption={`${debtors.length} conducteur(s) concerné(s)`}
          icon={AlertCircle}
          tone="danger"
        />
        <FinancialCard
          label="Taux de recouvrement"
          value={`${recoveryRate} %`}
          caption="Commissions encaissées sur dues"
          icon={Wallet}
          tone="success"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Évolution des revenus mensuels</h2>
            <span className="chip bg-brand-soft text-brand-dark">FCFA</span>
          </div>

          <div className="h-[220px] w-full p-3 sm:h-[300px] sm:p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  stroke="var(--line)"
                  tick={{ fill: "var(--slate)", fontSize: 12, fontWeight: 600 }}
                  dy={8}
                  interval="preserveStartEnd"
                  minTickGap={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke="var(--line)"
                  width={48}
                  tick={{ fill: "var(--slate)", fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-alt)" }}
                  formatter={(value) => [money(Number(value ?? 0)), "Commissions"] as [string, string]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    color: "var(--ink)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  labelStyle={{ color: "var(--slate)", fontSize: 12, fontWeight: 700 }}
                  itemStyle={{ color: "var(--ink)" }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === chartData.length - 1 ? "var(--brand)" : "var(--brand-tint)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Split donut + custom legend */}
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Répartition des commissions</h2>
          </div>

          <div className="flex flex-col items-center gap-4 p-5 sm:flex-row">
            <div className="h-[180px] w-full max-w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={splitData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  >
                    {splitData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => money(Number(value ?? 0))}
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      color: "var(--ink)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    labelStyle={{ color: "var(--slate)", fontSize: 12, fontWeight: 700 }}
                    itemStyle={{ color: "var(--ink)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="w-full min-w-0 space-y-3">
              {splitData.map((entry) => (
                <li key={entry.name} className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: entry.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate">
                    {entry.name}
                  </span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-ink">
                    {money(entry.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Debtors */}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Commissions à collecter</h2>
          <span className="chip bg-danger-soft tabular-nums text-danger">
            {debtors.length} conducteur(s) en dette
          </span>
        </div>
        <div className="scroll-x">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="overline px-4 py-3 text-left">Conducteur</th>
                <th className="overline px-4 py-3 text-right">Montant dû</th>
                <th className="overline px-4 py-3 text-right">Retard</th>
                <th className="overline px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((u) => {
                const late = u.debtDays > 7;
                return (
                  <tr
                    key={u.id}
                    className="border-t border-line transition-colors hover:bg-surface-alt"
                  >
                    <td
                      className={`whitespace-nowrap px-4 py-3.5 ${
                        late ? "border-l-2 border-danger" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                          {u.name.charAt(0)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink">{u.name}</span>
                          <span className="block truncate text-xs font-semibold text-muted">
                            {u.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                      {money(u.totalDebt || 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <span
                        className={`text-sm tabular-nums ${
                          late ? "font-bold text-danger" : "font-semibold text-slate"
                        }`}
                      >
                        {u.debtDays} jour(s)
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Confirmer le paiement de ${money(u.totalDebt || 0)} pour ${u.name} ?`))
                            resetUserDebt(u.id);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Marquer comme payé
                      </button>
                    </td>
                  </tr>
                );
              })}
              {debtors.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={4} className="p-5">
                    <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                      <p className="text-sm font-bold text-ink">Aucune dette en cours</p>
                      <p className="mt-1 text-sm text-slate">
                        Toutes les commissions sont à jour.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Transactions récentes</h2>
          <span className="chip bg-surface-alt text-graphite">30 derniers jours</span>
        </div>
        <div className="scroll-x">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="overline px-4 py-3 text-left">Date</th>
                <th className="overline px-4 py-3 text-left">Conducteur</th>
                <th className="overline px-4 py-3 text-right">Montant trajet</th>
                <th className="overline px-4 py-3 text-right">Commission</th>
                <th className="overline px-4 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter((b) => b.status === "confirmed")
                .map((b, i) => (
                  <tr key={i} className="border-t border-line transition-colors hover:bg-surface-alt">
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold tabular-nums text-slate">
                      09 avr. 2026
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-bold text-ink">
                      Conducteur ID : {b.rideId.split("-")[1]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-graphite">
                      {money(b.seatsReserved * 1500)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                      {money(b.commission)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="chip bg-success-soft text-success">Collecté</span>
                    </td>
                  </tr>
                ))}
              {bookings.filter((b) => b.status === "confirmed").length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={5} className="p-5">
                    <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                      <p className="text-sm font-bold text-ink">Aucune transaction</p>
                      <p className="mt-1 text-sm text-slate">
                        Les commissions apparaîtront ici dès la première réservation confirmée.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FinancialCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone?: "neutral" | "brand" | "danger" | "success";
}) {
  const toneClass =
    tone === "brand"
      ? "bg-brand-soft text-brand-dark"
      : tone === "danger"
        ? "bg-danger-soft text-danger"
        : tone === "success"
          ? "bg-success-soft text-success"
          : "bg-surface-alt text-graphite";

  return (
    <div className="card p-4 sm:p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-[11px] ${toneClass}`}>
        <Icon size={18} />
      </span>
      <p className="overline mt-3.5 truncate">{label}</p>
      <p className="mt-1 text-title tabular-nums text-ink sm:text-display">{value}</p>
      <p className="mt-2 truncate text-xs font-semibold text-muted">{caption}</p>
    </div>
  );
}
