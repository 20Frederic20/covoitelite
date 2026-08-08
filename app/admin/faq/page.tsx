"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  HelpCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES: Record<string, string> = {
  reservation: "Réservation",
  paiement: "Paiement",
  trajet: "Trajet",
  compte: "Compte & KYC",
  general: "Général",
};

export default function AdminFaqPage() {
  const { faqEntries, fetchFaqEntries, createFaqEntry, updateFaqEntry, deleteFaqEntry } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "general",
    question: "",
    answer: "",
    sortOrder: 0,
    isPublished: true,
    locale: "fr",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchFaqEntries();
  }, [fetchFaqEntries]);

  const filteredEntries = useMemo(() => {
    return faqEntries.filter((entry) => {
      const matchesSearch =
        entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [faqEntries, searchQuery, categoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingEntryId(null);
    setFormData({
      category: "general",
      question: "",
      answer: "",
      sortOrder: 0,
      isPublished: true,
      locale: "fr",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: any) => {
    setEditingEntryId(entry.id);
    setFormData({
      category: entry.category || "general",
      question: entry.question || "",
      answer: entry.answer || "",
      sortOrder: entry.sortOrder || 0,
      isPublished: entry.isPublished !== false,
      locale: entry.locale || "fr",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setFormError("La question et la réponse sont obligatoires.");
      return;
    }

    try {
      if (editingEntryId) {
        await updateFaqEntry(editingEntryId, formData);
      } else {
        await createFaqEntry(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Une erreur est survenue.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette question de la FAQ ?")) {
      try {
        await deleteFaqEntry(id);
      } catch (err: any) {
        alert(err.message || "Impossible de supprimer.");
      }
    }
  };

  const handleTogglePublish = async (entry: any) => {
    try {
      await updateFaqEntry(entry.id, { isPublished: !entry.isPublished });
    } catch (err: any) {
      alert(err.message || "Impossible de mettre à jour le statut de publication.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Gestion de la FAQ</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Gérez la foire aux questions de l&apos;application (catégories, traduction, publication).
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn btn-ink btn-sm w-full shrink-0 sm:w-auto"
        >
          <Plus size={16} />
          Ajouter une question
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
            placeholder="Rechercher dans la FAQ…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field pl-10"
            aria-label="Rechercher"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate">
            <Filter size={15} />
            Catégorie :
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="field py-1.5"
            aria-label="Filtrer par catégorie"
          >
            <option value="all">Toutes</option>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table & List */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Questions & Réponses</h2>
          <span className="chip bg-surface-alt tabular-nums text-graphite">
            {filteredEntries.length} question(s)
          </span>
        </div>

        {filteredEntries.length > 0 ? (
          <div className="divide-y divide-line">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="transition-colors hover:bg-surface-alt/30">
                  {/* Summary/Header row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-alt text-graphite">
                        <HelpCircle size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-ink text-sm sm:text-base">{entry.question}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="chip bg-brand-soft text-brand-dark text-[10px] py-0.5 px-2">
                            {CATEGORIES[entry.category] || entry.category}
                          </span>
                          <span className="text-[11px] font-semibold text-muted">
                            Ordre : {entry.sortOrder} • Langue : {entry.locale.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(entry);
                        }}
                        className={`btn btn-sm shrink-0 border-0 ${
                          entry.isPublished
                            ? "bg-success-soft text-success hover:bg-success-soft/80"
                            : "bg-surface-alt text-muted hover:bg-surface-alt/80"
                        }`}
                        title={entry.isPublished ? "Dépublier de l'aide" : "Publier sur l'aide"}
                      >
                        {entry.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span className="hidden md:inline">
                          {entry.isPublished ? "Publié" : "Brouillon"}
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(entry);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-alt hover:text-ink"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Answer detail (collapsible) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden bg-surface-alt/20"
                      >
                        <div className="border-t border-line-soft px-12 py-4">
                          <p className="text-sm leading-relaxed text-slate whitespace-pre-wrap">
                            {entry.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
              <FolderOpen className="mx-auto text-muted mb-3" size={32} />
              <p className="text-sm font-bold text-ink">Aucune FAQ trouvée</p>
              <p className="mt-1 text-sm text-slate">
                Aucun élément de FAQ ne correspond à vos filtres actuels.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Creation / Edition Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-night/50 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-panel border border-line bg-surface p-6 shadow-lift"
            >
              <h3 className="text-base font-extrabold text-ink sm:text-lg">
                {editingEntryId ? "Modifier l'entrée FAQ" : "Créer une entrée FAQ"}
              </h3>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {formError && (
                  <div className="rounded-lg bg-danger-soft p-3 text-xs font-semibold text-danger">
                    {formError}
                  </div>
                )}

                <div>
                  <label htmlFor="question" className="overline mb-1 block">Question</label>
                  <input
                    type="text"
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="ex: Comment fonctionne le remboursement ?"
                    className="field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="answer" className="overline mb-1 block">Réponse</label>
                  <textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Saisissez la réponse détaillée..."
                    rows={4}
                    className="field h-auto py-2.5"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="overline mb-1 block">Catégorie</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="field"
                    >
                      {Object.entries(CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="locale" className="overline mb-1 block">Langue (Locale)</label>
                    <select
                      id="locale"
                      value={formData.locale}
                      onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                      className="field"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sortOrder" className="overline mb-1 block">Ordre d&apos;affichage</label>
                    <input
                      type="number"
                      id="sortOrder"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="field"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6 pl-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <label htmlFor="isPublished" className="text-xs font-bold text-ink">
                      Publier directement
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-ink btn-sm">
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
