"use client";

import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Wallet,
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function AdminFinancialsPage() {
  const { bookings, users, resetUserDebt } = useStore();

  const debtors = useMemo(() => {
    return users.filter(u => (u.totalDebt || 0) > 0);
  }, [users]);

  const chartData = useMemo(() => {
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", 
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];
    
    const now = new Date();
    const last12Months: { month: string; year: number; monthIndex: number; revenue: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last12Months.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        revenue: 0
      });
    }

    bookings.filter(b => b.status === "confirmed").forEach(b => {
      const bDate = new Date(b.date);
      const monthData = last12Months.find(m => 
        m.monthIndex === bDate.getMonth() && m.year === bDate.getFullYear()
      );
      if (monthData) {
        monthData.revenue += b.commission;
      }
    });

    return last12Months.map(m => ({
      name: m.month,
      revenue: m.revenue
    }));
  }, [bookings]);

  const financialStats = useMemo(() => {
    const confirmedBookings = bookings.filter(b => b.status === "confirmed");
    const totalVolume = confirmedBookings.reduce((acc, b) => acc + (b.seatsReserved * 1500), 0); // Mock price calculation
    const totalCommission = confirmedBookings.reduce((acc, b) => acc + b.commission, 0);
    
    return {
      volume: totalVolume,
      commission: totalCommission,
      pending: 12500, // Mock pending
      payouts: 450000 // Mock total payouts
    };
  }, [bookings]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">FINANCES</h1>
          <p className="text-muted-foreground font-medium">Suivi des revenus et des commissions de la plateforme.</p>
        </div>
        <button className="bg-card border border-border px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-muted transition-colors w-fit">
          <Download size={20} />
          <span>Exporter Rapport</span>
        </button>
      </header>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard label="Volume d'affaires" value={`${financialStats.volume} FCFA`} trend="+12.5%" up={true} icon={TrendingUp} color="text-blue-500" />
        <FinancialCard label="Commissions (10%)" value={`${financialStats.commission} FCFA`} trend="+15.2%" up={true} icon={DollarSign} color="text-green-500" />
        <FinancialCard label="Commissions en attente" value={`${financialStats.pending} FCFA`} trend="-5.4%" up={false} icon={ClockIcon} color="text-orange-500" />
        <FinancialCard label="Total Payé aux Conducteurs" value={`${financialStats.payouts} FCFA`} trend="+8.1%" up={true} icon={Wallet} color="text-purple-500" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border border-border rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black flex items-center gap-3">
            <BarChart3 className="text-primary" />
            Évolution des Revenus Mensuels
          </h2>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Commissions (FCFA)
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ color: '#eab308' }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === chartData.length - 1 ? '#eab308' : 'var(--muted)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debtors Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-black">Commissions à Collecter</h2>
          <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full">
            {debtors.length} conducteurs en dette
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Conducteur</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Montant Dû</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Jours de retard</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {debtors.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-primary text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <p className="font-bold text-sm">{u.name}</p>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-sm text-red-500">{u.totalDebt} FCFA</td>
                  <td className="p-6">
                    <span className={`text-xs font-bold ${u.debtDays > 7 ? "text-red-500" : "text-orange-500"}`}>
                      {u.debtDays} jours
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => { if(confirm(`Confirmer le paiement de ${u.totalDebt} FCFA pour ${u.name} ?`)) resetUserDebt(u.id); }}
                      className="bg-green-500 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-400 transition-colors"
                    >
                      Marquer comme payé
                    </button>
                  </td>
                </tr>
              ))}
              {debtors.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground font-medium">
                    Aucune dette en cours. Toutes les commissions sont à jour !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-black">Transactions Récentes</h2>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-xl">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-xs font-bold">Derniers 30 jours</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Conducteur</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Montant Trajet</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Commission</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.filter(b => b.status === "confirmed").map((b, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="p-6 text-sm text-muted-foreground">09 Avr 2026</td>
                  <td className="p-6 font-bold text-sm">Conducteur ID: {b.rideId.split('-')[1]}</td>
                  <td className="p-6 font-bold text-sm">{(b.seatsReserved * 1500)} FCFA</td>
                  <td className="p-6 font-bold text-sm text-primary">{b.commission} FCFA</td>
                  <td className="p-6">
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-green-500/10 text-green-500">Collecté</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinancialCard({ label, value, trend, up, icon: Icon, color }: { label: string, value: string, trend: string, up: boolean, icon: any, color: string }) {
  return (
    <div className="bg-card border border-border p-6 rounded-[2rem] relative overflow-hidden group">
      <div className={`${color} bg-current/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-black tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{label}</p>
      </div>
      <div className={`absolute top-6 right-6 flex items-center gap-1 text-xs font-bold ${up ? "text-green-500" : "text-red-500"}`}>
        {trend}
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
    </div>
  );
}

function ClockIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
