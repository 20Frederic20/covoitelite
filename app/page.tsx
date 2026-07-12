"use client";

import AppLayout from "@/components/AppLayout";
import LandingPage from "@/components/LandingPage";
import { useStore, type Ride } from "@/store/useStore";
import {
  Search,
  Users,
  Star,
  ArrowRight,
  PlusCircle,
  Briefcase,
  User,
  Car,
  Mail,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formatPrice = (value: number) =>
  `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;

const QUICK_ACTIONS = [
  {
    href: "/create-ride",
    icon: PlusCircle,
    label: "Publier",
    sub: "Proposez votre trajet",
  },
  {
    href: "/search",
    icon: Search,
    label: "Rechercher",
    sub: "Trouvez une place",
  },
  {
    href: "/my-bookings",
    icon: Briefcase,
    label: "Mes trajets",
    sub: "Suivez vos réservations",
  },
  {
    href: "/profile",
    icon: User,
    label: "Profil",
    sub: "Gérez votre compte",
  },
];

/* The chevron: a road sign's arrow, borrowed from the hero as an edge accent. */
function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" aria-hidden className={`chevron ${className}`} fill="currentColor">
      <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
    </svg>
  );
}

export default function HomePage() {
  const { rides, bookings, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const reduce = useReducedMotion();
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  // An admin's home is the back-office, not the passenger dashboard.
  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  if (!user) {
    return <LandingPage />;
  }

  if (isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-line border-t-brand" />
      </div>
    );
  }

  const filteredRides = rides.filter(ride =>
    ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ride.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRides = rides.filter((r) => r.status === "available").length;
  const myBookings = bookings.filter((b) => b.passengerId === user.id).length;

  const stats = [
    { label: "Trajets disponibles", value: openRides.toString() },
    { label: "Mes réservations", value: myBookings.toString() },
    { label: "Note moyenne", value: user.rating.toFixed(1).replace(".", ",") },
  ];

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <AppLayout>
      <div className="space-y-8 md:space-y-10">
        {/* ─── Greeting panel — the page's one bold element ─── */}
        <motion.section
          {...rise()}
          className="relative isolate overflow-hidden rounded-panel bg-night p-6 sm:p-8 lg:p-10"
        >
          {/* Edge accent: a faint chevron with a small brand one riding on it */}
          <Chevron className="-right-8 top-[-15%] h-[130%] w-auto text-white/[0.06]" />
          <Chevron className="right-4 top-6 h-10 w-auto text-brand sm:right-8 sm:top-9 sm:h-14" />

          <div className="relative z-10 max-w-2xl pr-12 sm:pr-20">
            <p className="text-xs font-bold text-white/45">Tableau de bord</p>
            <h1 className="mt-2 text-display text-white">
              Bonjour, <span className="break-words">{user.name.split(" ")[0]}</span>.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
              {openRides > 0
                ? `${openRides} trajet${openRides > 1 ? "s" : ""} ouvert${openRides > 1 ? "s" : ""} en ce moment. Cherchez une place, ou remplissez votre voiture.`
                : "Aucun trajet ouvert pour l'instant. Publiez le vôtre : les passagers le verront aussitôt."}
            </p>
          </div>

          {/* The useful part: it filters the rides below, live. */}
          <div className="relative z-10 mt-6 max-w-md sm:mt-7">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Rechercher une destination…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher une destination"
              className="h-12 w-full rounded-[12px] border border-white/15 bg-white/10 pl-11 pr-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-white/40 focus:border-brand focus:bg-white/[0.14]"
            />
          </div>
        </motion.section>

        {/* ─── Stats ─── */}
        <motion.section {...rise(0.06)} className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card-flat min-w-0 p-4 sm:p-5">
              <p className="overline break-words text-[11px] leading-snug sm:text-xs">
                {stat.label}
              </p>
              <p className="mt-1.5 text-title tabular-nums text-ink">{stat.value}</p>
            </div>
          ))}
        </motion.section>

        {/* ─── Quick actions ─── */}
        <motion.section {...rise(0.1)}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="card-flat group flex flex-col gap-3 p-4 transition-colors hover:border-ink sm:p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-dark transition-colors group-hover:bg-brand group-hover:text-on-brand">
                  <action.icon size={19} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{action.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate">{action.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ─── Rides ─── */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-title text-ink">Trajets disponibles</h2>
              <p className="mt-1 text-sm text-slate">
                {filteredRides.length} trajet{filteredRides.length > 1 ? "s" : ""} à réserver.
              </p>
            </div>
            <Link
              href="/search"
              className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-ink transition-colors hover:text-brand-dark"
            >
              Voir tout
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride, i) => (
                <RideCard key={ride.id} ride={ride} index={i} />
              ))
            ) : (
              <div className="col-span-full rounded-panel border border-dashed border-line bg-surface-alt/60 px-6 py-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface text-muted">
                  <Car size={22} />
                </span>
                <h3 className="mt-4 text-base font-bold text-ink">Aucun trajet ne correspond</h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate">
                  Personne ne roule encore sur cet axe. Publiez le vôtre : les passagers le verront
                  aussitôt.
                </p>
                <Link href="/create-ride" className="btn btn-primary mt-6">
                  Publier un trajet
                  <ArrowRight size={16} className="shrink-0" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ─── Help ─── */}
        <section className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <h2 className="text-title text-ink">Besoin d&apos;aide ?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate">
              Un souci sur un trajet, une question sur un paiement : l&apos;équipe répond sous 24 h.
            </p>
          </div>
          <a
            href="mailto:apprentissagethough@gmail.com"
            className="btn btn-outline w-full shrink-0 sm:w-auto"
          >
            <Mail size={16} className="shrink-0" />
            Nous écrire
          </a>
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
          <ArrowRight size={16} className="shrink-0 text-ink" />
        </div>
      </Link>
    </motion.div>
  );
}
