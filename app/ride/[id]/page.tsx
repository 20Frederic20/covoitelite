"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar, Clock, Users, Star, ArrowLeft, Shield, Car, CheckCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function RideDetailsPage() {
  const { id } = useParams();
  const { rides, bookings, user, bookRide } = useStore();
  const router = useRouter();
  const ride = useMemo(() => rides.find(r => r.id === id), [id, rides]);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  const rideBookings = useMemo(() => bookings.filter(b => b.rideId === id && b.status !== "cancelled"), [id, bookings]);
  const currentTotalReserved = useMemo(() => rideBookings.reduce((acc, b) => acc + b.seatsReserved, 0), [rideBookings]);
  const confirmedSeats = useMemo(() => rideBookings.filter(b => b.status === "confirmed").reduce((acc, b) => acc + b.seatsReserved, 0), [rideBookings]);

  if (!ride) return null;

  const handleBooking = () => {
    if (!user) return;
    setIsBooking(true);
    
    // Simulate API delay
    setTimeout(() => {
      bookRide(ride.id, { id: user.id, name: user.name, phone: user.phone || "+229 00 00 00 00" }, seatsToBook);
      setIsBooking(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/my-bookings");
      }, 2000);
    }, 1500);
  };

  const totalPrice = ride.price * seatsToBook;
  const isFull = confirmedSeats >= ride.seats;
  const canStillReserve = currentTotalReserved + seatsToBook <= ride.seats * 3;

  return (
    <AppLayout>
      <div className="pb-20">
        <button onClick={() => router.back()} className="mb-6 text-muted-foreground flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        {/* Driver Info & Trip Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Driver Info */}
          <div className="bg-card border border-border rounded-3xl p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-2xl font-bold text-primary">
                  {ride.driverName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{ride.driverName}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star size={14} className="text-primary fill-primary" />
                    <span className="font-bold text-foreground">{ride.driverRating.toFixed(1)}</span>
                    <span className="text-xs ml-1">• Conducteur vérifié</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Shield size={24} className="text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Car size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Véhicule</p>
                  <p className="text-sm font-bold text-foreground">{ride.vehicle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Places disponibles</p>
                  <p className="text-sm font-bold text-foreground">{ride.seats - confirmedSeats} / {ride.seats}</p>
                </div>
              </div>
            </div>
            
            {isFull && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-[10px] text-yellow-500 font-bold uppercase">Note</p>
                <p className="text-xs text-muted-foreground">Ce trajet est complet, mais vous pouvez toujours réserver pour être sur la liste d&apos;attente (jusqu&apos;à {ride.seats * 3} réservations).</p>
              </div>
            )}
          </div>

          {/* Trip Details */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Détails du trajet</h3>
            
            <div className="relative pl-8 space-y-10">
              {/* Vertical Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border"></div>
              
              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 bg-card border-2 border-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase">Départ</p>
                  <p className="text-lg font-bold text-foreground">{ride.from}</p>
                  <p className="text-sm text-muted-foreground">{ride.time}, {ride.date}</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 bg-card border-2 border-border rounded-full flex items-center justify-center">
                  <MapPin size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase">Arrivée</p>
                  <p className="text-lg font-bold text-foreground">{ride.to}</p>
                  <p className="text-sm text-muted-foreground">Arrivée estimée: +2h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Management Section */}
        {user?.id === ride.driverId && (
          <div className="bg-card border border-border rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Gestion du trajet</h3>
              <button 
                onClick={() => setShowBookings(!showBookings)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-yellow-500 transition-colors"
              >
                {showBookings ? "Masquer les détails" : "Voir les réservations"}
              </button>
            </div>

            <AnimatePresence>
              {showBookings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  {rideBookings.length > 0 ? (
                    <div className="grid gap-4">
                      {rideBookings.map((booking) => (
                        <div key={booking.id} className="bg-muted/40 border border-border rounded-2xl p-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm text-foreground">{booking.passengerName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold mt-1">
                              <Users size={10} />
                              <span>{booking.seatsReserved} place(s)</span>
                              <span className="mx-1">•</span>
                              <span className={booking.status === "confirmed" ? "text-green-500" : "text-yellow-500"}>
                                {booking.status === "confirmed" ? "Confirmé" : "En attente"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{booking.totalPrice} FCFA</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Total payé</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                      <p className="text-muted-foreground text-sm italic">Aucune réservation pour le moment.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Booking Section */}
        {user?.id !== ride.driverId && (
          <div className="bg-card border border-border rounded-3xl p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Nombre de places</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                    className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl font-bold text-foreground"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-6 text-center text-foreground">{seatsToBook}</span>
                  <button
                    onClick={() => setSeatsToBook(Math.min(ride.seats * 3 - currentTotalReserved, seatsToBook + 1))}
                    className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl font-bold text-foreground"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Total</p>
                <p className="text-3xl font-bold text-primary">{totalPrice} <span className="text-sm">FCFA</span></p>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={isBooking || !canStillReserve}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                !canStillReserve 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "bg-primary text-primary-foreground hover:bg-yellow-500 shadow-lg shadow-primary/20"
              }`}
            >
              {isBooking ? (
                <div className="w-6 h-6 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : !canStillReserve ? (
                "Complet"
              ) : (
                <>
                  <CreditCard size={22} />
                  {isFull ? "Rejoindre la liste d'attente" : "Réserver maintenant"}
                </>
              )}
            </button>
            
            <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">
              Paiement sécurisé par CovoitElite
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <div className="bg-card border border-border rounded-3xl p-8 text-center max-w-xs w-full">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Demande envoyée !</h2>
              <p className="text-muted-foreground">Votre demande de réservation a été envoyée au conducteur. Il doit maintenant la confirmer.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
