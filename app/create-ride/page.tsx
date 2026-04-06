"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Calendar, Clock, Users, CreditCard, Car, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CreateRidePage() {
  const { user, addRide } = useStore();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    price: "",
    seats: "3",
    vehicle: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (user.debtDays > 7) {
      alert("Votre compte est bloqué en raison d'une dette impayée depuis plus de 7 jours.");
      return;
    }

    const newRide = {
      id: Math.random().toString(36).substr(2, 9),
      driverId: user.id,
      driverName: user.name,
      driverRating: user.rating,
      from: formData.from,
      to: formData.to,
      date: formData.date,
      time: formData.time,
      price: parseInt(formData.price),
      seats: parseInt(formData.seats),
      vehicle: formData.vehicle,
      status: "available" as const,
    };

    addRide(newRide);
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="pb-10">
        <button onClick={() => router.back()} className="mb-6 text-zinc-500 flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">Publier un trajet</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="relative">
              <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Départ</label>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <input
                  type="text"
                  required
                  placeholder="Ville de départ"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-white w-full p-0"
                />
              </div>
            </div>
            <div className="h-px bg-zinc-800"></div>
            <div className="relative">
              <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Destination</label>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <input
                  type="text"
                  required
                  placeholder="Ville d'arrivée"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-white w-full p-0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Date</label>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-zinc-400" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-sm text-white w-full p-0"
                />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Heure</label>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-zinc-400" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-sm text-white w-full p-0"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-zinc-400" />
                <span className="font-medium">Prix par place</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-zinc-800 border-none rounded-lg w-20 text-right p-2 text-primary font-bold"
                />
                <span className="text-xs text-zinc-500">FCFA</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-zinc-400" />
                <span className="font-medium">Places disponibles</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, seats: Math.max(1, parseInt(formData.seats) - 1).toString() })}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="font-bold text-lg">{formData.seats}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, seats: Math.min(8, parseInt(formData.seats) + 1).toString() })}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Car size={20} className="text-zinc-400" />
                <span className="font-medium">Véhicule</span>
              </div>
              <input
                type="text"
                required
                placeholder="Ex: Toyota Camry"
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="bg-zinc-800 border-none rounded-lg w-32 p-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-500">Commission CovoitElite (10%)</span>
              <span className="text-zinc-400">-{formData.price ? (parseInt(formData.price) * 0.1).toFixed(0) : 0} FCFA</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Vous recevrez</span>
              <span className="text-primary">{formData.price ? (parseInt(formData.price) * 0.9).toFixed(0) : 0} FCFA</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-black font-bold py-4 rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-primary/20"
          >
            Publier le trajet
          </button>
        </form>
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
              <h2 className="text-2xl font-bold mb-2">Trajet publié !</h2>
              <p className="text-zinc-400">Votre trajet est maintenant visible par tous les passagers.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
