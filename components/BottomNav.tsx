"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User, Briefcase, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "@/store/useStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useStore();

  const navItems = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/search", icon: Search, label: "Rechercher" },
    { href: "/create-ride", icon: PlusCircle, label: "Publier" },
    { href: "/my-bookings", icon: Briefcase, label: "Trajets" },
    ...(user?.role === "admin"
      ? [{ href: "/admin", icon: ShieldCheck, label: "Admin" }]
      : [{ href: "/profile", icon: User, label: "Profil" }]),
  ];

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 pt-1.5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-[11px] px-1 pb-2 pt-2"
            >
              {isActive && (
                <motion.span
                  layoutId="navIndicator"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-brand"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon
                size={21}
                strokeWidth={isActive ? 2.4 : 2}
                className={isActive ? "text-ink" : "text-muted"}
              />
              <span
                className={`text-[10px] leading-none tracking-[-0.01em] ${
                  isActive ? "font-bold text-ink" : "font-semibold text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
