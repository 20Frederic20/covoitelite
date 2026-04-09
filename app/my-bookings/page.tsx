"use client";

import AppLayout from "@/components/AppLayout";
import { useStore, Booking, Ride } from "@/store/useStore";
import { useState } from "react";
import { Briefcase, Calendar, MapPin, Clock, Star, ChevronRight, XCircle, CheckCircle2, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MyBookingsPage() {
  const { bookings, rides, user, cancelBooking, confirmBooking, unconfirmBooking } = useStore();
  const [activeTab, setActiveTab] = useState<"bookings" | "rides">("bookings");
  const [managingRideId, setManagingRideId] = useState<string | null>(null);

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
              activeTab === "rides" ? "bg-zinc-900 text-primary shadow-lg" : "text-zinc-500"
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
                <MyRideCard 
                  key={ride.id} 
                  ride={ride} 
                  bookings={bookings.filter(b => b.rideId === ride.id)}
                  isManaging={managingRideId === ride.id}
                  onManage={() => setManagingRideId(managingRideId === ride.id ? null : ride.id)}
                  onConfirm={confirmBooking}
                  onUnconfirm={unconfirmBooking}
                />
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

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500"
  };

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé"
  };

  const canCancel = () => {
    if (booking.status === "cancelled") return false;
    
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    const diffInHours = (rideDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return diffInHours > 8;
  };

  const isTooLate = () => {
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    const now = new Date();
    return now > rideDateTime;
  };

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
        <div className={`${statusColors[booking.status]} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
          {statusLabels[booking.status]}
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
        {canCancel() ? (
          <button 
            onClick={() => {
              if (confirm("Voulez-vous vraiment annuler cette réservation ?")) {
                onCancel();
              }
            }}
            className="text-red-500 text-xs font-bold flex items-center gap-1 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors"
          >
            <XCircle size={14} />
            Annuler
          </button>
        ) : booking.status !== "cancelled" && !isTooLate() ? (
          <span className="text-zinc-500 text-[10px] font-medium italic">Annulation impossible (-8h)</span>
        ) : null}
      </div>
    </motion.div>
  );
}

function MyRideCard({ 
  ride, 
  bookings, 
  isManaging, 
  onManage, 
  onConfirm, 
  onUnconfirm 
}: { 
  ride: Ride; 
  bookings: Booking[]; 
  isManaging: boolean;
  onManage: () => void;
  onConfirm: (id: string) => void;
  onUnconfirm: (id: string) => void;
}) {
  const confirmedCount = bookings.filter(b => b.status === "confirmed").reduce((acc, b) => acc + b.seatsReserved, 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-5 transition-all ${isManaging ? "col-span-full md:col-span-2 lg:col-span-3" : ""}`}>
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
            <span>{confirmedCount} / {ride.seats} places confirmées</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Clock size={14} />
              <span>{pendingCount} en attente</span>
            </div>
          )}
        </div>
        <button 
          onClick={onManage}
          className={`text-xs font-bold flex items-center gap-1 ${isManaging ? "text-white" : "text-primary"}`}
        >
          {isManaging ? "Fermer" : "Gérer"}
          <ChevronRight size={14} className={isManaging ? "rotate-90" : ""} />
        </button>
      </div>

      <AnimatePresence>
        {isManaging && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-6 border-t border-zinc-800 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Réservations ({bookings.length})</h4>
              
              {bookings.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-black/40 border border-zinc-800 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-sm">{booking.passengerName}</p>
                          <p className="text-xs text-primary font-medium">{booking.passengerPhone}</p>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          booking.status === "confirmed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {booking.status === "confirmed" ? "Confirmé" : "En attente"}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-zinc-500">{booking.seatsReserved} place(s)</p>
                        <div className="flex gap-2">
                          {booking.status === "pending" ? (
                            <button 
                              onClick={() => onConfirm(booking.id)}
                              disabled={confirmedCount + booking.seatsReserved > ride.seats}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                confirmedCount + booking.seatsReserved > ride.seats
                                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                  : "bg-primary text-black hover:bg-yellow-500"
                              }`}
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button 
                              onClick={() => onUnconfirm(booking.id)}
                              className="px-3 py-1.5 bg-zinc-800 text-white rounded-lg text-[10px] font-bold hover:bg-zinc-700 transition-all"
                            >
                              Annuler confirmation
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">Aucune réservation pour le moment.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
