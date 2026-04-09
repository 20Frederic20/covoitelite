"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  UserPlus,
  Mail,
  Phone
} from "lucide-react";

export default function AdminUsersPage() {
  const { users, updateUserDebt } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">UTILISATEURS</h1>
          <p className="text-zinc-500 font-medium">Gérez les membres de la communauté CovoitElite.</p>
        </div>
        <button className="bg-primary text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors w-fit">
          <UserPlus size={20} />
          <span>Ajouter</span>
        </button>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
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
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Utilisateur</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Rôle</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Dette / Jours</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Statut</th>
                <th className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-xs text-zinc-500">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                      u.role === "admin" ? "bg-purple-500/10 text-purple-500" :
                      u.role === "driver" ? "bg-blue-500/10 text-blue-500" : "bg-zinc-500/10 text-zinc-500"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Mail size={12} />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone size={12} />
                        <span>{u.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm">
                      <p className="font-bold">{u.totalDebt || 0} FCFA</p>
                      <p className="text-xs text-zinc-500">{u.debtDays} jours</p>
                    </div>
                  </td>
                  <td className="p-6">
                    {u.debtDays > 7 ? (
                      <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                        <XCircle size={14} />
                        <span>BLOQUÉ</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
                        <CheckCircle2 size={14} />
                        <span>ACTIF</span>
                      </div>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.role !== "admin" && (
                        <button 
                          onClick={() => updateUserDebt(u.id, 0, u.debtDays > 7 ? 0 : 8)}
                          className={`p-2 rounded-lg transition-colors ${
                            u.debtDays > 7 ? "text-green-500 hover:bg-green-500/10" : "text-red-500 hover:bg-red-500/10"
                          }`}
                          title={u.debtDays > 7 ? "Débloquer" : "Bloquer"}
                        >
                          {u.debtDays > 7 ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        </button>
                      )}
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
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
