"use client";

import AppLayout from "@/components/AppLayout";
import { useStore, Booking, Ride } from "@/store/useStore";
import { useState } from "react";
import { Briefcase, Users, Clock, ChevronRight, XCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";

const formatPrice = (value: number) =>
  `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;

const STATUS_CHIP: Record<Booking["status"], string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
  rejected: "bg-danger-soft text-danger",
};

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  rejected: "Refusé",
};

export default function MyBookingsPage() {
  const { bookings, rides, user, cancelBooking, confirmBooking, unconfirmBooking } = useStore();
  const [activeTab, setActiveTab] = useState<"bookings" | "rides">("bookings");
  const [managingRideId, setManagingRideId] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const userBookings = bookings.filter(b => b.passengerId === user?.id);
  const userRides = rides.filter(r => r.driverId === user?.id);

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.header {...rise()}>
          <p className="overline">Votre activité</p>
          <h1 className="mt-2 text-display text-ink">Mes trajets</h1>
          <p className="mt-3 max-w-lg text-lead text-graphite">
            Vos réservations en tant que passager, et les trajets que vous conduisez.
          </p>
        </motion.header>

        {/* Tabs */}
        <motion.div
          {...rise(0.06)}
          role="tablist"
          aria-label="Filtrer mes trajets"
          className="flex gap-1 rounded-[14px] border border-line bg-surface-alt p-1"
        >
          {(
            [
              ["bookings", "Réservations", userBookings.length],
              ["rides", "Mes publications", userRides.length],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[11px] px-3 text-[13px] font-bold transition-colors ${
                activeTab === key
                  ? "bg-surface text-ink shadow-card"
                  : "text-slate hover:text-ink"
              }`}
            >
              <span className="truncate">{label}</span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                  activeTab === key ? "bg-brand text-on-brand" : "bg-surface text-slate"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {activeTab === "bookings" ? (
            userBookings.length > 0 ? (
              userBookings.map((booking, i) => {
                const ride = rides.find(r => r.id === booking.rideId);
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    ride={ride}
                    index={i}
                    onCancel={() => cancelBooking(booking.id)}
                  />
                );
              })
            ) : (
              <EmptyState
                title="Aucune réservation en cours"
                message="Vous n'avez encore réservé aucune place. Cherchez un trajet et demandez la vôtre."
                actionLabel="Rechercher un trajet"
                actionHref="/search"
              />
            )
          ) : userRides.length > 0 ? (
            userRides.map((ride) => (
              <MyRideCard
                key={ride.id}
                ride={ride}
                bookings={bookings.filter(b => b.rideId === ride.id)}
                isManaging={managingRideId === ride.id}
                onManage={() => setManagingRideId(managingRideId === ride.id ? null : ride.id)}
                onConfirm={confirmBooking}
                onUnconfirm={unconfirmBooking}
              />
            ))
          ) : (
            <EmptyState
              title="Aucun trajet publié"
              message="Vous prenez la route bientôt ? Publiez votre trajet et remplissez votre voiture."
              actionLabel="Publier un trajet"
              actionHref="/create-ride"
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function BookingCard({
  booking,
  ride,
  index = 0,
  onCancel,
}: {
  booking: Booking;
  ride?: Ride;
  index?: number;
  onCancel: () => void;
}) {
  const reduce = useReducedMotion();

  if (!ride) return null;

  const canCancel = () => {
    if (booking.status === "cancelled") return false;

    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    const diffInHours = (rideDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return diffInHours > 8;
  };

  const isTooLate = () => {
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    return now > rideDateTime;
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index, 5) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="card flex flex-col p-5 transition-colors hover:border-ink"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-on-brand">
            {ride.driverName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{ride.driverName}</p>
            <p className="text-xs font-semibold text-slate">Conducteur</p>
          </div>
        </div>
        <span className={`chip shrink-0 ${STATUS_CHIP[booking.status]}`}>
          {STATUS_LABEL[booking.status]}
        </span>
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

      <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate">
        <Users size={14} className="shrink-0" />
        {booking.seatsReserved} place{booking.seatsReserved > 1 ? "s" : ""} réservée
        {booking.seatsReserved > 1 ? "s" : ""}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="min-w-0">
          <p className="text-title tabular-nums text-ink">{formatPrice(booking.totalPrice)}</p>
          <p className="text-[11px] font-semibold text-muted">total</p>
        </div>
        {canCancel() ? (
          <button
            onClick={() => {
              if (confirm("Voulez-vous vraiment annuler cette réservation ?")) {
                onCancel();
              }
            }}
            className="btn btn-ghost btn-sm shrink-0 text-danger hover:bg-danger-soft hover:text-danger"
          >
            <XCircle size={14} className="shrink-0" />
            Annuler
          </button>
        ) : booking.status !== "cancelled" && !isTooLate() ? (
          <span className="shrink-0 text-right text-[11px] font-semibold text-muted">
            Annulation fermée
            <br />
            (moins de 8 h)
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}

function MyRideCard({
  ride,
  bookings,
  isManaging,
  onManage,
  onConfirm,
  onUnconfirm,
}: {
  ride: Ride;
  bookings: Booking[];
  isManaging: boolean;
  onManage: () => void;
  onConfirm: (id: string) => void;
  onUnconfirm: (id: string) => void;
}) {
  const confirmedCount = bookings
    .filter(b => b.status === "confirmed")
    .reduce((acc, b) => acc + b.seatsReserved, 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const statusChip =
    ride.status === "available"
      ? "bg-success-soft text-success"
      : ride.status === "full"
        ? "bg-warning-soft text-warning"
        : "bg-surface-alt text-slate";

  const statusLabel =
    ride.status === "available" ? "En cours" : ride.status === "full" ? "Complet" : "Terminé";

  return (
    <article
      className={`card flex flex-col p-5 transition-colors hover:border-ink ${
        isManaging ? "col-span-full border-ink" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`chip shrink-0 ${statusChip}`}>{statusLabel}</span>
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate">
          <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
            <Users size={14} className="shrink-0" />
            {confirmedCount}/{ride.seats} confirmées
          </span>
          {pendingCount > 0 && (
            <span className="flex shrink-0 items-center gap-1.5 text-warning">
              <Clock size={14} className="shrink-0" />
              {pendingCount} en attente
            </span>
          )}
        </div>
        <button
          onClick={onManage}
          aria-expanded={isManaging}
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-ink transition-colors hover:text-brand-dark"
        >
          {isManaging ? "Fermer" : "Gérer les demandes"}
          <ChevronRight
            size={14}
            className={`shrink-0 transition-transform ${isManaging ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isManaging && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-line pt-5">
              <h3 className="overline">Réservations ({bookings.length})</h3>

              {bookings.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {bookings.map((booking) => {
                    const wouldOverflow = confirmedCount + booking.seatsReserved > ride.seats;
                    return (
                      <div key={booking.id} className="card-flat bg-surface-alt p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink">
                              {booking.passengerName}
                            </p>
                            <a
                              href={`tel:${booking.passengerPhone}`}
                              className="block truncate text-xs font-semibold text-slate transition-colors hover:text-ink"
                            >
                              {booking.passengerPhone}
                            </a>
                          </div>
                          <span className={`chip shrink-0 ${STATUS_CHIP[booking.status]}`}>
                            {STATUS_LABEL[booking.status]}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-xs font-semibold text-slate">
                            {booking.seatsReserved} place{booking.seatsReserved > 1 ? "s" : ""} ·{" "}
                            {formatPrice(booking.totalPrice)}
                          </p>
                          {booking.status === "pending" ? (
                            <button
                              onClick={() => onConfirm(booking.id)}
                              disabled={wouldOverflow}
                              title={
                                wouldOverflow
                                  ? "Plus assez de places libres pour confirmer cette demande."
                                  : undefined
                              }
                              className="btn btn-primary btn-sm shrink-0"
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              onClick={() => onUnconfirm(booking.id)}
                              className="btn btn-outline btn-sm shrink-0"
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-[12px] border border-dashed border-line px-4 py-6 text-center text-sm text-slate">
                  Aucune demande pour l&apos;instant. Votre trajet reste visible dans la recherche.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="col-span-full rounded-panel border border-dashed border-line bg-surface-alt/60 px-6 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface text-muted">
        <Briefcase size={22} />
      </span>
      <h2 className="mt-4 text-base font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate">{message}</p>
      <Link href={actionHref} className="btn btn-primary mt-6">
        {actionLabel}
        <ArrowRight size={16} className="shrink-0" />
      </Link>
    </div>
  );
}
