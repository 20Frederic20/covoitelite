"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Car,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Calendar
} from "lucide-react";

export default function AdminRidesPage() {
  const { rides, bookings, deleteRide } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredRides = rides.filter(r => {
    const matchesSearch = 
      r.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = dateFilter ? r.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">TRAJETS</h1>
          <p className="text-zinc-500 font-medium">Surveillez tous les trajets actifs et passés.</p>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher par ville ou conducteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-white appearance-none"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
        <button className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors">
          <Filter size={18} />
          <span>Filtres</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Trajet</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Conducteur</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Places</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Prix</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Statut</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredRides.map((r) => {
                const confirmedSeats = bookings
                  .filter(b => b.rideId === r.id && b.status === "confirmed")
                  .reduce((acc, b) => acc + b.seatsReserved, 0);
                
                return (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-800 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform">
                          <Car size={20} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <span>{r.from}</span>
                            <span className="text-zinc-500">→</span>
                            <span>{r.to}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Clock size={12} />
                            <span>{r.date} à {r.time}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-primary text-xs">
                          {r.driverName.charAt(0)}
                        </div>
                        <p className="font-bold text-sm">{r.driverName}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-zinc-500" />
                        <span className="font-bold">{confirmedSeats} / {r.seats}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-primary">{r.price} FCFA</span>
                    </td>
                    <td className="p-6">
                      {r.status === "available" ? (
                        <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
                          <CheckCircle2 size={14} />
                          <span>OUVERT</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                          <XCircle size={14} />
                          <span>TERMINÉ</span>
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { if(confirm("Supprimer ce trajet ?")) deleteRide(r.id); }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <XCircle size={18} />
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
