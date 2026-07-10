"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { UserPlus, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await api.post("/api/v1/auth/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });

      // Automatic OTP request after successful registration
      try {
        await api.post("/api/v1/auth/request-otp", {
          identifier: phone.trim(),
        });
        alert("Inscription réussie ! Un code OTP a été envoyé sur votre téléphone pour vous connecter.");
        router.push("/login");
      } catch (otpErr) {
        alert("Inscription réussie ! Veuillez vous connecter sur la page de connexion.");
        router.push("/login");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'inscription. Veuillez vérifier les données saisies.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <button onClick={() => router.back()} className="mb-8 text-muted-foreground flex items-center gap-2" disabled={isLoading}>
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Créer un compte</h1>
          <p className="text-muted-foreground">Rejoignez l&apos;élite du covoiturage</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-4 rounded-xl mb-6 text-center">
            {errorMsg}
          </div>
        )}

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
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email (Optionnel)</label>
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
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                S&apos;inscrire
                <UserPlus size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
