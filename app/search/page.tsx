"use client";

import AppLayout from "@/components/AppLayout";
import { useStore, type Ride } from "@/store/useStore";
import { useState, useMemo } from "react";
import { Search, Users, Star, ArrowRight, Car, SlidersHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

const formatPrice = (value: number) =>
  `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;

export default function SearchPage() {
  const { rides } = useStore();
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const reduce = useReducedMotion();

  const filteredRides = useMemo(() => {
    return rides.filter(ride => {
      const matchFrom = ride.from.toLowerCase().includes(searchFrom.toLowerCase());
      const matchTo = ride.to.toLowerCase().includes(searchTo.toLowerCase());
      const matchPrice = maxPrice === "" || ride.price <= maxPrice;
      return matchFrom && matchTo && matchPrice && ride.status === "available";
    });
  }, [rides, searchFrom, searchTo, maxPrice]);

  const resetFilters = () => {
    setSearchFrom("");
    setSearchTo("");
    setMaxPrice("");
  };

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.header {...rise()}>
          <p className="overline">Recherche</p>
          <h1 className="mt-2 text-display text-ink">Trouver un trajet</h1>
          <p className="mt-3 max-w-lg text-lead text-graphite">
            Indiquez votre départ et votre arrivée. Seuls les trajets encore ouverts s&apos;affichent.
          </p>
        </motion.header>

        {/* Filters — the itinerary rail runs down the two place fields */}
        <motion.section {...rise(0.06)} className="card p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
            <div className="flex min-w-0 gap-4">
              <div aria-hidden className="flex w-3 shrink-0 flex-col items-center pt-[2.6rem]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand ring-4 ring-brand-tint" />
                <span className="my-1 w-px flex-1 bg-line" />
                <span className="mb-[1.2rem] h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-surface" />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label htmlFor="from" className="field-label">
                    Départ
                  </label>
                  <input
                    id="from"
                    type="text"
                    placeholder="D'où partez-vous ?"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="to" className="field-label">
                    Arrivée
                  </label>
                  <input
                    id="to"
                    type="text"
                    placeholder="Où allez-vous ?"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="field"
                  />
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="min-w-0">
                <label htmlFor="maxPrice" className="field-label">
                  Prix maximum par place (FCFA)
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Ex. 2 000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="field"
                />
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-outline w-full shrink-0 sm:w-auto sm:self-start"
              >
                <SlidersHorizontal size={16} className="shrink-0" />
                Réinitialiser
              </button>
            </div>
          </div>
        </motion.section>

        {/* Results */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 text-sm font-bold text-slate">
              {filteredRides.length} trajet{filteredRides.length > 1 ? "s" : ""} trouvé
              {filteredRides.length > 1 ? "s" : ""}
            </p>
            <span className="chip shrink-0 bg-success-soft text-success">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              Places encore ouvertes
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride, i) => <RideCard key={ride.id} ride={ride} index={i} />)
            ) : (
              <div className="col-span-full rounded-panel border border-dashed border-line bg-surface-alt/60 px-6 py-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface text-muted">
                  <Search size={22} />
                </span>
                <h2 className="mt-4 text-base font-bold text-ink">
                  Aucun trajet ne correspond à vos critères
                </h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate">
                  Élargissez la recherche, ou publiez ce trajet vous-même si vous prenez la route.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button onClick={resetFilters} className="btn btn-outline w-full sm:w-auto">
                    Réinitialiser les filtres
                  </button>
                  <Link href="/create-ride" className="btn btn-primary w-full sm:w-auto">
                    Publier un trajet
                    <ArrowRight size={16} className="shrink-0" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function RideCard({ ride, index = 0 }: { ride: Ride; index?: number }) {
  const { bookings } = useStore();
  const reduce = useReducedMotion();
  const confirmedSeats = bookings
    .filter(b => b.rideId === ride.id && b.status === "confirmed")
    .reduce((acc, b) => acc + b.seatsReserved, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index, 5) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/ride/${ride.id}`}
        className="card flex h-full flex-col p-5 transition-colors hover:border-ink"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-on-brand">
              {ride.driverName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{ride.driverName}</p>
              <p className="flex items-center gap-1 text-xs font-semibold text-slate">
                <Star size={12} className="shrink-0 fill-brand text-brand" />
                {ride.driverRating.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-title tabular-nums text-ink">{formatPrice(ride.price)}</p>
            <p className="text-[11px] font-semibold text-muted">par place</p>
          </div>
        </div>

        {/* Itinerary rail */}
        <div className="mt-6 flex gap-4">
          <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand ring-4 ring-brand-tint" />
            <span className="my-1 w-px flex-1 bg-line" />
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-surface" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-bold text-ink">{ride.from}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-slate">{ride.time}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-bold text-ink">{ride.to}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-slate">{ride.date}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex min-w-0 items-center gap-3 text-xs font-semibold text-slate">
            <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
              <Users size={14} className="shrink-0" />
              {ride.seats - confirmedSeats}/{ride.seats}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <Car size={14} className="shrink-0" />
              <span className="truncate">{ride.vehicle}</span>
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-ink">
            Réserver
            <ArrowRight size={14} className="shrink-0" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
