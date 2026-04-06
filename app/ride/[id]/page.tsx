"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar, Clock, Users, Star, ArrowLeft, Shield, Car, CheckCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function RideDetailsPage() {
  const { id } = useParams();
  const { rides, user, bookRide } = useStore();
  const router = useRouter();
  const ride = useMemo(() => rides.find(r => r.id === id), [id, rides]);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!ride) return null;

  const handleBooking = () => {
    if (!user) return;
    setIsBooking(true);
    
    // Simulate API delay
    setTimeout(() => {
      bookRide(ride.id, user.id, seatsToBook);
      setIsBooking(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/my-bookings");
      }, 2000);
    }, 1500);
  };

  const totalPrice = ride.price * seatsToBook;

  return (
    <AppLayout>
      <div className="pb-20">
        <button onClick={() => router.back()} className="mb-6 text-zinc-500 flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        {/* Driver Info & Trip Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Driver Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary">
                  {ride.driverName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{ride.driverName}</h2>
                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                    <Star size={14} className="text-primary fill-primary" />
                    <span className="font-bold text-white">{ride.driverRating.toFixed(1)}</span>
                    <span className="text-xs ml-1">• Conducteur vérifié</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Shield size={24} className="text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <Car size={20} className="text-zinc-500" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Véhicule</p>
                  <p className="text-sm font-bold">{ride.vehicle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users size={20} className="text-zinc-500" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Places</p>
                  <p className="text-sm font-bold">{ride.seats} restantes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Détails du trajet</h3>
            
            <div className="relative pl-8 space-y-10">
              {/* Vertical Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-zinc-800"></div>
              
              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 bg-zinc-900 border-2 border-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase">Départ</p>
                  <p className="text-lg font-bold">{ride.from}</p>
                  <p className="text-sm text-zinc-400">{ride.time}, {ride.date}</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 bg-zinc-900 border-2 border-zinc-700 rounded-full flex items-center justify-center">
                  <MapPin size={14} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase">Arrivée</p>
                  <p className="text-lg font-bold">{ride.to}</p>
                  <p className="text-sm text-zinc-400">Arrivée estimée: +2h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Nombre de places</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                  className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-6 text-center">{seatsToBook}</span>
                <button
                  onClick={() => setSeatsToBook(Math.min(ride.seats, seatsToBook + 1))}
                  className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Total</p>
              <p className="text-3xl font-bold text-primary">{totalPrice} <span className="text-sm">FCFA</span></p>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={isBooking || ride.seats === 0}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              ride.seats === 0 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-primary text-black hover:bg-yellow-500 shadow-lg shadow-primary/20"
            }`}
          >
            {isBooking ? (
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : ride.seats === 0 ? (
              "Complet"
            ) : (
              <>
                <CreditCard size={22} />
                Réserver maintenant
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-zinc-500 mt-4 uppercase tracking-widest">
            Paiement sécurisé par CovoitElite
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center max-w-xs w-full">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Réservation confirmée !</h2>
              <p className="text-zinc-400">Votre place a été réservée avec succès. Retrouvez les détails dans vos trajets.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
