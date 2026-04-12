"use client";

import BottomNav from "./BottomNav";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, User, Bell, ShieldCheck, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";

const publicPaths = ["/login", "/register", "/"];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Changer de thème"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

function NotificationBell() {
  const { user, notifications, markNotificationRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                <h3 className="font-bold text-sm">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {userNotifications.length > 0 ? (
                  userNotifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 border-b border-border last:border-0 cursor-pointer transition-colors ${
                        n.read ? "opacity-60" : "bg-primary/5"
                      } hover:bg-muted`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-xs">{n.title}</p>
                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{n.message}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(n.date).toLocaleDateString()} à {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 text-muted" />
                    <p className="text-xs text-muted-foreground">Aucune notification pour le moment.</p>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Car size={24} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-foreground">CovoitElite</span>
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-bold text-muted-foreground">
            <Link href="/" className={`${pathname === "/" ? "text-primary" : "hover:text-foreground"} transition-colors`}>Tableau de bord</Link>
            <Link href="/search" className={`${pathname === "/search" ? "text-primary" : "hover:text-foreground"} transition-colors`}>Rechercher</Link>
            <Link href="/create-ride" className={`${pathname === "/create-ride" ? "text-primary" : "hover:text-foreground"} transition-colors`}>Publier</Link>
            <Link href="/my-bookings" className={`${pathname === "/my-bookings" ? "text-primary" : "hover:text-foreground"} transition-colors`}>Mes trajets</Link>
            {user?.role === "admin" && (
              <Link href="/admin" className={`${pathname === "/admin" ? "text-primary" : "hover:text-foreground"} transition-colors flex items-center gap-1.5`}>
                <ShieldCheck size={16} />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <Link href="/profile" className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-full hover:border-primary transition-all">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                {user?.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-foreground">{user?.name}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-24 md:pb-10">
        <div className="max-w-md mx-auto md:max-w-none">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        {!publicPaths.includes(pathname) && <BottomNav />}
        {user && pathname === "/" && <BottomNav />}
      </div>
    </div>
  );
}
