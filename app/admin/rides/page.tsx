"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useMemo } from "react";
import { Search, MoreVertical, CheckCircle2, XCircle, Route, Filter, Car, Ban } from "lucide-react";
import { getInitials } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;

type RideStatusFilter = "all" | "OPEN" | "FULL" | "IN_PROGRESS" | "CANCELLED" | "COMPLETED";

const STATUS_FILTER_OPTIONS: { key: RideStatusFilter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "OPEN", label: "Ouverts" },
  { key: "FULL", label: "Complets" },
  { key: "IN_PROGRESS", label: "En cours" },
  { key: "CANCELLED", label: "Annulés" },
  { key: "COMPLETED", label: "Terminés" },
];

function VerticalRouteRail({
  from,
  to,
  date,
  time,
}: {
  from: string;
  to: string;
  date: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 min-w-[200px]">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
          <span className="text-[13px] font-bold text-ink truncate">{from}</span>
        </div>
        <div className="ml-1 h-3 w-0.5 bg-line" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full border-2 border-muted bg-surface shrink-0" />
          <span className="text-[13px] font-bold text-ink truncate">{to}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 text-xs font-semibold tabular-nums text-muted shrink-0">
        <span>{date}</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

export default function AdminRidesPage() {
  const { rides, bookings, deleteRide, vehicles, fetchKycVehicles, fetchRides, fetchBookings } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<RideStatusFilter>("all");
  
  // Modal state
  const [rideToCancel, setRideToCancel] = useState<{ id: string; from: string; to: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchKycVehicles();
    fetchRides();
    fetchBookings();
  }, [fetchKycVehicles, fetchRides, fetchBookings]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, statusFilter]);

  const filteredRides = rides.filter((r) => {
    const matchesSearch =
      r.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter ? r.date === dateFilter : true;

    const matchesStatus =
      statusFilter === "all" ||
      r.status === statusFilter ||
      (statusFilter === "OPEN" && r.status === "available") ||
      (statusFilter === "FULL" && r.status === "full") ||
      (statusFilter === "CANCELLED" && r.status === "cancelled") ||
      (statusFilter === "COMPLETED" && r.status === "completed");

    return matchesSearch && matchesDate && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRides.length / itemsPerPage);

  const paginatedRides = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRides.slice(start, start + itemsPerPage);
  }, [filteredRides, currentPage]);

  const handleConfirmCancelRide = async () => {
    if (!rideToCancel) return;
    await deleteRide(rideToCancel.id);
    setRideToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Trajets</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Surveillez les trajets ouverts et passés, et retirez ceux qui posent problème.
          </p>
        </div>
        <span className="chip shrink-0 bg-surface-alt tabular-nums text-graphite">
          <Route size={13} />
          {filteredRides.length} trajet(s)
        </span>
      </header>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate">
          <Filter size={15} />
          Filtrer par statut :
        </span>
        <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
          {STATUS_FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              aria-pressed={statusFilter === key}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                statusFilter === key ? "bg-night text-on-night" : "text-slate hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher par ville ou conducteur…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field pl-10"
            aria-label="Rechercher un trajet"
          />
        </div>
        <div className="relative shrink-0 sm:w-52">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="field pr-10"
            aria-label="Filtrer par date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              aria-label="Effacer la date"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="scroll-x">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="overline px-4 py-3 text-left">Trajet</th>
                <th className="overline px-4 py-3 text-left">Conducteur</th>
                <th className="overline px-4 py-3 text-left">Véhicule</th>
                <th className="overline px-4 py-3 text-right">Places</th>
                <th className="overline px-4 py-3 text-right">Prix</th>
                <th className="overline px-4 py-3 text-left">Statut</th>
                <th className="overline px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRides.map((r) => {
                const confirmedSeats = bookings
                  .filter((b) => b.rideId === r.id && b.status === "confirmed")
                  .reduce((acc, b) => acc + b.seatsReserved, 0);

                const vehicle = vehicles.find((v) => v.id === r.vehicleId);

                return (
                  <tr
                    key={r.id}
                    className="border-t border-line transition-colors hover:bg-surface-alt"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <VerticalRouteRail
                        from={r.from}
                        to={r.to}
                        date={r.date}
                        time={r.time}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                          {getInitials(r.driverName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink">{r.driverName}</span>
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-alt text-graphite">
                          <Car size={14} />
                        </span>
                        <div className="min-w-0">
                          {vehicle ? (
                            <span className="block truncate text-xs font-bold text-ink">
                              {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                            </span>
                          ) : (
                            <span className="block truncate text-xs font-bold text-ink">
                              {r.vehicle && !r.vehicle.includes("-") && r.vehicle.length > 20 ? "Véhicule" : r.vehicle || "Véhicule"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-graphite">
                      {confirmedSeats} / {r.seats}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                      {money(r.price)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {(() => {
                        const isAvailable = r.status === "available" || r.status === "OPEN";
                        const isFull = r.status === "full" || r.status === "FULL";
                        const isInProgress = r.status === "IN_PROGRESS";
                        const isCancelled = r.status === "cancelled" || r.status === "CANCELLED";

                        if (isAvailable) {
                          return (
                            <span className="chip bg-success-soft text-success">
                              <CheckCircle2 size={13} />
                              Ouvert
                            </span>
                          );
                        }
                        if (isFull) {
                          return <span className="chip bg-warning-soft text-warning">Complet</span>;
                        }
                        if (isInProgress) {
                          return <span className="chip bg-info-soft text-info">En cours</span>;
                        }
                        if (isCancelled) {
                          return <span className="chip bg-danger-soft text-danger">Annulé</span>;
                        }
                        return <span className="chip bg-surface-alt text-graphite">Terminé</span>;
                      })()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setRideToCancel({ id: r.id, from: r.from, to: r.to });
                          }}
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                          title="Annuler le trajet"
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-surface-alt hover:text-ink"
                          aria-label="Plus d'options"
                        >
                          <MoreVertical size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRides.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={7} className="p-5">
                    <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                      <p className="text-sm font-bold text-ink">Aucun trajet trouvé</p>
                      <p className="mt-1 text-sm text-slate">
                        Élargissez la recherche ou effacez le filtre de date pour revoir tous les
                        trajets.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line px-5 py-4 bg-surface-alt/30">
            <span className="text-xs font-semibold text-slate">
              Affichage de {Math.min(filteredRides.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(filteredRides.length, currentPage * itemsPerPage)} sur {filteredRides.length} trajet(s)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm min-h-0 py-1.5 px-3 text-xs"
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-h-0 w-8 h-8 rounded-[8px] text-xs font-bold transition-all ${
                    currentPage === page
                      ? "bg-night text-on-night"
                      : "text-slate hover:bg-surface-alt hover:text-ink border border-line"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm min-h-0 py-1.5 px-3 text-xs"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(rideToCancel)}
        title="Annuler le trajet"
        message={
          rideToCancel
            ? `Voulez-vous vraiment annuler le trajet de ${rideToCancel.from} à ${rideToCancel.to} ?`
            : ""
        }
        confirmLabel="Confirmer l'annulation"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleConfirmCancelRide}
        onCancel={() => setRideToCancel(null)}
      />
    </div>
  );
}
