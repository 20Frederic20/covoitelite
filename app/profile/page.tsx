"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { User, Star, Briefcase, LogOut, Shield, ChevronRight, History, Wallet } from "lucide-react";
import { motion } from "motion/react";

export default function ProfilePage() {
  const { user, setUser, rides, bookings } = useStore();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

  const userRides = rides.filter(r => r.driverId === user.id);
  const userBookings = bookings.filter(b => b.passengerId === user.id);

  return (
    <AppLayout>
      <div className="space-y-8 pb-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-4">
          <div className="relative">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-4xl font-bold text-primary border-4 border-zinc-900">
              {user.name.charAt(0)}
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-black p-1.5 rounded-full border-4 border-black">
              <Shield size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
          <div className="flex items-center gap-1 text-zinc-400 mt-1">
            <Star size={16} className="text-primary fill-primary" />
            <span className="font-bold text-white">{user.rating.toFixed(1)}</span>
            <span className="text-xs ml-1">({user.tripsCount} trajets)</span>
          </div>
          <div className="mt-4 px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-500">
            {user.role === "driver" ? "Conducteur Élite" : "Passager Élite"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-primary">{userRides.length}</p>
            <p className="text-xs text-zinc-500">Courses publiées</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-primary">{userBookings.length}</p>
            <p className="text-xs text-zinc-500">Réservations</p>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">Paramètres</h3>
          
          <div className="grid md:grid-cols-2 gap-2">
            <MenuButton icon={Wallet} label="Portefeuille" sub="Gérer vos gains et paiements" />
            <MenuButton icon={History} label="Historique" sub="Tous vos trajets passés" />
            <MenuButton icon={Shield} label="Sécurité" sub="Vérification du compte" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-900 transition-colors text-red-500"
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
            <p className="text-xs text-zinc-400 mt-1">
              Vous avez une commission impayée depuis {user.debtDays} jours. 
              {user.debtDays > 7 ? " Votre compte est bloqué." : " Payez avant 7 jours pour éviter le blocage."}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function MenuButton({ icon: Icon, label, sub }: { icon: any, label: string, sub: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-900 transition-colors group">
      <div className="bg-zinc-800 p-2 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
        <Icon size={20} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold">{label}</p>
        <p className="text-xs text-zinc-500">{sub}</p>
      </div>
      <ChevronRight size={18} className="text-zinc-700" />
    </button>
  );
}
