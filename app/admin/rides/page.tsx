"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Search, MoreVertical, CheckCircle2, XCircle, Trash2, Route, Filter, Car } from "lucide-react";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;

type RideStatusFilter = "all" | "available" | "full" | "completed" | "cancelled";

/* The itinerary rail, laid out horizontally: brand node → hairline → hollow node. */
function RouteRail({ from, to }: { from: string; to: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-ink">{from}</span>
      <span className="flex shrink-0 items-center gap-1" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-brand" />
        <span className="h-px w-6 bg-line" />
        <span className="h-2 w-2 rounded-full border-2 border-muted bg-surface" />
      </span>
      <span className="text-[13px] font-bold text-ink">{to}</span>
    </span>
  );
}

export default function AdminRidesPage() {
  const { rides, bookings, deleteRide, vehicles, fetchKycVehicles, fetchRides, fetchBookings } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<RideStatusFilter>("all");

  useEffect(() => {
    fetchKycVehicles();
    fetchRides();
    fetchBookings();
  }, [fetchKycVehicles, fetchRides, fetchBookings]);

  const filteredRides = rides.filter((r) => {
    const matchesSearch =
      r.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter ? r.date === dateFilter : true;

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

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
          {(["all", "available", "full", "completed", "cancelled"] as RideStatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors ${
                statusFilter === status ? "bg-night text-on-night" : "text-slate hover:text-ink"
              }`}
            >
              {status === "all" ? "Tous" : status === "available" ? "Ouverts" : status === "full" ? "Complets" : status === "completed" ? "Terminés" : "Annulés"}
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
              {filteredRides.map((r) => {
                const confirmedSeats = bookings
                  .filter((b) => b.rideId === r.id && b.status === "confirmed")
                  .reduce((acc, b) => acc + b.seatsReserved, 0);

                return (
                  <tr
                    key={r.id}
                    className="border-t border-line transition-colors hover:bg-surface-alt"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <RouteRail from={r.from} to={r.to} />
                      <span className="mt-1 block text-xs font-semibold tabular-nums text-muted">
                        {r.date} à {r.time}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                          {r.driverName.charAt(0)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink">{r.driverName}</span>
                          <span className="block truncate text-xs font-semibold text-muted">
                            ID : {r.driverId.slice(0, 8)}...
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-alt text-graphite">
                          <Car size={14} />
                        </span>
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-bold text-ink">{r.vehicle}</span>
                          {(() => {
                            const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                            return vehicle ? (
                              <span className="block truncate text-[11px] font-semibold text-muted">
                                {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                              </span>
                            ) : null;
                          })()}
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
                      {r.status === "available" ? (
                        <span className="chip bg-success-soft text-success">
                          <CheckCircle2 size={13} />
                          Ouvert
                        </span>
                      ) : r.status === "full" ? (
                        <span className="chip bg-warning-soft text-warning">Complet</span>
                      ) : (
                        <span className="chip bg-surface-alt text-graphite">Terminé</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            if (confirm("Supprimer ce trajet ?")) deleteRide(r.id);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
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
      </div>
    </div>
  );
}
