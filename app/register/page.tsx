"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, ArrowLeft, CheckCircle, XCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useStore, User } from "@/store/useStore";

/* ─────────────── Types ─────────────── */
type ModalType = "otp" | "success" | "error" | null;

/* ─────────────── Modal Component ─────────────── */
function Modal({
  type,
  message,
  otp,
  setOtp,
  isLoading,
  onVerify,
  onResend,
  onClose,
}: {
  type: ModalType;
  message?: string;
  otp?: string;
  setOtp?: (v: string) => void;
  isLoading?: boolean;
  onVerify?: () => void;
  onResend?: () => void;
  onClose?: () => void;
}) {
  if (!type) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-sm rounded-2xl p-7 shadow-2xl"
          style={{ background: "var(--card, #1a1a2e)", border: "1px solid var(--border, rgba(255,255,255,0.1))" }}
        >
          {/* ── OTP Modal ── */}
          {type === "otp" && (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(var(--primary-rgb, 234,179,8), 0.15)" }}>
                  <ShieldCheck size={28} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground text-center">Vérification OTP</h2>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Un code à 6 chiffres a été envoyé par SMS.<br />Saisissez-le ci-dessous pour vous connecter.
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp?.(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-background border border-border rounded-xl py-4 px-4 text-foreground text-center text-3xl tracking-[0.6em] focus:outline-none focus:border-primary transition-colors mb-5"
                placeholder="______"
                disabled={isLoading}
                autoFocus
              />

              <button
                onClick={onVerify}
                disabled={isLoading || (otp?.length ?? 0) < 6}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Vérifier & Me connecter
                  </>
                )}
              </button>

              <button
                onClick={onResend}
                disabled={isLoading}
                className="w-full text-muted-foreground text-sm font-medium py-2 flex items-center justify-center gap-2 hover:text-foreground transition-colors"
              >
                <RefreshCw size={14} />
                Renvoyer le code
              </button>
            </>
          )}

          {/* ── Success Modal ── */}
          {type === "success" && (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(34,197,94,0.15)" }}>
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground text-center">Succès</h2>
                <p className="text-sm text-muted-foreground text-center mt-2">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-colors"
              >
                Continuer
              </button>
            </>
          )}

          {/* ── Error Modal ── */}
          {type === "error" && (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(239,68,68,0.15)" }}>
                  <XCircle size={32} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground text-center">Erreur</h2>
                <p className="text-sm text-muted-foreground text-center mt-2">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full border border-border text-foreground font-bold py-3.5 rounded-xl hover:bg-card transition-colors"
              >
                Fermer
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────── Page ─────────────── */
export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [modal, setModal] = useState<ModalType>(null);
  const [modalMessage, setModalMessage] = useState("");

  // OTP step
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { setUser } = useStore();
  const router = useRouter();

  /* ── 1. Register + auto request-otp ── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/v1/auth/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });

      // Demande automatique de l'OTP après l'inscription
      await api.post("/api/v1/auth/request-otp", {
        identifier: phone.trim(),
      });

      // Ouvre la modal OTP
      setOtp("");
      setModal("otp");
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.message || "Erreur lors de l'inscription. Vérifiez les données saisies.");
      setModal("error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── 2. Verify OTP → connexion ── */
  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      const res = await api.post("/api/v1/auth/verify-otp", {
        identifier: phone.trim(),
        otpCode: otp.trim(),
      });

      const { accessToken, user: backendUser } = res.data;

      const rawRole = backendUser.roles?.[0];
      const roleStr = typeof rawRole === "string" ? rawRole : rawRole?.name || "passenger";
      const userRole: "admin" | "driver" | "passenger" =
        roleStr.toLowerCase() === "admin"
          ? "admin"
          : roleStr.toLowerCase() === "driver" || roleStr.toLowerCase() === "premium_driver"
          ? "driver"
          : "passenger";

      const mappedUser: User = {
        id: backendUser.id,
        name:
          backendUser.fullName ||
          `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() ||
          "Utilisateur",
        email: backendUser.email || "",
        phone: backendUser.phone || phone.trim(),
        role: userRole,
        rating: 4.8,
        tripsCount: 0,
        debtDays: 0,
      };

      setUser(mappedUser, accessToken);
      setModal(null);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.message || "Code OTP invalide ou expiré. Veuillez réessayer.");
      setModal("error");
    } finally {
      setIsVerifying(false);
    }
  };

  /* ── 3. Resend OTP ── */
  const handleResendOtp = async () => {
    setIsVerifying(true);
    try {
      await api.post("/api/v1/auth/request-otp", { identifier: phone.trim() });
      setOtp("");
      // Reste sur la modal OTP, l'utilisateur voit le champ vide = signal visuel
    } catch (err: any) {
      setModalMessage(err.message || "Impossible de renvoyer le code.");
      setModal("error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      {/* ── Modals ── */}
      <Modal
        type={modal}
        message={modalMessage}
        otp={otp}
        setOtp={setOtp}
        isLoading={isVerifying}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={() => {
          if (modal === "success") router.push("/login");
          setModal(null);
        }}
      />

      {/* ── Page ── */}
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <button
            onClick={() => router.back()}
            className="mb-8 text-muted-foreground flex items-center gap-2"
            disabled={isLoading}
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez l&apos;élite du covoiturage</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ex: Jean"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ex: Dupont"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email <span className="text-xs">(Optionnel)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="votre@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Téléphone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Ex: +22961234567"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  S&apos;inscrire
                  <UserPlus size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Déjà un compte ?{" "}
              <button onClick={() => router.push("/login")} className="text-primary font-semibold">
                Se connecter
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
