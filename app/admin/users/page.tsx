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
          <p className="text-muted-foreground font-medium">Gérez les membres de la communauté CovoitElite.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors w-fit">
          <UserPlus size={20} />
          <span>Ajouter</span>
        </button>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button className="bg-card border border-border px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-muted transition-colors">
          <Filter size={18} />
          <span>Filtres</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Utilisateur</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Rôle</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Dette / Jours</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
                <th className="p-6 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                      u.role === "admin" ? "bg-purple-500/10 text-purple-500" :
                      u.role === "driver" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail size={12} />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone size={12} />
                        <span>{u.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm">
                      <p className="font-bold">{u.totalDebt || 0} FCFA</p>
                      <p className="text-xs text-muted-foreground">{u.debtDays} jours</p>
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
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
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
