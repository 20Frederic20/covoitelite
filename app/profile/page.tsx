"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Star,
  Briefcase,
  LogOut,
  Shield,
  ChevronRight,
  History,
  Wallet,
  ShieldCheck,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Clock,
  Plus,
  ArrowLeft
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

export default function ProfilePage() {
  const { user, setUser, rides, bookings, loadSession } = useStore();
  const router = useRouter();

  // Sub-panel state: "menu" | "wallet" | "kyc"
  const [activePanel, setActivePanel] = useState<"menu" | "wallet" | "kyc">("menu");

  // KYC & Vehicle lists
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Forms loading/errors
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isRegisteringVehicle, setIsRegisteringVehicle] = useState(false);
  const [isPayingDebt, setIsPayingDebt] = useState(false);
  const [docError, setDocError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [debtError, setDebtError] = useState("");

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

  useEffect(() => {
    if (!user) return;
    fetchProfileDetails();
  }, [user, activePanel]);

  const fetchProfileDetails = async () => {
    if (!user) return;
    setIsFetchingData(true);
    try {
      // 1. Fetch KYC Documents
      const kRes = await api.get(`/api/v1/kyc/documents/${user.id}`);
      setKycDocs(kRes.data || []);

      // 2. Fetch Vehicles
      const vRes = await api.get(`/api/v1/kyc/vehicles/${user.id}?limit=20&offset=0&orderBy=createdAt&order=DESC`);
      setVehicles(vRes.data?.data || []);

      // 3. Fetch Debt details if driver
      if (user.role === "driver") {
        const dRes = await api.get(`/api/v1/billing/drivers/${user.id}/summary`);
        setDebts(dRes.data?.debts || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile details:", err);
    } finally {
      setIsFetchingData(false);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

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
      fetchProfileDetails();
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
      fetchProfileDetails();
    } catch (err: any) {
      console.error(err);
      setVehicleError(err.message || "Erreur lors de l'enregistrement du véhicule.");
    } finally {
      setIsRegisteringVehicle(false);
    }
  };

  // Pay Debt via Mobile Money
  const handlePayDebt = async (debtId: string) => {
    setIsPayingDebt(true);
    setDebtError("");
    try {
      await api.post(`/api/v1/billing/debts/${debtId}/pay`, {
        debtId,
        driverId: user.id,
      });
      alert("Paiement de la dette effectué avec succès !");
      await fetchProfileDetails();
      await loadSession(); // refresh main user block status
    } catch (err: any) {
      console.error(err);
      setDebtError(err.message || "Erreur lors du paiement de la dette.");
    } finally {
      setIsPayingDebt(false);
    }
  };

  const userRides = rides.filter(r => r.driverId === user.id);
  const userBookings = bookings.filter(b => b.passengerId === user.id);

  return (
    <AppLayout>
      <div className="space-y-8 pb-10">

        {/* Back Button for Sub-Panels */}
        {activePanel !== "menu" && (
          <button
            onClick={() => setActivePanel("menu")}
            className="text-muted-foreground flex items-center gap-2 text-sm font-bold hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Retour au profil</span>
          </button>
        )}

        {/* Profile Main View */}
        {activePanel === "menu" && (
          <>
            {/* Profile Header */}
            <div className="flex flex-col items-center pt-4">
              <div className="relative">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-4xl font-bold text-primary border-4 border-card">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full border-4 border-card">
                  <Shield size={16} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-4 text-foreground">{user.name}</h2>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <Star size={16} className="text-primary fill-primary" />
                <span className="font-bold text-foreground">{user.rating.toFixed(1)}</span>
                <span className="text-xs ml-1">({user.tripsCount} trajets)</span>
              </div>
              <div className="mt-4 px-4 py-1 bg-muted border border-border rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {user.role === "driver" ? "Conducteur Élite" : user.role === "admin" ? "Administrateur" : "Passager Élite"}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-primary">{userRides.length}</p>
                <p className="text-xs text-muted-foreground">Courses publiées</p>
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-primary">{userBookings.length}</p>
                <p className="text-xs text-muted-foreground">Réservations</p>
              </div>
            </div>

            {/* Menu */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Paramètres</h3>

              <div className="grid md:grid-cols-2 gap-2">
                {user.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group"
                  >
                    <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-primary">Administration</p>
                      <p className="text-xs text-muted-foreground">Gestion de la plateforme</p>
                    </div>
                    <ChevronRight size={18} className="text-primary" />
                  </button>
                )}

                <button
                  onClick={() => setActivePanel("wallet")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-colors group text-left"
                >
                  <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Wallet size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Portefeuille & Dettes</p>
                    <p className="text-xs text-muted-foreground">Gérer vos gains et paiements</p>
                  </div>
                  <ChevronRight size={18} className="text-border" />
                </button>

                <button
                  onClick={() => setActivePanel("kyc")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-colors group text-left"
                >
                  <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Sécurité & KYC</p>
                    <p className="text-xs text-muted-foreground">Vérification de compte & Véhicules</p>
                  </div>
                  <ChevronRight size={18} className="text-border" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-colors text-red-500"
                >
                  <div className="bg-red-500/10 p-2 rounded-xl">
                    <LogOut size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">Déconnexion</p>
                    <p className="text-xs opacity-60">Quitter l&apos;application</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Debt Warning Simulation */}
            {user.debtDays > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                <h4 className="text-red-500 font-bold text-sm flex items-center gap-2">
                  <Shield size={16} />
                  Attention : Dette en cours
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Vous avez une commission impayée de <span className="font-bold">{user.totalDebt || 0} FCFA</span> depuis {user.debtDays} jours.
                  {user.debtDays > 7 ? " Votre compte est bloqué." : " Payez avant 7 jours pour éviter le blocage."}
                </p>
              </div>
            )}
          </>
        )}

        {/* Portefeuille & Dettes Panel */}
        {activePanel === "wallet" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Portefeuille & Facturation</h2>
            
            <div className="bg-card border border-border p-6 rounded-3xl">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Dette Totale à Payer</p>
              <h3 className="text-3xl font-black text-primary">{user.totalDebt || 0} FCFA</h3>
              <p className="text-xs text-muted-foreground mt-2">
                {user.isBlocked
                  ? "Votre compte est actuellement BLOQUÉ en raison d'un retard de paiement supérieur à 7 jours."
                  : "Vos paiements de commissions sont à jour ou en attente standard."
                }
              </p>
            </div>

            {debtError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-4 rounded-xl text-center">
                {debtError}
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Dettes en attente ({debts.length})</h4>

              {debts.length > 0 ? (
                <div className="space-y-3">
                  {debts.map((d: any) => (
                    <div key={d.id} className="bg-card border border-border p-4 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">{d.amount} FCFA</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Statut: {d.status}</p>
                        <p className="text-[10px] text-zinc-500">Date d&apos;échéance: {new Date(d.dueAt).toLocaleDateString()}</p>
                      </div>

                      {d.status === "PENDING" && (
                        <button
                          onClick={() => handlePayDebt(d.id)}
                          disabled={isPayingDebt}
                          className="bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-xl hover:bg-yellow-500 transition-colors"
                        >
                          Payer (Momo)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic px-1">Aucune dette en attente de paiement.</p>
              )}
            </div>
          </div>
        )}

        {/* Sécurité & KYC Panel */}
        {activePanel === "kyc" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Sécurité & KYC</h2>

            {/* Verification Status */}
            <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Niveau de vérification</p>
                <h3 className="text-lg font-bold text-foreground">
                  {user.role === "driver" ? "Conducteur Vérifié" : "Passager Vérifié"}
                </h3>
              </div>
              <div className="bg-green-500/10 text-green-500 p-3 rounded-2xl">
                <Shield size={24} />
              </div>
            </div>

            {/* KYC Documents Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Vos documents KYC ({kycDocs.length})</h3>

              {kycDocs.length > 0 ? (
                <div className="grid gap-3">
                  {kycDocs.map((d: any) => (
                    <div key={d.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{d.type}</p>
                          <p className="text-xs text-muted-foreground">N° {d.documentNumber}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                        d.status === "APPROVED" ? "bg-green-500/10 text-green-500" :
                        d.status === "REJECTED" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic px-1">Aucun document KYC téléversé pour le moment.</p>
              )}

              {/* Upload Form */}
              <form onSubmit={handleUploadKyc} className="bg-card border border-border p-4 rounded-2xl space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ajouter un document KYC</p>
                {docError && <p className="text-xs text-red-500 font-medium">{docError}</p>}

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none"
                    disabled={isUploadingDoc}
                  >
                    <option value="IDENTITY_CARD">Carte d&apos;identité</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="DRIVERS_LICENSE">Permis de conduire</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Numéro du document"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none"
                    disabled={isUploadingDoc}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    required
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="doc-upload-input"
                    disabled={isUploadingDoc}
                  />
                  <label
                    htmlFor="doc-upload-input"
                    className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs p-3 rounded-xl cursor-pointer flex items-center gap-2 flex-1 justify-center"
                  >
                    <Upload size={16} />
                    <span>{docFile ? docFile.name : "Sélectionner le document (Recto)"}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isUploadingDoc}
                    className="bg-primary text-primary-foreground font-bold text-xs px-4 py-3 rounded-xl hover:bg-yellow-500 transition-colors"
                  >
                    {isUploadingDoc ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            </div>

            {/* Vehicles Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Vos Véhicules ({vehicles.length})</h3>

              {vehicles.length > 0 ? (
                <div className="grid gap-3">
                  {vehicles.map((v: any) => (
                    <div key={v.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Car className="text-primary" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{v.make} {v.model}</p>
                          <p className="text-xs text-muted-foreground">Immatriculation: {v.licensePlate} ({v.color})</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                        v.isVerified ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {v.isVerified ? "Vérifié" : "En attente"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic px-1">Aucun véhicule enregistré pour le moment.</p>
              )}

              {/* Add Vehicle Form */}
              <form onSubmit={handleRegisterVehicleSubmit} className="bg-card border border-border p-4 rounded-2xl space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Enregistrer un Véhicule</p>
                {vehicleError && <p className="text-xs text-red-500 font-medium">{vehicleError}</p>}

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Marque (ex: Toyota)"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none"
                    disabled={isRegisteringVehicle}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Modèle (ex: Corolla)"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none"
                    disabled={isRegisteringVehicle}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Couleur"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none col-span-1"
                    disabled={isRegisteringVehicle}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Plaque (ex: AB-123-CD)"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none col-span-1"
                    disabled={isRegisteringVehicle}
                  />
                  <input
                    type="number"
                    required
                    placeholder="Places"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                    className="bg-muted border-none rounded-xl text-xs p-3 text-foreground focus:outline-none col-span-1 text-center"
                    disabled={isRegisteringVehicle}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    required
                    onChange={(e) => setVehicleFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="vehicle-upload-input"
                    disabled={isRegisteringVehicle}
                  />
                  <label
                    htmlFor="vehicle-upload-input"
                    className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs p-3 rounded-xl cursor-pointer flex items-center gap-2 flex-1 justify-center"
                  >
                    <Upload size={16} />
                    <span>{vehicleFile ? vehicleFile.name : "Carte Grise (Fichier)"}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isRegisteringVehicle}
                    className="bg-primary text-primary-foreground font-bold text-xs px-4 py-3 rounded-xl hover:bg-yellow-500 transition-colors"
                  >
                    {isRegisteringVehicle ? "Envoi..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
