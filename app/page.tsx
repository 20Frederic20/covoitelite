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
          <p className="text-muted-foreground">Où allez-vous aujourd&apos;hui ?</p>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Rechercher une destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/create-ride" className="bg-card p-4 rounded-2xl border border-border hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <PlusCircle className="text-primary" size={24} />
            </div>
            <h3 className="font-bold">Publier</h3>
            <p className="text-xs text-muted-foreground">Partagez votre trajet</p>
          </Link>
          <Link href="/search" className="bg-card p-4 rounded-2xl border border-border hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <Search className="text-primary" size={24} />
            </div>
            <h3 className="font-bold">Rechercher</h3>
            <p className="text-xs text-muted-foreground">Trouvez un trajet</p>
          </Link>
          <Link href="/my-bookings" className="bg-card p-4 rounded-2xl border border-border hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <Briefcase className="text-primary" size={24} />
            </div>
            <h3 className="font-bold">Mes Trajets</h3>
            <p className="text-xs text-muted-foreground">Gérer vos réservations</p>
          </Link>
          <Link href="/profile" className="bg-card p-4 rounded-2xl border border-border hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-3">
              <User size={24} className="text-primary" />
            </div>
            <h3 className="font-bold">Profil</h3>
            <p className="text-xs text-muted-foreground">Gérer votre compte</p>
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
              <div className="col-span-full bg-card/50 border border-dashed border-border rounded-2xl p-8 text-center">
                <p className="text-muted-foreground">Aucun trajet disponible pour le moment.</p>
                <Link href="/create-ride" className="text-primary mt-2 inline-block font-medium">
                  Soyez le premier à publier !
                </Link>
              </div>
            )}
          </div>
        </section>
        {/* Help Section */}
        <section className="bg-card border border-border rounded-2xl p-6 text-center">
          <h3 className="font-bold mb-2">Besoin d&apos;aide ?</h3>
          <p className="text-sm text-muted-foreground mb-4">Un problème avec un trajet ou une question ? Notre équipe est là pour vous.</p>
          <a 
            href="mailto:apprentissagethough@gmail.com" 
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            apprentissagethough@gmail.com
          </a>
        </section>
      </div>
    </AppLayout>
  );
}

function RideCard({ ride }: { ride: any }) {
  const { bookings } = useStore();
  const confirmedSeats = bookings
    .filter(b => b.rideId === ride.id && b.status === "confirmed")
    .reduce((acc, b) => acc + b.seatsReserved, 0);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <Link href={`/ride/${ride.id}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-primary font-bold">
              {ride.driverName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-sm">{ride.driverName}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star size={12} className="text-primary fill-primary" />
                <span>{ride.driverRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-primary font-bold text-lg">{ride.price} FCFA</span>
            <p className="text-[10px] text-muted-foreground">par place</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-0.5 h-6 bg-border"></div>
            <div className="w-2 h-2 rounded-full border border-primary"></div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{ride.from}</span>
              <span className="text-xs text-muted-foreground">{ride.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{ride.to}</span>
              <span className="text-xs text-muted-foreground">Aujourd&apos;hui</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{ride.seats - confirmedSeats} / {ride.seats} places</span>
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

