"use client";

import { useStore } from "@/store/useStore";
import {
  Car,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Users,
  Wallet,
  X,
  HelpCircle,
  MessageSquare,
  Star,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  section: string;
  count?: number;
  alert?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function SidebarBody({
  pathname,
  userName,
  nav,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  userName: string;
  nav: NavItem[];
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const sections = Array.from(new Set(nav.map((n) => n.section)));

  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden bg-night">
      {/* a single breath of brand light, top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl"
      />

      {/* Wordmark */}
      <div className="relative flex h-16 shrink-0 items-center gap-2.5 px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-brand text-on-brand">
          <Car size={19} strokeWidth={2.4} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[17px] font-extrabold leading-tight tracking-[-0.03em] text-white">
            Covoit<span className="text-brand">elite</span>
          </span>
          <span className="block text-[11px] font-semibold leading-tight text-white/40">
            Administration
          </span>
        </span>
      </div>

      {/* Navigation, grouped */}
      <nav className="relative mt-5 flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section, si) => (
          <div key={section} className={si > 0 ? "mt-6" : ""}>
            <p className="px-3 pb-2 text-[10px] font-bold tracking-wide text-white/30">{section}</p>
            <div className="space-y-1">
              {nav
                .filter((n) => n.section === section)
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex h-11 items-center gap-3 rounded-[11px] px-3 text-[13px] font-bold transition-colors ${
                        isActive
                          ? "bg-white/[0.07] text-white"
                          : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="adminNavBar"
                          className="absolute left-0 h-5 w-[3px] rounded-r bg-brand"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          aria-hidden
                        />
                      )}
                      <item.icon
                        size={17}
                        className={isActive ? "shrink-0 text-brand" : "shrink-0"}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>

                      {item.alert ? (
                        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-danger px-1.5 text-[10px] font-extrabold tabular-nums text-white">
                          {item.count}
                        </span>
                      ) : item.count !== undefined ? (
                        <span
                          className={`shrink-0 text-[11px] font-bold tabular-nums ${
                            isActive ? "text-white/60" : "text-white/30"
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/site"
          onClick={onNavigate}
          className="flex h-11 items-center gap-3 rounded-[11px] px-3 text-[13px] font-bold text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <ExternalLink size={17} className="shrink-0" />
          Voir le site
        </Link>

        <div className="mt-2 flex items-center gap-3 rounded-[11px] px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
            {userName.charAt(0)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-white">{userName}</span>
            <span className="block truncate text-[11px] font-semibold text-white/40">
              Administrateur
            </span>
          </span>
          <button
            onClick={onLogout}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-red-500"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, users, rides } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user || user.role === "admin") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, user, router]);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  // Live counters, so the sidebar reports the platform instead of just linking to it.
  const { kycDocuments, vehicles, disputes, faqEntries, fetchKycDocuments, fetchKycVehicles, fetchDisputes, fetchFaqEntries } = useStore();

  useEffect(() => {
    fetchKycDocuments();
    fetchKycVehicles();
    fetchDisputes();
    fetchFaqEntries();
  }, [fetchKycDocuments, fetchKycVehicles, fetchDisputes, fetchFaqEntries]);

  const overdue = useMemo(() => users.filter((u) => u.debtDays > 7).length, [users]);

  const pendingKycDocs = useMemo(() => kycDocuments.filter((d) => d.status === "PENDING").length, [kycDocuments]);
  const unverifiedVehicles = useMemo(() => vehicles.filter((v) => !v.isVerified).length, [vehicles]);
  const kycAlertsCount = pendingKycDocs + unverifiedVehicles;

  const openDisputesCount = useMemo(() => disputes.filter((d) => d.status === "OPEN" || d.status === "IN_PROGRESS").length, [disputes]);

  const nav: NavItem[] = useMemo(
    () => [
      { href: "/admin", icon: LayoutDashboard, label: "Vue d'ensemble", section: "Pilotage" },
      {
        href: "/admin/financials",
        icon: Wallet,
        label: "Finances",
        section: "Pilotage",
        count: overdue || undefined,
        alert: overdue > 0,
      },
      { href: "/admin/rides", icon: Car, label: "Trajets", section: "Gestion", count: rides.length },
      {
        href: "/admin/users",
        icon: Users,
        label: "Utilisateurs",
        section: "Gestion",
        count: users.length,
      },
      {
        href: "/admin/kyc",
        icon: FileCheck2,
        label: "Validation KYC",
        section: "Gestion",
        count: kycAlertsCount || undefined,
        alert: kycAlertsCount > 0,
      },
      {
        href: "/admin/disputes",
        icon: MessageSquare,
        label: "Litiges",
        section: "Support",
        count: openDisputesCount || undefined,
        alert: openDisputesCount > 0,
      },
      {
        href: "/admin/reviews",
        icon: Star,
        label: "Avis & Modération",
        section: "Support",
      },
      {
        href: "/admin/faq",
        icon: HelpCircle,
        label: "Aide & FAQ",
        section: "Support",
        count: faqEntries.length || undefined,
      },
    ],
    [overdue, rides.length, users.length, kycAlertsCount, openDisputesCount, faqEntries.length],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-line border-t-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-line border-t-brand" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg gutter">
        <div className="card w-full max-w-md p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-danger-soft text-danger">
            <ShieldAlert size={22} />
          </span>
          <h1 className="mt-5 text-title text-ink">Accès refusé</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            Votre compte n&apos;a pas les permissions nécessaires pour ouvrir l&apos;espace
            d&apos;administration.
          </p>
          <p className="mt-4 text-xs font-semibold text-muted">
            Redirection automatique vers l&apos;accueil dans <span className="font-extrabold text-danger tabular-nums">{countdown}</span> seconde{countdown > 1 ? "s" : ""}.
          </p>
          <Link href="/" className="btn btn-outline btn-sm mt-6">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const userName = user.name;

  return (
    <div className="min-h-dvh bg-bg text-ink">
      {/* Persistent sidebar — lg and up */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-white/10 lg:block">
        <SidebarBody pathname={pathname} userName={userName} nav={nav} onLogout={logout} />
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 bg-night px-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-brand text-on-brand">
            <Car size={17} strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold leading-tight tracking-[-0.03em] text-white">
              Covoit<span className="text-brand">elite</span>
            </span>
            <span className="block text-[11px] font-semibold leading-tight text-white/40">
              Administration
            </span>
          </span>
        </Link>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-night/70 backdrop-blur-sm lg:hidden"
              aria-hidden
            />
            <motion.aside
              initial={{ x: reduce ? 0 : -280, opacity: reduce ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduce ? 0 : -280, opacity: reduce ? 0 : 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] lg:hidden"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center rounded-[10px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Fermer le menu"
              >
                <X size={18} />
              </button>
              <SidebarBody
                pathname={pathname}
                userName={userName}
                nav={nav}
                onNavigate={() => setDrawerOpen(false)}
                onLogout={logout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="lg:pl-[260px]">
        <main className="mx-auto w-full max-w-[1400px] gutter pb-16 pt-16 lg:pt-0">
          <div className="py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
