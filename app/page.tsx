"use client";

import AppLayout from "@/components/AppLayout";
import LandingPage from "@/components/LandingPage";
import { useStore } from "@/store/useStore";
import { Search, MapPin, Calendar, Users, Star, ArrowRight, PlusCircle, Briefcase, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const { rides, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    return <LandingPage />;
  }

  const filteredRides = rides.filter(ride => 
    ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ride.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Bonjour, {user?.name} 👋</h2>
          <p className="text-zinc-400">Où allez-vous aujourd&apos;hui ?</p>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Rechercher une destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/create-ride" className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <PlusCircle className="text-primary" size={24} />
            </div>
            <h3 className="font-bold">Publier</h3>
            <p className="text-xs text-zinc-500">Partagez votre trajet</p>
          </Link>
          <Link href="/search" className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <Search className="text-primary" size={24} />
            </div>
            <h3 className="font-bold">Rechercher</h3>
            <p className="text-xs text-zinc-500">Trouvez un trajet</p>
          </Link>
          <Link href="/my-bookings" className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <Briefcase className="text-primary" size={24} />
            </div>
            <h3 className="font-bold">Mes Trajets</h3>
            <p className="text-xs text-zinc-500">Gérer vos réservations</p>
          </Link>
          <Link href="/profile" className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <User size={24} className="text-primary" />
            </div>
            <h3 className="font-bold">Profil</h3>
            <p className="text-xs text-zinc-500">Gérer votre compte</p>
          </Link>
        </div>

        {/* Available Rides */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Trajets disponibles</h3>
            <Link href="/search" className="text-primary text-sm font-medium">Voir tout</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))
            ) : (
              <div className="col-span-full bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-zinc-500">Aucun trajet disponible pour le moment.</p>
                <Link href="/create-ride" className="text-primary mt-2 inline-block font-medium">
                  Soyez le premier à publier !
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function RideCard({ ride }: { ride: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
    >
      <Link href={`/ride/${ride.id}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-primary font-bold">
              {ride.driverName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-sm">{ride.driverName}</h4>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Star size={12} className="text-primary fill-primary" />
                <span>{ride.driverRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-primary font-bold text-lg">{ride.price} FCFA</span>
            <p className="text-[10px] text-zinc-500">par place</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-0.5 h-6 bg-zinc-800"></div>
            <div className="w-2 h-2 rounded-full border border-primary"></div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{ride.from}</span>
              <span className="text-xs text-zinc-500">{ride.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{ride.to}</span>
              <span className="text-xs text-zinc-500">Aujourd&apos;hui</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{ride.seats} places</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>{ride.vehicle}</span>
            </div>
          </div>
          <ArrowRight size={18} className="text-primary" />
        </div>
      </Link>
    </motion.div>
  );
}

