"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Shield,
  ArrowRight,
  ChevronRight,
  Send,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES: Record<string, string> = {
  RIDE_ISSUE: "Problème trajet",
  PAYMENT_ISSUE: "Problème paiement",
  BEHAVIOR: "Comportement",
  ACCOUNT_ISSUE: "Problème compte",
  BUG: "Bug application",
  OTHER: "Autre",
};

const PRIORITIES: Record<string, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

export default function AdminDisputesPage() {
  const {
    disputes,
    selectedDispute,
    users,
    fetchDisputes,
    fetchDisputeDetail,
    updateDispute,
    addDisputeComment,
    fetchUsers,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentIsInternal, setCommentIsInternal] = useState(true);

  // Fetch initial lists
  useEffect(() => {
    fetchDisputes();
    fetchUsers();
  }, [fetchDisputes, fetchUsers]);

  // Read URL/Hash or just default selection if none
  const handleSelectDispute = async (id: string) => {
    try {
      await fetchDisputeDetail(id);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;
      const matchesSearch =
        d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [disputes, statusFilter, categoryFilter, searchQuery]);

  // When updating attributes in the detail view
  const handleUpdateStatus = async (status: string) => {
    if (!selectedDispute) return;
    try {
      await updateDispute(selectedDispute.id, { status });
    } catch (e) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    if (!selectedDispute) return;
    try {
      await updateDispute(selectedDispute.id, { priority });
    } catch (e) {
      alert("Erreur lors de la mise à jour de la priorité.");
    }
  };

  const handleUpdateAssignee = async (assigneeId: string) => {
    if (!selectedDispute) return;
    try {
      await updateDispute(selectedDispute.id, { assigneeId: assigneeId || undefined });
    } catch (e) {
      alert("Erreur lors de l'assignation de l'agent.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !commentContent.trim()) return;
    try {
      await addDisputeComment(selectedDispute.id, commentContent, commentIsInternal);
      setCommentContent("");
    } catch (e) {
      alert("Erreur lors de l'ajout du commentaire.");
    }
  };

  // Utility to find user details
  const getUserDetails = (userId: string | null | undefined) => {
    if (!userId) return null;
    return users.find((u) => u.id === userId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Gestion des Litiges</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Consultez les signalements, traitez les litiges et communiquez avec les utilisateurs.
          </p>
        </div>
      </header>

      {/* Toolbar / Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher par sujet ou description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field pl-10"
            aria-label="Rechercher"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field py-1.5 text-xs max-w-[130px]"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous</option>
              {Object.entries(STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate">Catégorie :</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="field py-1.5 text-xs max-w-[150px]"
              aria-label="Filtrer par catégorie"
            >
              <option value="all">Toutes</option>
              {Object.entries(CATEGORIES).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Dispute List Queue */}
        <section className={`card overflow-hidden lg:col-span-5 xl:col-span-5`}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">File de traitement</h2>
            <span className="chip bg-surface-alt tabular-nums text-graphite">
              {filteredDisputes.length} litige(s)
            </span>
          </div>

          {filteredDisputes.length > 0 ? (
            <div className="divide-y divide-line max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredDisputes.map((dispute) => {
                const isSelected = selectedDispute?.id === dispute.id;
                const reporter = getUserDetails(dispute.reporterId);
                const isUrgent = dispute.priority === "URGENT" || dispute.priority === "HIGH";

                return (
                  <div
                    key={dispute.id}
                    onClick={() => handleSelectDispute(dispute.id)}
                    className={`group flex cursor-pointer gap-3 p-4 transition-all hover:bg-surface-alt/40 ${
                      isSelected ? "bg-surface-alt/70 border-l-[3px] border-brand" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-bold text-slate">
                          {CATEGORIES[dispute.category] || dispute.category}
                        </span>
                        <span className="text-[10px] font-semibold text-muted tabular-nums">
                          {new Date(dispute.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <h4 className="font-bold text-ink text-sm leading-snug group-hover:text-brand transition-colors">
                        {dispute.subject}
                      </h4>

                      <p className="truncate text-xs text-muted leading-relaxed">
                        {dispute.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span
                          className={`chip text-[10px] py-0.5 px-2 ${
                            dispute.status === "RESOLVED"
                              ? "bg-success-soft text-success"
                              : dispute.status === "CLOSED"
                                ? "bg-surface-alt text-slate"
                                : dispute.status === "IN_PROGRESS"
                                  ? "bg-info-soft text-info"
                                  : "bg-warning-soft text-warning"
                          }`}
                        >
                          {STATUS_LABELS[dispute.status] || dispute.status}
                        </span>

                        <span
                          className={`chip text-[10px] py-0.5 px-2 ${
                            isUrgent ? "bg-danger-soft text-danger font-bold" : "bg-surface-alt text-graphite"
                          }`}
                        >
                          {PRIORITIES[dispute.priority] || dispute.priority}
                        </span>

                        {reporter && (
                          <span className="text-[11px] font-semibold text-slate truncate max-w-[120px]">
                            • Par {reporter.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted/60 shrink-0 self-center" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <CheckCircle2 className="mx-auto text-success mb-3" size={36} />
              <p className="text-sm font-bold text-ink">Aucun litige en attente</p>
              <p className="mt-1 text-xs text-slate">Tout est parfaitement dégagé !</p>
            </div>
          )}
        </section>

        {/* Right Side: Detailed View & Action panel */}
        <section className="lg:col-span-7 xl:col-span-7 space-y-6">
          {selectedDispute ? (
            <div className="card p-5 sm:p-6 space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="chip bg-brand-soft text-brand-dark">
                      {CATEGORIES[selectedDispute.category]}
                    </span>
                    <span className="text-xs font-semibold text-muted tabular-nums">
                      ID : {selectedDispute.id}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-extrabold text-ink sm:text-xl">
                    {selectedDispute.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 self-start shrink-0">
                  <span className="text-xs font-semibold text-slate tabular-nums">
                    Créé le : {new Date(selectedDispute.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>

              {/* Status / Priority selectors */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="overline block mb-1">Statut du litige</label>
                  <select
                    value={selectedDispute.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="field py-1.5 text-xs font-bold"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="overline block mb-1">Priorité</label>
                  <select
                    value={selectedDispute.priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className="field py-1.5 text-xs font-bold"
                  >
                    {Object.entries(PRIORITIES).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="overline block mb-1">Assigné à (Agent)</label>
                  <select
                    value={selectedDispute.assigneeId || ""}
                    onChange={(e) => handleUpdateAssignee(e.target.value)}
                    className="field py-1.5 text-xs font-bold"
                  >
                    <option value="">Non assigné</option>
                    {users
                      .filter((u) => u.role === "admin")
                      .map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} (Admin)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description Body */}
              <div className="bg-surface-alt/30 border border-line-soft rounded-xl p-4">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate overline mb-2">
                  <Flag size={12} />
                  Description du signalement
                </h4>
                <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap font-medium">
                  {selectedDispute.description}
                </p>
              </div>

              {/* Involved entities */}
              <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                  <h4 className="overline mb-1.5">Auteur du signalement</h4>
                  {(() => {
                    const reporter = getUserDetails(selectedDispute.reporterId);
                    return reporter ? (
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-graphite text-xs font-bold">
                          {reporter.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-ink">{reporter.name}</p>
                          <p className="text-[11px] font-semibold text-muted">{reporter.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted font-bold">Inconnu</p>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="overline mb-1.5">Utilisateur mis en cause</h4>
                  {(() => {
                    const target = getUserDetails(selectedDispute.targetUserId);
                    return target ? (
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-danger-soft text-danger text-xs font-bold">
                          {target.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-ink">{target.name}</p>
                          <p className="text-[11px] font-semibold text-muted">{target.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted font-semibold">Aucun mis en cause</p>
                    );
                  })()}
                </div>
              </div>

              {/* Attachments Section */}
              {selectedDispute.attachments && selectedDispute.attachments.length > 0 && (
                <div className="border-t border-line pt-4">
                  <h4 className="overline mb-2">Pièces jointes ({selectedDispute.attachments.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDispute.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        Pièce jointe {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Thread / Comments timeline */}
              <div className="border-t border-line pt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold text-ink overline mb-3">
                  <MessageSquare size={13} />
                  Fil de discussion & Notes d&apos;agent
                </h4>

                {/* Timeline */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 mb-4">
                  {selectedDispute.comments && selectedDispute.comments.length > 0 ? (
                    selectedDispute.comments.map((comment) => {
                      const author = getUserDetails(comment.authorId);
                      return (
                        <div
                          key={comment.id}
                          className={`rounded-xl p-3 text-xs leading-relaxed border ${
                            comment.isInternal
                              ? "bg-warning-soft/40 border-warning/20 text-warning-dark"
                              : "bg-surface-alt border-line-soft text-ink"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-extrabold">
                              {author?.name || "Support"}
                              {comment.isInternal && " (Note interne)"}
                            </span>
                            <span className="text-[10px] font-semibold text-muted tabular-nums">
                              {new Date(comment.createdAt).toLocaleString("fr-FR")}
                            </span>
                          </div>
                          <p className="font-semibold">{comment.content}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[14px] border border-dashed border-line px-4 py-8 text-center text-muted">
                      Aucun message ou note pour le moment.
                    </div>
                  )}
                </div>

                {/* Post New Comment Form */}
                <form onSubmit={handlePostComment} className="space-y-3">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Saisissez un commentaire ou une note d'agent..."
                    className="field h-auto py-2.5 text-xs"
                    rows={3}
                    required
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isInternal"
                        checked={commentIsInternal}
                        onChange={(e) => setCommentIsInternal(e.target.checked)}
                        className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                      />
                      <label htmlFor="isInternal" className="text-xs font-bold text-ink">
                        Note interne (invisible pour les parties)
                      </label>
                    </div>

                    <button type="submit" className="btn btn-ink btn-sm">
                      <Send size={13} />
                      Poster
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <AlertTriangle className="text-muted mb-4" size={42} />
              <h3 className="font-bold text-ink">Aucun litige sélectionné</h3>
              <p className="mt-1 text-sm text-slate max-w-sm">
                Sélectionnez un litige dans la file d&apos;attente pour voir ses détails et agir.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
