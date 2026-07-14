"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter, useParams } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Users,
  Star,
  ArrowLeft,
  ShieldCheck,
  Car,
  Check,
  Minus,
  Plus,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const formatPrice = (value: number) =>
  `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;

export default function RideDetailsPage() {
  const { id } = useParams();
  const { rides, bookings, user, bookRide } = useStore();
  const router = useRouter();
  const ride = useMemo(() => rides.find(r => r.id === id), [id, rides]);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const reduce = useReducedMotion();

  const rideBookings = useMemo(
    () => bookings.filter(b => b.rideId === id && b.status !== "cancelled"),
    [id, bookings]
  );
  const currentTotalReserved = useMemo(
    () => rideBookings.reduce((acc, b) => acc + b.seatsReserved, 0),
    [rideBookings]
  );
  const confirmedSeats = useMemo(
    () =>
      rideBookings
        .filter(b => b.status === "confirmed")
        .reduce((acc, b) => acc + b.seatsReserved, 0),
    [rideBookings]
  );

  if (!ride) return null;

  const [errorMsg, setErrorMsg] = useState("");

  const handleBooking = async () => {
    if (!user) return;
    setIsBooking(true);
    setErrorMsg("");

    try {
      await bookRide(
        ride.id,
        { id: user.id, name: user.name, phone: user.phone || "+229 00 00 00 00" },
        seatsToBook
      );
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/my-bookings");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de la réservation. Veuillez réessayer.");
    } finally {
      setIsBooking(false);
    }
  };

  const totalPrice = ride.price * seatsToBook;
  const isFull = confirmedSeats >= ride.seats;
  const canStillReserve = currentTotalReserved + seatsToBook <= ride.seats * 3;
  const isDriver = user?.id === ride.driverId;

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm -ml-3 mb-4 text-slate"
        >
          <ArrowLeft size={16} className="shrink-0" />
          Retour
        </button>

        <motion.header {...rise()} className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="overline">Détail du trajet</p>
              <span
                className={`chip shrink-0 ${
                  isFull ? "bg-warning-soft text-warning" : "bg-success-soft text-success"
                }`}
              >
                {isFull ? "Complet" : `${ride.seats - confirmedSeats} place${ride.seats - confirmedSeats > 1 ? "s" : ""} libre${ride.seats - confirmedSeats > 1 ? "s" : ""}`}
              </span>
            </div>
            <h1 className="mt-2 text-display text-ink">
              <span className="break-words">{ride.from}</span>
              <span className="text-muted"> → </span>
              <span className="break-words">{ride.to}</span>
            </h1>
          </div>
          <div className="shrink-0">
            <p className="text-title tabular-nums text-ink">{formatPrice(ride.price)}</p>
            <p className="text-[11px] font-semibold text-muted">par place</p>
          </div>
        </motion.header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {/* Itinerary */}
          <motion.section {...rise(0.06)} className="card p-5 sm:p-6">
            <h2 className="overline">Itinéraire</h2>

            <div className="mt-5 flex gap-4">
              <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand ring-4 ring-brand-tint" />
                <span className="my-1 w-px flex-1 bg-line" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-surface" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-7">
                <div className="min-w-0">
                  <p className="overline text-muted">Départ</p>
                  <p className="mt-1 truncate text-base font-bold text-ink">{ride.from}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate">
                    <Clock size={13} className="shrink-0" />
                    <span className="truncate tabular-nums">
                      {ride.time} · {ride.date}
                    </span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="overline text-muted">Arrivée</p>
                  <p className="mt-1 truncate text-base font-bold text-ink">{ride.to}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate">Arrivée estimée : +2 h</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-dark">
                  <Car size={16} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="overline text-muted">Véhicule</p>
                  <p className="truncate text-sm font-bold text-ink">{ride.vehicle}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-dark">
                  <Users size={16} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="overline text-muted">Places libres</p>
                  <p className="truncate text-sm font-bold tabular-nums text-ink">
                    {ride.seats - confirmedSeats} / {ride.seats}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Driver */}
          <motion.section {...rise(0.1)} className="card flex flex-col p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="overline">Conducteur</h2>
              <span className="chip shrink-0 bg-success-soft text-success">
                <ShieldCheck size={13} className="shrink-0" />
                Vérifié
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-lg font-extrabold text-on-brand">
                {ride.driverName.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-title text-ink">{ride.driverName}</p>
                <p className="flex items-center gap-1 text-sm font-semibold text-slate">
                  <Star size={13} className="shrink-0 fill-brand text-brand" />
                  {ride.driverRating.toFixed(1)}
                </p>
              </div>
            </div>

            {isFull ? (
              <div className="mt-6 rounded-[12px] border border-line bg-warning-soft px-4 py-3.5">
                <p className="text-xs font-bold text-warning">Trajet complet</p>
                <p className="mt-1 text-xs leading-relaxed text-graphite">
                  Toutes les places sont confirmées. Vous pouvez rejoindre la liste d&apos;attente :
                  si un passager annule, le conducteur vous confirme.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-slate">
                Pièce d&apos;identité, permis et véhicule contrôlés par l&apos;équipe CovoitElite
                avant la publication de ce trajet.
              </p>
            )}
          </motion.section>
        </div>

        {/* Driver management */}
        {isDriver && (
          <motion.section {...rise(0.14)} className="card mt-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-title text-ink">Gestion du trajet</h2>
                <p className="mt-1 text-sm text-slate">
                  {rideBookings.length} demande{rideBookings.length > 1 ? "s" : ""} sur ce trajet.
                </p>
              </div>
              <button
                onClick={() => setShowBookings(!showBookings)}
                aria-expanded={showBookings}
                className="btn btn-outline btn-sm w-full shrink-0 sm:w-auto"
              >
                {showBookings ? "Masquer les réservations" : "Voir les réservations"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showBookings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 border-t border-line pt-5">
                    {rideBookings.length > 0 ? (
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {rideBookings.map((booking) => (
                          <li
                            key={booking.id}
                            className="card-flat flex items-center justify-between gap-3 bg-surface-alt p-4"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-ink">
                                {booking.passengerName}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate">
                                <Users size={12} className="shrink-0" />
                                {booking.seatsReserved} place
                                {booking.seatsReserved > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold tabular-nums text-ink">
                                {formatPrice(booking.totalPrice)}
                              </p>
                              <span
                                className={`chip mt-1 ${
                                  booking.status === "confirmed"
                                    ? "bg-success-soft text-success"
                                    : "bg-warning-soft text-warning"
                                }`}
                              >
                                {booking.status === "confirmed" ? "Confirmé" : "En attente"}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="rounded-panel border border-dashed border-line px-6 py-10 text-center">
                        <p className="text-sm font-bold text-ink">Aucune réservation encore</p>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate">
                          Votre trajet est visible dans la recherche. Les demandes arriveront ici.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Booking */}
        {!isDriver && (
          <motion.section {...rise(0.14)} className="card mt-5 p-5 sm:p-6">
            <h2 className="text-title text-ink">Réserver votre place</h2>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
              <div className="min-w-0">
                <span className="field-label">Nombre de places</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                    aria-label="Retirer une place"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-title tabular-nums text-ink">
                    {seatsToBook}
                  </span>
                  <button
                    onClick={() =>
                      setSeatsToBook(
                        Math.min(ride.seats * 3 - currentTotalReserved, seatsToBook + 1)
                      )
                    }
                    aria-label="Ajouter une place"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="overline text-muted">Total à régler</p>
                <p className="mt-1 text-display tabular-nums text-ink">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={isBooking || !canStillReserve}
              className="btn btn-primary btn-lg mt-6 w-full"
            >
              {isBooking ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-brand border-t-transparent" />
              ) : !canStillReserve ? (
                "Complet"
              ) : isFull ? (
                "Rejoindre la liste d'attente"
              ) : (
                "Réserver la place"
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-muted">
              Vous réglez directement le conducteur au départ. Il confirme votre place avant le
              trajet.
            </p>
          </motion.section>
        )}
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-night/60 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="card w-full max-w-sm p-7 text-center shadow-lift"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
                <Check size={26} strokeWidth={3} />
              </span>
              <h2 className="mt-5 text-title text-ink">Demande envoyée</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Le conducteur doit maintenant confirmer votre place. Vous la retrouvez dans « Mes
                trajets ».
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
