"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, UserPlus, MoreVertical, Users as UsersIcon } from "lucide-react";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  driver: "Conducteur",
  passenger: "Passager",
};

export default function AdminUsersPage() {
  const { users, updateUserDebt } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Utilisateurs</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Gérez les membres, leurs dettes et leur accès à la plateforme.
          </p>
        </div>
        <button className="btn btn-ink btn-sm w-full shrink-0 sm:w-auto">
          <UserPlus size={16} />
          Ajouter un membre
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou e-mail…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field pl-10"
            aria-label="Rechercher un utilisateur"
          />
        </div>
        <span className="chip shrink-0 self-start bg-surface-alt tabular-nums text-graphite sm:self-auto">
          <UsersIcon size={13} />
          {filteredUsers.length} membre(s)
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="scroll-x">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-surface-alt">
              <tr>
                <th className="overline px-4 py-3 text-left">Utilisateur</th>
                <th className="overline px-4 py-3 text-left">Rôle</th>
                <th className="overline px-4 py-3 text-left">Contact</th>
                <th className="overline px-4 py-3 text-right">Dette</th>
                <th className="overline px-4 py-3 text-left">Statut</th>
                <th className="overline px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-line transition-colors hover:bg-surface-alt"
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                          u.role === "driver"
                            ? "bg-brand text-on-brand"
                            : "bg-surface-alt text-graphite"
                        }`}
                      >
                        {u.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-ink">{u.name}</span>
                        <span className="block truncate text-xs font-semibold text-muted">
                          ID : {u.id}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`chip ${
                        u.role === "admin"
                          ? "bg-info-soft text-info"
                          : u.role === "driver"
                            ? "bg-brand-soft text-brand-dark"
                            : "bg-surface-alt text-graphite"
                      }`}
                    >
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="block text-[13px] font-semibold text-graphite">{u.email}</span>
                    <span className="block text-xs font-semibold tabular-nums text-muted">
                      {u.phone}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <span className="block font-bold tabular-nums text-ink">
                      {money(u.totalDebt || 0)}
                    </span>
                    <span
                      className={`block text-xs font-semibold tabular-nums ${
                        u.debtDays > 7 ? "text-danger" : "text-muted"
                      }`}
                    >
                      {u.debtDays} jour(s)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {u.debtDays > 7 ? (
                      <span className="chip bg-danger-soft text-danger">
                        <XCircle size={13} />
                        Bloqué
                      </span>
                    ) : (
                      <span className="chip bg-success-soft text-success">
                        <CheckCircle2 size={13} />
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => updateUserDebt(u.id, 0, u.debtDays > 7 ? 0 : 8)}
                          className={`grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors ${
                            u.debtDays > 7
                              ? "hover:bg-success-soft hover:text-success"
                              : "hover:bg-danger-soft hover:text-danger"
                          }`}
                          title={u.debtDays > 7 ? "Débloquer" : "Bloquer"}
                        >
                          {u.debtDays > 7 ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                        </button>
                      )}
                      <button
                        className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-surface-alt hover:text-ink"
                        aria-label="Plus d'options"
                      >
                        <MoreVertical size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan={6} className="p-5">
                    <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                      <p className="text-sm font-bold text-ink">Aucun membre trouvé</p>
                      <p className="mt-1 text-sm text-slate">
                        Essayez un autre nom ou une autre adresse e-mail.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
