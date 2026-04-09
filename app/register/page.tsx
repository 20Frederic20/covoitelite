"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const { setUser } = useStore();
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      role,
      rating: 5.0,
      tripsCount: 0,
      debtDays: 0,
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <button onClick={() => router.back()} className="mb-8 text-zinc-500 flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-zinc-400">Rejoignez l&apos;élite du covoiturage</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nom complet</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Téléphone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="+229 00 00 00 00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Vous êtes ?</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("passenger")}
                className={`py-4 rounded-xl border font-bold transition-all ${
                  role === "passenger" ? "bg-primary text-black border-primary" : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}
              >
                Passager
              </button>
              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`py-4 rounded-xl border font-bold transition-all ${
                  role === "driver" ? "bg-primary text-black border-primary" : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}
              >
                Conducteur
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
          >
            S&apos;inscrire
            <UserPlus size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
