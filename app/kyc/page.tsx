"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  Upload,
  FileText,
  Car,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

/* The chevron: a road sign's arrow, borrowed from the hero as an edge accent. */
function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" aria-hidden className={`chevron ${className}`} fill="currentColor">
      <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
    </svg>
  );
}

export default function KycPage() {
  const { user, loadSession } = useStore();
  const router = useRouter();
  const reduce = useReducedMotion();

  // KYC & Vehicle data
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Forms loading/errors
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isRegisteringVehicle, setIsRegisteringVehicle] = useState(false);
  const [docError, setDocError] = useState("");
  const [vehicleError, setVehicleError] = useState("");

  // KYC document form state
  const [docType, setDocType] = useState("IDENTITY_CARD");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  // Vehicle form state
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("4");
  const [vehicleFile, setVehicleFile] = useState<File | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"documents" | "vehicles">("documents");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchKycData();
  }, [user]);

  const fetchKycData = async () => {
    if (!user) return;
    setIsFetchingData(true);
    try {
      // Fetch KYC Documents
      const kRes = await api.get(`/api/v1/kyc/documents/${user.id}`);
      setKycDocs(kRes.data || []);

      // Fetch Vehicles (only for drivers)
      if (user.role === "driver") {
        const vRes = await api.get(`/api/v1/kyc/vehicles/${user.id}?limit=20&offset=0&orderBy=createdAt&order=DESC`);
        setVehicles(vRes.data?.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch KYC data:", err);
    } finally {
      setIsFetchingData(false);
    }
  };

  if (!user) return null;

  // Upload KYC Document
  const handleUploadKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setDocError("Veuillez sélectionner un fichier.");
      return;
    }
    setIsUploadingDoc(true);
    setDocError("");

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("type", docType);
      formData.append("documentNumber", docNumber.trim());
      formData.append("file", docFile);

      await api.post("/api/v1/kyc/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Document KYC téléversé avec succès !");
      setDocNumber("");
      setDocFile(null);
      fetchKycData();
      await loadSession();
    } catch (err: any) {
      console.error(err);
      setDocError(err.message || "Erreur lors du téléversement du document.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Register Vehicle
  const handleRegisterVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleFile) {
      setVehicleError("Veuillez joindre la carte grise (Fichier requis).");
      return;
    }
    setIsRegisteringVehicle(true);
    setVehicleError("");

    try {
      const formData = new FormData();
      formData.append("ownerId", user.id);
      formData.append("type", "CAR");
      formData.append("make", vehicleMake.trim());
      formData.append("model", vehicleModel.trim());
      formData.append("color", vehicleColor.trim());
      formData.append("licensePlate", vehiclePlate.trim());
      formData.append("capacity", vehicleCapacity);
      formData.append("registrationFile", vehicleFile);

      await api.post("/api/v1/kyc/vehicles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Véhicule enregistré avec succès !");
      setVehicleMake("");
      setVehicleModel("");
      setVehicleColor("");
      setVehiclePlate("");
      setVehicleFile(null);
      fetchKycData();
    } catch (err: any) {
      console.error(err);
      setVehicleError(err.message || "Erreur lors de l'enregistrement du véhicule.");
    } finally {
      setIsRegisteringVehicle(false);
    }
  };

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  const getKycStatus = () => {
    if (kycDocs.length === 0) return { status: "NONE", label: "Non vérifié", color: "text-slate" };
    const approvedDocs = kycDocs.filter((doc) => doc.status === "APPROVED");
    const pendingDocs = kycDocs.filter((doc) => doc.status === "PENDING");
    const rejectedDocs = kycDocs.filter((doc) => doc.status === "REJECTED");

    if (rejectedDocs.length > 0) return { status: "REJECTED", label: "Rejeté", color: "text-danger" };
    if (pendingDocs.length > 0) return { status: "PENDING", label: "En cours", color: "text-warning" };
    if (approvedDocs.length > 0) return { status: "APPROVED", label: "Vérifié", color: "text-success" };
    return { status: "NONE", label: "Non vérifié", color: "text-slate" };
  };

  const kycStatus = getKycStatus();

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* ─── KYC Status Header ─── */}
        <motion.section
          {...rise()}
          className="relative isolate overflow-hidden rounded-panel bg-night p-6 sm:p-8"
        >
          <Chevron className="-right-6 top-[-15%] h-[130%] w-auto text-white/[0.06]" />
          <Chevron className="right-4 top-1/2 h-9 w-auto -translate-y-1/2 text-brand sm:right-7 sm:h-12" />

          <div className="relative z-10 pr-10 sm:pr-20">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-extrabold text-on-brand">
                {user.name.charAt(0)}
              </span>
              <div className="flex-1">
                <h1 className="text-title text-white">Vérification KYC</h1>
                <p className="mt-1 text-sm text-white/60">
                  {user.role === "driver" ? "Conducteur" : "Passager"} · {user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {kycStatus.status === "APPROVED" && <CheckCircle className="h-6 w-6 text-success" />}
                {kycStatus.status === "PENDING" && <Clock className="h-6 w-6 text-warning" />}
                {kycStatus.status === "REJECTED" && <XCircle className="h-6 w-6 text-danger" />}
                {kycStatus.status === "NONE" && <AlertCircle className="h-6 w-6 text-slate" />}
                <span className={`text-sm font-bold ${kycStatus.color}`}>{kycStatus.label}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Tabs ─── */}
        <motion.section {...rise(0.06)}>
          <div className="flex gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "documents"
                  ? "bg-brand text-on-brand"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <FileText size={18} />
              Documents
            </button>
            {user.role === "driver" && (
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === "vehicles"
                    ? "bg-brand text-on-brand"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <Car size={18} />
                Véhicules
              </button>
            )}
          </div>
        </motion.section>

        {/* ─── Documents Tab ─── */}
        {activeTab === "documents" && (
          <motion.section {...rise(0.1)} className="space-y-6">
            {/* Existing Documents */}
            <div>
              <h2 className="overline">Documents existants</h2>
              {isFetchingData ? (
                <p className="mt-4 text-sm text-slate">Chargement...</p>
              ) : kycDocs.length === 0 ? (
                <p className="mt-4 text-sm text-slate">Aucun document soumis.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {kycDocs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              )}
            </div>

            {/* Upload New Document */}
            <div>
              <h2 className="overline">Soumettre un document</h2>
              <form onSubmit={handleUploadKyc} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Type de document</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand focus:outline-none"
                  >
                    <option value="IDENTITY_CARD">Carte d'identité</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="DRIVER_LICENSE">Permis de conduire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Numéro de document</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Ex: 1234567890123"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Fichier du document</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="doc-file"
                    />
                    <label
                      htmlFor="doc-file"
                      className="card-flat flex cursor-pointer items-center gap-3 p-4 transition-colors hover:border-brand"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand">
                        <Upload size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">
                          {docFile ? docFile.name : "Choisir un fichier"}
                        </span>
                        <span className="block truncate text-xs text-slate">
                          {docFile ? `${(docFile.size / 1024).toFixed(1)} KB` : "Image ou PDF"}
                        </span>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-muted" />
                    </label>
                  </div>
                </div>

                {docError && (
                  <div className="flex items-center gap-2 text-sm text-danger">
                    <AlertCircle size={16} />
                    {docError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="w-full rounded-lg bg-brand px-4 py-3 font-bold text-on-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isUploadingDoc ? "Téléversement..." : "Soumettre le document"}
                </button>
              </form>
            </div>
          </motion.section>
        )}

        {/* ─── Vehicles Tab (Drivers only) ─── */}
        {activeTab === "vehicles" && user.role === "driver" && (
          <motion.section {...rise(0.1)} className="space-y-6">
            {/* Existing Vehicles */}
            <div>
              <h2 className="overline">Véhicules enregistrés</h2>
              {isFetchingData ? (
                <p className="mt-4 text-sm text-slate">Chargement...</p>
              ) : vehicles.length === 0 ? (
                <p className="mt-4 text-sm text-slate">Aucun véhicule enregistré.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            </div>

            {/* Register New Vehicle */}
            <div>
              <h2 className="overline">Enregistrer un véhicule</h2>
              <form onSubmit={handleRegisterVehicleSubmit} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">Marque</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="Ex: Toyota"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">Modèle</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Ex: Corolla"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">Couleur</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      placeholder="Ex: Noir"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">Plaque d'immatriculation</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="Ex: AB-1234-CD"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Nombre de places</label>
                  <input
                    type="number"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                    min="1"
                    max="8"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Carte grise (Fichier requis)</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setVehicleFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="vehicle-file"
                    />
                    <label
                      htmlFor="vehicle-file"
                      className="card-flat flex cursor-pointer items-center gap-3 p-4 transition-colors hover:border-brand"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand">
                        <Upload size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">
                          {vehicleFile ? vehicleFile.name : "Choisir un fichier"}
                        </span>
                        <span className="block truncate text-xs text-slate">
                          {vehicleFile ? `${(vehicleFile.size / 1024).toFixed(1)} KB` : "Image ou PDF"}
                        </span>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-muted" />
                    </label>
                  </div>
                </div>

                {vehicleError && (
                  <div className="flex items-center gap-2 text-sm text-danger">
                    <AlertCircle size={16} />
                    {vehicleError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegisteringVehicle}
                  className="w-full rounded-lg bg-brand px-4 py-3 font-bold text-on-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {isRegisteringVehicle ? "Enregistrement..." : "Enregistrer le véhicule"}
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </div>
    </AppLayout>
  );
}

function DocumentCard({ document }: { document: any }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { icon: CheckCircle, color: "text-success", label: "Approuvé" };
      case "PENDING":
        return { icon: Clock, color: "text-warning", label: "En cours" };
      case "REJECTED":
        return { icon: XCircle, color: "text-danger", label: "Rejeté" };
      default:
        return { icon: AlertCircle, color: "text-slate", label: "Inconnu" };
    }
  };

  const config = getStatusConfig(document.status);
  const StatusIcon = config.icon;

  const docTypeLabels: Record<string, string> = {
    IDENTITY_CARD: "Carte d'identité",
    PASSPORT: "Passeport",
    DRIVER_LICENSE: "Permis de conduire",
  };

  return (
    <div className="card-flat flex items-center gap-4 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand">
        <FileText size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">
          {docTypeLabels[document.type] || document.type}
        </span>
        <span className="block truncate text-xs text-slate">
          {document.documentNumber || "N° non spécifié"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StatusIcon size={16} className={config.color} />
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: any }) {
  return (
    <div className="card-flat flex items-center gap-4 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-brand-soft text-brand">
        <Car size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">
          {vehicle.make} {vehicle.model}
        </span>
        <span className="block truncate text-xs text-slate">
          {vehicle.color} · {vehicle.licensePlate} · {vehicle.capacity} places
        </span>
      </div>
      {vehicle.isVerified ? (
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-success" />
          <span className="text-xs font-semibold text-success">Vérifié</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-warning" />
          <span className="text-xs font-semibold text-warning">En cours</span>
        </div>
      )}
    </div>
  );
}
