"use client";

import { useStore } from "@/store/useStore";
import { useMemo, useState, useEffect } from "react";
import { TrendingUp, Wallet, AlertCircle, PiggyBank, Download, Filter } from "lucide-react";
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

type DebtStatusFilter = "all" | "PENDING" | "PAID" | "OVERDUE";

export default function AdminFinancialsPage() {
  const { bookings, users, resetUserDebt, debts, rides, fetchAllDebts, fetchUsers, fetchBookings, fetchRides } = useStore();
  const [statusFilter, setStatusFilter] = useState<DebtStatusFilter>("all");

  // Pagination states
  const [debtPage, setDebtPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAllDebts();
    fetchUsers();
    fetchBookings();
    fetchRides();
  }, [fetchAllDebts, fetchUsers, fetchBookings, fetchRides]);

  // Reset debt page when status filter changes
  useEffect(() => {
    setDebtPage(1);
  }, [statusFilter]);

  const filteredDebts = useMemo(() => {
    if (statusFilter === "all") return debts;
    return debts.filter((d) => d.status === statusFilter);
  }, [debts, statusFilter]);

  const totalDebtPages = Math.ceil(filteredDebts.length / itemsPerPage);

  const paginatedDebts = useMemo(() => {
    const start = (debtPage - 1) * itemsPerPage;
    return filteredDebts.slice(start, start + itemsPerPage);
  }, [filteredDebts, debtPage]);

  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === "confirmed"), [bookings]);
  const totalTxPages = Math.ceil(confirmedBookings.length / itemsPerPage);

  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * itemsPerPage;
    return confirmedBookings.slice(start, start + itemsPerPage);
  }, [confirmedBookings, txPage]);

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
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const totalVolume = confirmed.reduce((acc, b) => {
      const price = b.totalPrice || b.seatsReserved * (rides.find((r) => r.id === b.rideId)?.price || 0);
      return acc + price;
    }, 0);
    const totalCommission = confirmed.reduce((acc, b) => acc + (b.commission || 0), 0);
    const pendingDebts = debts
      .filter((d) => d.status === "PENDING" || d.status === "OVERDUE")
      .reduce((acc, d) => acc + d.amount, 0);
    const payouts = Math.max(0, totalVolume - totalCommission);

    return {
      volume: totalVolume,
      commission: totalCommission,
      pending: pendingDebts,
      payouts
    };
  }, [bookings, rides, debts]);

  const unpaid = useMemo(
    () => debts.filter((d) => d.status === "PENDING" || d.status === "OVERDUE").reduce((acc, d) => acc + d.amount, 0),
    [debts]
  );

  const pendingDebtAmount = useMemo(
    () => debts.filter((d) => d.status === "PENDING").reduce((acc, d) => acc + d.amount, 0),
    [debts]
  );

  const overdueAmount = useMemo(
    () => debts.filter((d) => d.status === "OVERDUE").reduce((acc, d) => acc + d.amount, 0),
    [debts]
  );

  const paidAmount = useMemo(
    () => debts.filter((d) => d.status === "PAID").reduce((acc, d) => acc + d.amount, 0),
    [debts]
  );

  const recoveryRate = useMemo(() => {
    const due = financialStats.commission + unpaid;
    if (due <= 0) return 100;
    return Math.round((financialStats.commission / due) * 100);
  }, [financialStats.commission, unpaid]);

  const splitData = useMemo(() => {
    const collectedCommission = Math.max(paidAmount, financialStats.commission - unpaid);
    return [
      { name: "Commissions perçues", value: collectedCommission, color: "var(--brand)" },
      { name: "En attente", value: pendingDebtAmount, color: "var(--ink)" },
      { name: "En retard", value: overdueAmount, color: "var(--line)" },
    ];
  }, [paidAmount, unpaid, pendingDebtAmount, overdueAmount, financialStats.commission]);

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

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate">
          <Filter size={15} />
          Filtrer par statut :
        </span>
        <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
          {(["all", "PENDING", "PAID", "OVERDUE"] as DebtStatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                statusFilter === status ? "bg-night text-on-night" : "text-slate hover:text-ink"
              }`}
            >
              {status === "all" ? "Tous" : status === "PENDING" ? "En attente" : status === "PAID" ? "Payés" : "En retard"}
            </button>
          ))}
        </div>
        <span className="chip bg-surface-alt tabular-nums text-graphite">
          {filteredDebts.length} dette(s)
        </span>
      </div>

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
          caption={`${debts.filter((d) => d.status === "PENDING" || d.status === "OVERDUE").length} dette(s)`}
          icon={AlertCircle}
          tone="danger"
        />
        <FinancialCard
          label="En retard"
          value={money(overdueAmount)}
          caption={`${debts.filter((d) => d.status === "OVERDUE").length} dette(s) overdue`}
          icon={AlertCircle}
          tone="danger"
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
          <h2 className="text-sm font-bold text-ink">Dettes des conducteurs</h2>
          <span className="chip bg-danger-soft tabular-nums text-danger">
            {filteredDebts.length} dette(s)
          </span>
        </div>
        <div className="scroll-x">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="overline px-4 py-3 text-left">ID Dette</th>
                <th className="overline px-4 py-3 text-left">Conducteur</th>
                <th className="overline px-4 py-3 text-right">Montant</th>
                <th className="overline px-4 py-3 text-right">Échéance</th>
                <th className="overline px-4 py-3 text-left">Statut</th>
                <th className="overline px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDebts.map((debt) => {
                const driver = users.find((u) => u.id === debt.driverId);
                const isOverdue = debt.status === "OVERDUE";
                const isPending = debt.status === "PENDING";
                const isPaid = debt.status === "PAID";
                const dueDate = new Date(debt.dueAt).toLocaleDateString("fr-FR");
                
                return (
                  <tr
                    key={debt.id}
                    className="border-t border-line transition-colors hover:bg-surface-alt"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-muted">
                      {debt.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                          {driver?.name.charAt(0) || "?"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink">{driver?.name || "Inconnu"}</span>
                          <span className="block truncate text-xs font-semibold text-muted">
                            {driver?.email || ""}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                      {money(debt.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-slate">
                      {dueDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {isPaid ? (
                        <span className="chip bg-success-soft text-success">Payé</span>
                      ) : isOverdue ? (
                        <span className="chip bg-danger-soft text-danger">En retard</span>
                      ) : (
                        <span className="chip bg-warning-soft text-warning">En attente</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      {isPending && (
                        <button
                          onClick={() => {
                            if (confirm(`Confirmer le paiement de ${money(debt.amount)} pour ${driver?.name || "ce conducteur"} ?`))
                              resetUserDebt(debt.driverId);
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          Marquer payé
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredDebts.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={6} className="p-5">
                    <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                      <p className="text-sm font-bold text-ink">Aucune dette trouvée</p>
                      <p className="mt-1 text-sm text-slate">
                        {statusFilter === "all" ? "Aucune dette enregistrée." : "Aucune dette avec ce statut."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls for debts */}
        {totalDebtPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line px-5 py-4 bg-surface-alt/30">
            <span className="text-xs font-semibold text-slate">
              Affichage de {Math.min(filteredDebts.length, (debtPage - 1) * itemsPerPage + 1)} à {Math.min(filteredDebts.length, debtPage * itemsPerPage)} sur {filteredDebts.length} dette(s)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDebtPage((p) => Math.max(1, p - 1))}
                disabled={debtPage === 1}
                className="btn btn-outline btn-sm min-h-0 py-1.5 px-3 text-xs"
              >
                Précédent
              </button>
              {Array.from({ length: totalDebtPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setDebtPage(page)}
                  className={`min-h-0 w-8 h-8 rounded-[8px] text-xs font-bold transition-all ${
                    debtPage === page
                      ? "bg-night text-on-night"
                      : "text-slate hover:bg-surface-alt hover:text-ink border border-line"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setDebtPage((p) => Math.min(totalDebtPages, p + 1))}
                disabled={debtPage === totalDebtPages}
                className="btn btn-outline btn-sm min-h-0 py-1.5 px-3 text-xs"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
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
                <th className="overline px-4 py-3 text-left">Conducteur / Date</th>
                <th className="overline px-4 py-3 text-right">Montant trajet / Commission</th>
                <th className="overline px-4 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((b) => {
                const ride = rides.find((r) => r.id === b.rideId);
                const driver = users.find((u) => u.id === ride?.driverId);
                const driverName = ride?.driverName || driver?.name || "Conducteur inconnu";
                const formattedDate = b.date
                  ? new Date(b.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                const tripAmount = b.totalPrice || b.seatsReserved * (ride?.price || 0);
                const commissionAmount = b.commission || tripAmount * 0.1;

                return (
                  <tr key={b.id} className="border-t border-line transition-colors hover:bg-surface-alt">
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 font-extrabold text-brand-dark">
                          {driverName.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <span className="block truncate font-bold text-ink">{driverName}</span>
                          <span className="block truncate text-xs font-semibold tabular-nums text-muted">
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <span className="block font-bold tabular-nums text-ink">
                        {money(tripAmount)}
                      </span>
                      <span className="block text-xs font-semibold tabular-nums text-brand-dark">
                        Comm: {money(commissionAmount)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {b.status === "confirmed" ? (
                        <span className="chip bg-success-soft text-success">Collecté</span>
                      ) : b.status === "pending" ? (
                        <span className="chip bg-warning-soft text-warning">En attente</span>
                      ) : (
                        <span className="chip bg-danger-soft text-danger">Annulé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {confirmedBookings.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={3} className="p-5">
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

        {/* Pagination controls for transactions */}
        {totalTxPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line px-5 py-4 bg-surface-alt/30">
            <span className="text-xs font-semibold text-slate">
              Affichage de {Math.min(confirmedBookings.length, (txPage - 1) * itemsPerPage + 1)} à {Math.min(confirmedBookings.length, txPage * itemsPerPage)} sur {confirmedBookings.length} transaction(s)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                disabled={txPage === 1}
                className="btn btn-outline btn-sm min-h-0 py-1.5 px-3 text-xs"
              >
                Précédent
              </button>
              {Array.from({ length: totalTxPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setTxPage(page)}
                  className={`min-h-0 w-8 h-8 rounded-[8px] text-xs font-bold transition-all ${
                    txPage === page
                      ? "bg-night text-on-night"
                      : "text-slate hover:bg-surface-alt hover:text-ink border border-line"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setTxPage((p) => Math.min(totalTxPages, p + 1))}
                disabled={txPage === totalTxPages}
                className="btn btn-outline btn-sm min-h-0 py-1.5 px-3 text-xs"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
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

