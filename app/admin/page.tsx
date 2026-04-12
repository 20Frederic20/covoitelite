"use client";

import { useStore } from "@/store/useStore";
import { useMemo, useState } from "react";
import { 
  Users, 
  Car, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Period = "week" | "month" | "year" | "all";

export default function AdminDashboard() {
  const { users, rides, bookings } = useStore();
  const [period, setPeriod] = useState<Period>("all");

  const overdueCount = useMemo(() => 
    users.filter(u => u.debtDays > 7).length, 
  [users]);

  const stats = useMemo(() => {
    const now = new Date();
    const getDaysDiff = (dateStr: string) => {
      const date = new Date(dateStr);
      return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    };

    const filterByPeriod = (dateStr: string) => {
      if (period === "all") return true;
      const diff = getDaysDiff(dateStr);
      if (period === "week") return diff <= 7;
      if (period === "month") return diff <= 30;
      if (period === "year") return diff <= 365;
      return true;
    };

    const periodBookings = bookings.filter(b => filterByPeriod(b.date));
    const periodRides = rides.filter(r => filterByPeriod(r.date));

    const totalEarnings = periodBookings
      .filter(b => b.status === "confirmed")
      .reduce((acc, b) => acc + b.commission, 0);
    
    const blockedUsers = users.filter(u => u.debtDays > 7).length;
    const activeRides = periodRides.filter(r => r.status === "available").length;

    // Simulate different trends based on period for visual variety
    const trends = {
      week: { users: "+2%", rides: "+1%", earnings: "+5%", blocked: "-1%" },
      month: { users: "+8%", rides: "+4%", earnings: "+12%", blocked: "-3%" },
      year: { users: "+45%", rides: "+22%", earnings: "+68%", blocked: "-10%" },
      all: { users: "+12%", rides: "+5%", earnings: "+18%", blocked: "-2%" }
    };

    const currentTrend = trends[period];

    return [
      { label: "Utilisateurs", value: users.length, icon: Users, color: "text-blue-500", trend: currentTrend.users, up: true },
      { label: "Trajets Actifs", value: activeRides, icon: Car, color: "text-primary", trend: currentTrend.rides, up: true },
      { label: "Revenus (10%)", value: `${totalEarnings} FCFA`, icon: TrendingUp, color: "text-green-500", trend: currentTrend.earnings, up: true },
      { label: "Conducteurs Bloqués", value: blockedUsers, icon: ShieldAlert, color: "text-red-500", trend: currentTrend.blocked, up: false },
    ];
  }, [users, rides, bookings, period]);

  const recentActivity = useMemo(() => {
    return bookings.slice(0, 5).map(b => ({
      id: b.id,
      user: b.passengerName,
      action: "a réservé un trajet",
      time: "Il y a 5 min",
      status: b.status
    }));
  }, [bookings]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">DASHBOARD</h1>
          <p className="text-zinc-500 font-medium">Bienvenue dans votre centre de contrôle CovoitElite.</p>
        </div>
        
        <div className="flex bg-card p-1 rounded-2xl border border-border">
          {(["week", "month", "year", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "week" ? "Semaine" : p === "month" ? "Mois" : p === "year" ? "Année" : "Tout"}
            </button>
          ))}
        </div>
      </header>

      {/* Overdue Alert Banner */}
      <AnimatePresence>
        {overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-500/20">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Paiements en retard détectés</h3>
                  <p className="text-sm text-muted-foreground">
                    Il y a <span className="text-red-500 font-bold">{overdueCount} conducteur(s)</span> avec plus de 7 jours de retard de paiement.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = "/admin/financials"}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
              >
                Gérer les dettes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 rounded-[2rem] relative overflow-hidden group"
          >
            <div className={`${stat.color} bg-current/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
            <div className={`absolute top-6 right-6 flex items-center gap-1 text-xs font-bold ${stat.up ? "text-green-500" : "text-red-500"}`}>
              {stat.trend}
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Clock className="text-primary" />
              Activité Récente
            </h2>
            <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Voir tout</button>
          </div>
          
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-primary">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      <span className="text-primary">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                  activity.status === "confirmed" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                }`}>
                  {activity.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground font-medium">Aucune activité récente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-primary" />
            Actions Rapides
          </h2>
          <div className="space-y-4">
            <QuickActionButton label="Vérifier les conducteurs" sub="3 demandes en attente" color="bg-blue-500" />
            <QuickActionButton label="Rapports d'incidents" sub="0 nouveau rapport" color="bg-red-500" />
            <QuickActionButton label="Configuration système" sub="Mise à jour disponible" color="bg-purple-500" />
            <QuickActionButton label="Support client" sub="12 tickets ouverts" color="bg-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ label, sub, color }: { label: string, sub: string, color: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border hover:border-primary/50 hover:bg-muted transition-all text-left group">
      <div className={`w-2 h-10 rounded-full ${color} group-hover:scale-y-110 transition-transform`} />
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
