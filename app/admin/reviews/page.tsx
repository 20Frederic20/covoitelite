"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useMemo } from "react";
import { Search, Star, Trash2, ShieldAlert, MessageSquare, ShieldCheck, User } from "lucide-react";

export default function AdminReviewsPage() {
  const { users, userReviews, fetchUsers, fetchUserReviews, deleteReview } = useStore();
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.phone.includes(userSearchQuery)
    );
  }, [users, userSearchQuery]);

  const handleSelectUser = async (userId: string) => {
    setSelectedUserId(userId);
    await fetchUserReviews(userId);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet avis définitivement de la plateforme ?")) {
      try {
        await deleteReview(reviewId);
      } catch (e) {
        alert("Une erreur est survenue lors de la suppression de l'avis.");
      }
    }
  };

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId);
  }, [users, selectedUserId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Modération des Avis</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Option A : Recherchez un utilisateur pour lister et modérer (supprimer) les avis qu&apos;il a reçus.
          </p>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Users Search & Selector List */}
        <section className="card overflow-hidden lg:col-span-5 xl:col-span-4">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink mb-3">Rechercher un membre</h2>
            <div className="relative min-w-0">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Nom, e-mail ou téléphone…"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="field pl-10"
                aria-label="Rechercher un membre"
              />
            </div>
          </div>

          <div className="divide-y divide-line max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-surface-alt/40 ${
                      isSelected ? "bg-surface-alt/70 border-l-[3px] border-brand" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink text-sm truncate">{u.name}</p>
                      <p className="text-xs text-muted truncate mt-0.5">{u.email}</p>
                    </div>
                    <span className="chip shrink-0 text-[10px] bg-surface-alt text-graphite ml-2">
                      {u.role === "driver" ? "Conducteur" : u.role === "admin" ? "Admin" : "Passager"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Reviews Queue list of Selected User */}
        <section className="lg:col-span-7 xl:col-span-8">
          {selectedUserId && selectedUser ? (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 bg-surface-alt/30">
                <div className="min-w-0">
                  <h3 className="font-bold text-ink text-sm sm:text-base">
                    Avis reçus par : <span className="text-brand font-extrabold">{selectedUser.name}</span>
                  </h3>
                  <p className="text-xs text-slate mt-0.5">
                    Rôle d&apos;inscription : {selectedUser.role === "driver" ? "Conducteur" : "Passager"}
                  </p>
                </div>
                <span className="chip bg-night text-on-night tabular-nums">
                  {userReviews.length} avis
                </span>
              </div>

              {userReviews.length > 0 ? (
                <div className="divide-y divide-line">
                  {userReviews.map((review) => {
                    const reviewer = users.find((u) => u.id === review.authorId);
                    return (
                      <div key={review.id} className="p-5 flex gap-4 items-start justify-between">
                        <div className="space-y-2 min-w-0 flex-1">
                          {/* Stars and Role */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 text-warning">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  size={14}
                                  fill={idx < review.rating ? "currentColor" : "none"}
                                  className={idx < review.rating ? "text-warning" : "text-muted"}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold tabular-nums text-ink">
                              ({review.rating} / 5)
                            </span>
                            <span className="text-[10px] chip bg-surface-alt text-slate">
                              Rôle noté : {review.targetRole === "DRIVER" ? "Conducteur" : "Passager"}
                            </span>
                          </div>

                          {/* Message */}
                          <p className="text-sm font-semibold text-ink leading-relaxed whitespace-pre-wrap">
                            {review.comment || (
                              <span className="text-xs text-muted italic font-bold">
                                Aucun commentaire écrit
                              </span>
                            )}
                          </p>

                          {/* Meta author and date */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted font-semibold">
                            <span>Par : {reviewer?.name || "Membre Inconnu"}</span>
                            <span>•</span>
                            <span className="tabular-nums">
                              {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Mod/Delete Action */}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="btn btn-outline btn-sm text-danger hover:bg-danger-soft shrink-0"
                          title="Supprimer (modérer) cet avis"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-muted">
                  <ShieldCheck className="mx-auto text-success mb-2" size={32} />
                  <p className="text-sm font-bold text-ink">Aucun avis reçu</p>
                  <p className="text-xs text-slate mt-0.5">Cet utilisateur n&apos;a pas encore reçu d&apos;avis.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <User className="text-muted mb-4" size={42} />
              <h3 className="font-bold text-ink">Sélectionnez un utilisateur</h3>
              <p className="mt-1 text-sm text-slate max-w-xs">
                Sélectionnez un membre dans le panneau de gauche pour charger et modérer ses avis reçus.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
