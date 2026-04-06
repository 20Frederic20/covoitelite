"use client";

import AppLayout from "@/components/AppLayout";
import { useStore, Booking, Ride } from "@/store/useStore";
import { useState } from "react";
import { Briefcase, Calendar, MapPin, Clock, Star, ChevronRight, XCircle, CheckCircle2, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MyBookingsPage() {
  const { bookings, rides, user, cancelBooking } = useStore();
  const [activeTab, setActiveTab] = useState<"bookings" | "rides">("bookings");

  const userBookings = bookings.filter(b => b.passengerId === user?.id);
  const userRides = rides.filter(r => r.driverId === user?.id);

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        <h1 className="text-2xl font-bold">Mes Trajets</h1>

        {/* Tabs */}
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "bookings" ? "bg-zinc-800 text-primary shadow-lg" : "text-zinc-500"
            }`}
          >
            Réservations
          </button>
          <button
            onClick={() => setActiveTab("rides")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "rides" ? "bg-zinc-800 text-primary shadow-lg" : "text-zinc-500"
            }`}
          >
            Mes Publications
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === "bookings" ? (
            userBookings.length > 0 ? (
              userBookings.map((booking) => {
                const ride = rides.find(r => r.id === booking.rideId);
                return <BookingCard key={booking.id} booking={booking} ride={ride} onCancel={() => cancelBooking(booking.id)} />;
              })
            ) : (
              <div className="col-span-full">
                <EmptyState message="Vous n'avez aucune réservation en cours." />
              </div>
            )
          ) : (
            userRides.length > 0 ? (
              userRides.map((ride) => (
                <MyRideCard key={ride.id} ride={ride} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState message="Vous n'avez publié aucun trajet." />
              </div>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function BookingCard({ booking, ride, onCancel }: { booking: Booking, ride?: Ride, onCancel: () => void }) {
  if (!ride) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-primary font-bold">
            {ride.driverName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm">{ride.driverName}</h4>
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Conducteur</p>
          </div>
        </div>
        <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Confirmé
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-primary" />
          <span className="text-sm font-medium">{ride.from} → {ride.to}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400 text-xs">
          <Calendar size={14} />
          <span>{ride.date} à {ride.time}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400 text-xs">
          <Users size={14} />
          <span>{booking.seatsReserved} place(s) réservée(s)</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
        <div className="text-sm font-bold">
          {booking.totalPrice} FCFA
        </div>
        <button 
          onClick={() => {
            if (confirm("Voulez-vous vraiment annuler cette réservation ?")) {
              onCancel();
            }
          }}
          className="text-red-500 text-xs font-bold flex items-center gap-1"
        >
          <XCircle size={14} />
          Annuler
        </button>
      </div>
    </motion.div>
  );
}

function MyRideCard({ ride }: { ride: Ride }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ride.status === "available" ? "bg-green-500" : "bg-zinc-500"}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {ride.status === "available" ? "En cours" : ride.status === "full" ? "Complet" : "Terminé"}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{ride.price} FCFA</p>
          <p className="text-[10px] text-zinc-500">par place</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm font-bold">{ride.from} → {ride.to}</p>
        <p className="text-xs text-zinc-500">{ride.date} à {ride.time}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{ride.seats} places libres</span>
          </div>
        </div>
        <button className="text-primary text-xs font-bold flex items-center gap-1">
          Gérer
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center">
      <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700">
        <Briefcase size={32} />
      </div>
      <p className="text-zinc-500 text-sm">{message}</p>
    </div>
  );
}
