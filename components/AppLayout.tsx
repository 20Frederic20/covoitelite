"use client";

import BottomNav from "./BottomNav";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Bell, ShieldCheck, X, Sun, Moon, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";

const publicPaths = ["/login", "/register", "/", "/privacy", "/terms"];

const NAV = [
  { href: "/", label: "Tableau de bord" },
  { href: "/search", label: "Rechercher" },
  { href: "/create-ride", label: "Publier" },
  { href: "/my-bookings", label: "Mes trajets" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid h-10 w-10 place-items-center rounded-[11px] text-graphite transition-colors hover:bg-surface-alt hover:text-ink"
      aria-label="Changer de thème"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function NotificationBell() {
  const { user, notifications, markNotificationRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const userNotifications = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-10 w-10 place-items-center rounded-[11px] text-graphite transition-colors hover:bg-surface-alt hover:text-ink"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-surface bg-brand text-[9px] font-extrabold text-on-brand">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="card absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line bg-surface-alt px-4 py-3">
                <h2 className="text-sm font-bold text-ink">Notifications</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted transition-colors hover:text-ink"
                  aria-label="Fermer"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="max-h-[min(24rem,60dvh)] overflow-y-auto">
                {userNotifications.length > 0 ? (
                  userNotifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full border-b border-line-soft px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-alt ${
                        n.read ? "opacity-60" : "bg-brand-soft"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-ink">{n.title}</p>
                        {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate">{n.message}</p>
                      <p className="mt-1.5 text-[10px] font-semibold text-muted">
                        {new Date(n.date).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(n.date).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center">
                    <Bell size={26} className="mx-auto text-muted" />
                    <p className="mt-3 text-xs font-semibold text-slate">
                      Aucune notification pour l&apos;instant.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && !publicPaths.includes(pathname)) {
      router.push("/login");
    }
  }, [user, pathname, router]);

  if (!user && pathname === "/") {
    return <>{children}</>;
  }

  if (!user && !publicPaths.includes(pathname)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-line border-t-brand" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gutter md:h-[68px]">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-brand text-on-brand">
              <Car size={19} strokeWidth={2.4} />
            </span>
            <span className="text-lg font-extrabold tracking-[-0.03em] text-ink">
              Covoit<span className="text-brand-dark">elite</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-[13px] font-semibold transition-colors ${
                    isActive ? "text-ink" : "text-slate hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
                  pathname.startsWith("/admin") ? "text-ink" : "text-slate hover:text-ink"
                }`}
              >
                <ShieldCheck size={15} />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1">
            {/* Always a way back out to the public site */}
            <Link
              href="/site"
              className="mr-1 hidden items-center gap-1.5 rounded-[11px] px-3 py-2 text-[13px] font-semibold text-slate transition-colors hover:bg-surface-alt hover:text-ink lg:flex"
            >
              <ExternalLink size={15} />
              Voir le site
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <Link
              href="/profile"
              className="ml-1 flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-1.5 transition-colors hover:border-ink sm:pr-4"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                {user?.name.charAt(0)}
              </span>
              <span className="hidden max-w-[9rem] truncate text-[13px] font-bold text-ink sm:block">
                {user?.name}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 gutter pb-28 pt-6 md:pb-14 md:pt-9">
        {children}
      </main>

      <footer className="hidden border-t border-line bg-surface md:block">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 gutter py-7 sm:flex-row">
          <div className="flex gap-6 text-xs font-semibold">
            <Link href="/privacy" className="text-slate transition-colors hover:text-ink">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-slate transition-colors hover:text-ink">
              Conditions
            </Link>
          </div>
        </div>
      </footer>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
