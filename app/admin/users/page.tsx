"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, UserPlus, MoreVertical, Users as UsersIcon, Shield, Trash2, RefreshCw, Crown } from "lucide-react";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ")} F`;

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  driver: "Conducteur",
  passenger: "Passager",
};

const KYC_LEVEL_LABEL: Record<string, string> = {
  NON_VERIFIED: "Non vérifié",
  PHONE_VERIFIED: "Téléphone vérifié",
  IDENTITY_VERIFIED: "Identité vérifiée",
  DRIVER_VERIFIED: "Conducteur vérifié",
  PREMIUM_DRIVER: "Conducteur premium",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Actif",
  BLOCKED: "Bloqué",
  PENDING_VERIFICATION: "En attente",
};

export default function AdminUsersPage() {
  const { users, updateUserDebt, promoteAdmin, demoteAdmin, deleteUser, restoreUser, fetchUsers } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
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
                <th className="overline px-4 py-3 text-left">KYC</th>
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
                      {u.role === "admin" && <Crown size={12} className="mr-1" />}
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="block text-[13px] font-semibold text-graphite">{u.email}</span>
                    <span className="block text-xs font-semibold tabular-nums text-muted">
                      {u.phone}
                    </span>
                    {u.isEmailVerified && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                        <CheckCircle2 size={10} />
                        Email vérifié
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`chip text-[11px] ${
                        u.kycLevel === "NON_VERIFIED"
                          ? "bg-surface-alt text-graphite"
                          : u.kycLevel === "PREMIUM_DRIVER"
                            ? "bg-brand-soft text-brand-dark"
                            : "bg-success-soft text-success"
                      }`}
                    >
                      {KYC_LEVEL_LABEL[u.kycLevel || "NON_VERIFIED"]}
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
                    {u.status === "BLOCKED" ? (
                      <span className="chip bg-danger-soft text-danger">
                        <XCircle size={13} />
                        {STATUS_LABEL[u.status || "BLOCKED"]}
                      </span>
                    ) : u.status === "PENDING_VERIFICATION" ? (
                      <span className="chip bg-warning-soft text-warning">
                        En attente
                      </span>
                    ) : (
                      <span className="chip bg-success-soft text-success">
                        <CheckCircle2 size={13} />
                        {STATUS_LABEL[u.status || "ACTIVE"]}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Promouvoir ${u.name} en admin ?`)) {
                              promoteAdmin(u.id);
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-info-soft hover:text-info"
                          title="Promouvoir admin"
                        >
                          <Crown size={16} />
                        </button>
                      )}
                      {u.role === "admin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Rétrograder ${u.name} du rôle admin ?`)) {
                              demoteAdmin(u.id);
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-warning-soft hover:text-warning"
                          title="Rétrograder admin"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      {u.status !== "BLOCKED" && (
                        <button
                          onClick={() => {
                            if (confirm(`Bloquer ${u.name} ?`)) {
                              updateUserDebt(u.id, 0, 8);
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                          title="Bloquer"
                        >
                          <XCircle size={17} />
                        </button>
                      )}
                      {u.status === "BLOCKED" && (
                        <button
                          onClick={() => {
                            if (confirm(`Débloquer ${u.name} ?`)) {
                              updateUserDebt(u.id, 0, 0);
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-success-soft hover:text-success"
                          title="Débloquer"
                        >
                          <CheckCircle2 size={17} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer ${u.name} ?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Restaurer ${u.name} ?`)) {
                            restoreUser(u.id);
                          }
                        }}
                        className="grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-success-soft hover:text-success"
                        title="Restaurer"
                      >
                        <RefreshCw size={16} />
                      </button>
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
                  <td colSpan={7} className="p-5">
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
