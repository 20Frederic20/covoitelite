"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Star,
  LogOut,
  Shield,
  ChevronRight,
  History,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Globe,
  type LucideIcon,
} from "lucide-react";

/* The chevron: a road sign's arrow, borrowed from the hero as an edge accent. */
function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" aria-hidden className={`chevron ${className}`} fill="currentColor">
      <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, setUser, rides, bookings } = useStore();
  const router = useRouter();
  const reduce = useReducedMotion();

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

  const userRides = rides.filter(r => r.driverId === user.id);
  const userBookings = bookings.filter(b => b.passengerId === user.id);

  const roleLabel =
    user.role === "admin"
      ? "Administration"
      : user.role === "driver"
        ? "Conducteur élite"
        : "Passager élite";

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* ─── Identity — the one ink surface on this page ─── */}
        <motion.section
          {...rise()}
          className="relative isolate overflow-hidden rounded-panel bg-night p-6 sm:p-8"
        >
          <Chevron className="-right-6 top-[-15%] h-[130%] w-auto text-white/[0.06]" />
          <Chevron className="right-4 top-1/2 h-9 w-auto -translate-y-1/2 text-brand sm:right-7 sm:h-12" />

          <div className="relative z-10 pr-10 sm:pr-20">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <span className="relative shrink-0">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-extrabold text-on-brand">
                  {user.name.charAt(0)}
                </span>
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-white text-ink">
                  <ShieldCheck size={12} strokeWidth={2.6} />
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-title text-white">{user.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-white/60">
                  <span className="flex shrink-0 items-center gap-1 tabular-nums">
                    <Star size={13} className="shrink-0 fill-brand text-brand" />
                    {user.rating.toFixed(1).replace(".", ",")}
                  </span>
                  <span className="text-white/30">·</span>
                  <span className="shrink-0 tabular-nums">{user.tripsCount} trajets</span>
                </p>
                <p className="mt-1 truncate text-sm text-white/45">{user.email}</p>
                <span className="chip mt-3 bg-brand text-on-brand">{roleLabel}</span>
              </div>
            </div>

            <dl className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
              <div className="min-w-0 rounded-[12px] border border-white/10 bg-white/[0.06] px-4 py-3.5">
                <dd className="text-title tabular-nums text-white">{userRides.length}</dd>
                <dt className="mt-0.5 truncate text-xs font-semibold text-white/55">
                  Trajets publiés
                </dt>
              </div>
              <div className="min-w-0 rounded-[12px] border border-white/10 bg-white/[0.06] px-4 py-3.5">
                <dd className="text-title tabular-nums text-white">{userBookings.length}</dd>
                <dt className="mt-0.5 truncate text-xs font-semibold text-white/55">
                  Réservations
                </dt>
              </div>
            </dl>
          </div>
        </motion.section>

        {/* Debt warning */}
        {user.debtDays > 0 && (
          <motion.section
            {...rise(0.06)}
            className="card-flat flex gap-4 border-danger/30 bg-danger-soft p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-surface text-danger">
              <AlertTriangle size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-ink">Commission impayée</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                Vous devez une commission depuis {user.debtDays} jour
                {user.debtDays > 1 ? "s" : ""}.{" "}
                {user.debtDays > 7
                  ? "Votre compte est bloqué : réglez-la pour publier à nouveau."
                  : "Réglez-la avant 7 jours pour éviter le blocage de votre compte."}
              </p>
            </div>
          </motion.section>
        )}

        {/* Settings */}
        <motion.section {...rise(0.1)}>
          <h2 className="overline">Paramètres</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {user.role === "admin" && (
              <MenuButton
                icon={ShieldCheck}
                label="Administration"
                sub="Gérer la plateforme"
                onClick={() => router.push("/admin")}
              />
            )}
            <MenuButton icon={Wallet} label="Portefeuille" sub="Vos gains et vos paiements" />
            <MenuButton icon={History} label="Historique" sub="Tous vos trajets passés" />
            <MenuButton icon={Shield} label="Sécurité" sub="Vérification du compte" />
            <MenuLink
              icon={Globe}
              label="Voir le site"
              sub="La page publique CovoitElite"
              href="/site"
            />
          </div>

          <button
            onClick={handleLogout}
            className="card-flat mt-3 flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:border-danger"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-danger-soft text-danger">
              <LogOut size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-danger">Déconnexion</span>
              <span className="block truncate text-xs text-slate">
                Quitter votre session CovoitElite
              </span>
            </span>
          </button>
        </motion.section>
      </div>
    </AppLayout>
  );
}

const ROW_CLASS =
  "card-flat group flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:border-ink";

function RowContent({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub: string }) {
  return (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand-dark transition-colors group-hover:bg-brand group-hover:text-on-brand">
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">{label}</span>
        <span className="block truncate text-xs text-slate">{sub}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </>
  );
}

function MenuButton({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={ROW_CLASS}>
      <RowContent icon={icon} label={label} sub={sub} />
    </button>
  );
}

function MenuLink({
  icon,
  label,
  sub,
  href,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className={ROW_CLASS}>
      <RowContent icon={icon} label={label} sub={sub} />
    </Link>
  );
}
