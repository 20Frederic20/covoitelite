"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogIn, UserPlus, Phone } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const { setUser } = useStore();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    if (otp === "1234") {
      // Mock user
      setUser({
        id: "user-1",
        name: "Jean Dupont",
        email: email,
        role: "passenger",
        rating: 4.8,
        tripsCount: 12,
        debtDays: 0,
      });
      router.push("/");
    } else {
      alert("Code OTP invalide (utilisez 1234)");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">CovoitElite</h1>
          <p className="text-zinc-400">L&apos;excellence du covoiturage</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email ou Téléphone</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Code OTP (Simulation: 1234)</label>
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-primary transition-colors"
                placeholder="0000"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
          >
            {step === 1 ? "Continuer" : "Se connecter"}
            <LogIn size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
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
