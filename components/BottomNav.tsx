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
      : [{ href: "/profile", icon: User, label: "Profil" }]
    ),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
              <div className={`p-2 rounded-full transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon size={24} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="w-1 h-1 rounded-full bg-primary mt-0.5"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
