"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle2, XCircle, FileText, Car, Filter, Eye, Shield } from "lucide-react";

type KycFilter = "all" | "PENDING" | "APPROVED" | "REJECTED";
type VehicleFilter = "all" | "verified" | "unverified";

function KycContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const { kycDocuments, vehicles, users, fetchKycDocuments, fetchKycVehicles, verifyKycDocument, verifyVehicle } = useStore();
  const [kycFilter, setKycFilter] = useState<KycFilter>("PENDING");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("unverified");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"documents" | "vehicles">(
    sectionParam === "vehicles" ? "vehicles" : "documents"
  );

  useEffect(() => {
    if (sectionParam === "vehicles" || sectionParam === "documents") {
      setActiveTab(sectionParam);
    }
  }, [sectionParam]);

  useEffect(() => {
    fetchKycDocuments();
    fetchKycVehicles();
  }, [fetchKycDocuments, fetchKycVehicles]);

  const filteredDocuments = kycDocuments.filter((d) => {
    const matchesFilter = kycFilter === "all" || d.status === kycFilter;
    const user = users.find((u) => u.id === d.userId);
    const matchesSearch = !searchQuery || 
      user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredVehicles = vehicles.filter((v) => {
    const matchesFilter = vehicleFilter === "all" || 
      (vehicleFilter === "verified" && v.isVerified) ||
      (vehicleFilter === "unverified" && !v.isVerified);
    const owner = users.find((u) => u.id === v.ownerId);
    const matchesSearch = !searchQuery || 
      owner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVerifyDocument = async (documentId: string, approved: boolean) => {
    try {
      await verifyKycDocument(documentId, approved);
    } catch (error) {
      console.error("Failed to verify document:", error);
    }
  };

  const handleVerifyVehicle = async (vehicleId: string) => {
    try {
      await verifyVehicle(vehicleId);
    } catch (error) {
      console.error("Failed to verify vehicle:", error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      IDENTITY_CARD: "Carte d'identité",
      PASSPORT: "Passeport",
      CONSULAR_CARD: "Carte consulaire",
      DRIVERS_LICENSE: "Permis de conduire",
      VEHICLE_REGISTRATION: "Carte grise",
      VEHICLE_INSURANCE: "Assurance véhicule",
      SELFIE: "Selfie",
      SELFIE_WITH_ID: "Selfie avec pièce d'identité",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-title text-ink">Vérification KYC</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            Vérifiez les documents d&apos;identité et validez les véhicules des conducteurs.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
        <button
          onClick={() => setActiveTab("documents")}
          aria-pressed={activeTab === "documents"}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "documents" ? "bg-night text-on-night" : "text-slate hover:text-ink"
          }`}
        >
          <FileText size={16} />
          Documents
        </button>
        <button
          onClick={() => setActiveTab("vehicles")}
          aria-pressed={activeTab === "vehicles"}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "vehicles" ? "bg-night text-on-night" : "text-slate hover:text-ink"
          }`}
        >
          <Car size={16} />
          Véhicules
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder={activeTab === "documents" ? "Rechercher par utilisateur..." : "Rechercher par propriétaire ou plaque..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field pl-10"
            aria-label="Rechercher"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate">
            <Filter size={15} />
            Filtrer :
          </span>
          {activeTab === "documents" ? (
            <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
              {(["all", "PENDING", "APPROVED", "REJECTED"] as KycFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setKycFilter(status)}
                  aria-pressed={kycFilter === status}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    kycFilter === status ? "bg-night text-on-night" : "text-slate hover:text-ink"
                  }`}
                >
                  {status === "all" ? "Tous" : status === "PENDING" ? "En attente" : status === "APPROVED" ? "Approuvés" : "Rejetés"}
                </button>
              ))}
            </div>
          ) : (
            <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
              {(["all", "verified", "unverified"] as VehicleFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setVehicleFilter(filter)}
                  aria-pressed={vehicleFilter === filter}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    vehicleFilter === filter ? "bg-night text-on-night" : "text-slate hover:text-ink"
                  }`}
                >
                  {filter === "all" ? "Tous" : filter === "verified" ? "Validés" : "Non validés"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === "documents" ? (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Documents KYC</h2>
            <span className="chip bg-surface-alt tabular-nums text-graphite">
              {filteredDocuments.length} document(s)
            </span>
          </div>
          <div className="scroll-x">
            <table className="w-full min-w-[50rem] text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="overline px-4 py-3 text-left">Utilisateur</th>
                  <th className="overline px-4 py-3 text-left">Type de document</th>
                  <th className="overline px-4 py-3 text-left">Numéro</th>
                  <th className="overline px-4 py-3 text-right">Date d&apos;expiration</th>
                  <th className="overline px-4 py-3 text-left">Statut</th>
                  <th className="overline px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const user = users.find((u) => u.id === doc.userId);
                  return (
                    <tr
                      key={doc.id}
                      className="border-t border-line transition-colors hover:bg-surface-alt"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                            {user?.name.charAt(0) || "?"}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-ink">{user?.name || "Inconnu"}</span>
                            <span className="block truncate text-xs font-semibold text-muted">
                              {user?.email || ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                          <FileText size={14} className="text-muted" />
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-muted">
                        {doc.documentNumber || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-slate">
                        {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {doc.status === "APPROVED" ? (
                          <span className="chip bg-success-soft text-success">
                            <CheckCircle2 size={13} />
                            Approuvé
                          </span>
                        ) : doc.status === "REJECTED" ? (
                          <span className="chip bg-danger-soft text-danger">
                            <XCircle size={13} />
                            Rejeté
                          </span>
                        ) : (
                          <span className="chip bg-warning-soft text-warning">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            title="Voir le document"
                          >
                            <Eye size={14} />
                          </a>
                          {doc.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => {
                                  if (confirm(`Approuver ce document pour ${user?.name || "cet utilisateur"} ?`)) {
                                    handleVerifyDocument(doc.id, true);
                                  }
                                }}
                                className="btn btn-outline btn-sm text-success hover:bg-success-soft"
                                title="Approuver"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Rejeter ce document pour ${user?.name || "cet utilisateur"} ?`)) {
                                    handleVerifyDocument(doc.id, false);
                                  }
                                }}
                                className="btn btn-outline btn-sm text-danger hover:bg-danger-soft"
                                title="Rejeter"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredDocuments.length === 0 && (
                  <tr className="border-t border-line">
                    <td colSpan={6} className="p-5">
                      <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                        <p className="text-sm font-bold text-ink">Aucun document trouvé</p>
                        <p className="mt-1 text-sm text-slate">
                          Aucun document ne correspond aux critères de recherche.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Véhicules</h2>
            <span className="chip bg-surface-alt tabular-nums text-graphite">
              {filteredVehicles.length} véhicule(s)
            </span>
          </div>
          <div className="scroll-x">
            <table className="w-full min-w-[50rem] text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="overline px-4 py-3 text-left">Propriétaire</th>
                  <th className="overline px-4 py-3 text-left">Véhicule</th>
                  <th className="overline px-4 py-3 text-left">Plaque</th>
                  <th className="overline px-4 py-3 text-right">Capacité</th>
                  <th className="overline px-4 py-3 text-left">Statut</th>
                  <th className="overline px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => {
                  const owner = users.find((u) => u.id === vehicle.ownerId);
                  return (
                    <tr
                      key={vehicle.id}
                      className="border-t border-line transition-colors hover:bg-surface-alt"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-on-brand">
                            {owner?.name.charAt(0) || "?"}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-ink">{owner?.name || "Inconnu"}</span>
                            <span className="block truncate text-xs font-semibold text-muted">
                              {owner?.email || ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-alt text-graphite">
                            <Car size={14} />
                          </span>
                          <div>
                            <span className="block text-xs font-bold text-ink">
                              {vehicle.make} {vehicle.model}
                            </span>
                            <span className="block text-[11px] font-semibold text-muted">
                              {vehicle.type === "CAR" ? "Voiture" : "Moto"} • {vehicle.color}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-ink">
                        {vehicle.licensePlate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold tabular-nums text-ink">
                        {vehicle.capacity} place(s)
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {vehicle.isVerified ? (
                          <span className="chip bg-success-soft text-success">
                            <CheckCircle2 size={13} />
                            Validé
                          </span>
                        ) : (
                          <span className="chip bg-warning-soft text-warning">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {vehicle.registrationFileUrl && (
                            <a
                              href={vehicle.registrationFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                              title="Voir la carte grise"
                            >
                              <Eye size={14} />
                            </a>
                          )}
                          {!vehicle.isVerified && (
                            <button
                              onClick={() => {
                                if (confirm(`Valider ce véhicule pour ${owner?.name || "ce propriétaire"} ?`)) {
                                  handleVerifyVehicle(vehicle.id);
                                }
                              }}
                              className="btn btn-outline btn-sm text-success hover:bg-success-soft"
                              title="Valider"
                            >
                              <Shield size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredVehicles.length === 0 && (
                  <tr className="border-t border-line">
                    <td colSpan={6} className="p-5">
                      <div className="rounded-[14px] border border-dashed border-line px-6 py-12 text-center">
                        <p className="text-sm font-bold text-ink">Aucun véhicule trouvé</p>
                        <p className="mt-1 text-sm text-slate">
                          Aucun véhicule ne correspond aux critères de recherche.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminKycPage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate">Chargement...</div>}>
      <KycContent />
    </Suspense>
  );
}
