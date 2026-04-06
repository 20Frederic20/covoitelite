"use client";

import BottomNav from "./BottomNav";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Car, User, Bell } from "lucide-react";

const publicPaths = ["/login", "/register", "/"];

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Car size={24} className="text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">CovoitElite</span>
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-bold text-zinc-400">
            <Link href="/" className={`${pathname === "/" ? "text-primary" : "hover:text-white"} transition-colors`}>Tableau de bord</Link>
            <Link href="/search" className={`${pathname === "/search" ? "text-primary" : "hover:text-white"} transition-colors`}>Rechercher</Link>
            <Link href="/create-ride" className={`${pathname === "/create-ride" ? "text-primary" : "hover:text-white"} transition-colors`}>Publier</Link>
            <Link href="/my-bookings" className={`${pathname === "/my-bookings" ? "text-primary" : "hover:text-white"} transition-colors`}>Mes trajets</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <Link href="/profile" className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full hover:border-primary transition-all">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold text-xs">
                {user?.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-white">{user?.name}</span>
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
