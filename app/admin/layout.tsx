"use client";

import { useStore } from "@/store/useStore";
import { ShieldAlert, LayoutDashboard, Users, Car, DollarSign, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <ShieldAlert size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
          <p className="text-muted-foreground">Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
          <Link href="/" className="mt-6 inline-block text-primary font-bold">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Utilisateurs" },
    { href: "/admin/rides", icon: Car, label: "Trajets" },
    { href: "/admin/financials", icon: DollarSign, label: "Finances" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black">C</div>
            <h1 className="text-xl font-black tracking-tighter">COVOIT<span className="text-primary">ELITE</span></h1>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-border">
            <button 
              onClick={() => { setUser(null); router.push("/login"); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all w-full text-left"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-black text-xs">C</div>
            <span className="font-black text-sm uppercase tracking-widest">Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
