"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Search, MapPin, Calendar, Clock, Users, Star, ArrowRight, Filter, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function SearchPage() {
  const { rides } = useStore();
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const filteredRides = useMemo(() => {
    return rides.filter(ride => {
      const matchFrom = ride.from.toLowerCase().includes(searchFrom.toLowerCase());
      const matchTo = ride.to.toLowerCase().includes(searchTo.toLowerCase());
      const matchPrice = maxPrice === "" || ride.price <= maxPrice;
      return matchFrom && matchTo && matchPrice && ride.status === "available";
    });
  }, [rides, searchFrom, searchTo, maxPrice]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        <h1 className="text-2xl font-bold">Trouver un trajet</h1>

        {/* Search Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-xl border border-zinc-800">
              <MapPin size={20} className="text-primary" />
              <input
                type="text"
                placeholder="D'où partez-vous ?"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
              />
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-xl border border-zinc-800">
              <MapPin size={20} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Où allez-vous ?"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 flex items-center gap-2 bg-zinc-800/50 p-3 rounded-xl border border-zinc-800">
              <span className="text-xs text-zinc-500 font-bold">PRIX MAX</span>
              <input
                type="number"
                placeholder="FCFA"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-right font-bold text-primary"
              />
            </div>
            <button className="bg-zinc-800 p-3 rounded-xl border border-zinc-800 text-zinc-400">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <p className="text-sm text-zinc-500 font-medium">
              {filteredRides.length} trajet{filteredRides.length > 1 ? "s" : ""} trouvé{filteredRides.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700">
                  <Search size={32} />
                </div>
                <p className="text-zinc-500">Aucun trajet ne correspond à vos critères.</p>
                <button 
                  onClick={() => { setSearchFrom(""); setSearchTo(""); setMaxPrice(""); }}
                  className="text-primary mt-2 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
              <span className="text-xs text-zinc-500">{ride.date}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{ride.seats - confirmedSeats} / {ride.seats} places</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary font-bold text-sm">
            <span>Réserver</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
