"use client";

import { useState } from "react";
import { useStore, User } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogIn, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Identifier (Email/Phone), 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { setUser } = useStore();
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await api.post("/api/v1/auth/request-otp", {
        identifier: identifier.trim(),
      });
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Impossible d'envoyer le code OTP. Veuillez vérifier vos informations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/api/v1/auth/verify-otp", {
        identifier: identifier.trim(),
        otpCode: otp.trim(),
      });

      const { accessToken, user: backendUser } = res.data;

      // Determine role safely
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
        name: backendUser.fullName || `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() || "Utilisateur",
        email: backendUser.email || "",
        phone: backendUser.phone || "",
        role: userRole,
        rating: 4.8,
        tripsCount: 12,
        debtDays: 0,
      };

      setUser(mappedUser, accessToken);

      // Load full session to update profile details / debts
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Code OTP invalide. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">CovoitElite</h1>
          <p className="text-muted-foreground">L&apos;excellence du covoiturage</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-4 rounded-xl mb-6 text-center">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email ou Téléphone</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="votre@email.com ou +229..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Continuer
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-4 text-muted-foreground flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft size={16} />
              <span>Changer d&apos;identifiant</span>
            </button>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Code OTP reçu</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-primary transition-colors"
                placeholder="000000"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Se connecter
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Pas encore de compte ?{" "}
            <button onClick={() => router.push("/register")} className="text-primary font-semibold">
              S&apos;inscrire
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
