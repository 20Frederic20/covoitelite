"use client";

import AppLayout from "@/components/AppLayout";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const formatPrice = (value: number) =>
  `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;

export default function CreateRidePage() {
  const { user, addRide } = useStore();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    price: "",
    seats: "3",
    vehicle: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (user.debtDays > 7) {
      alert("Votre compte est bloqué en raison d'une dette impayée depuis plus de 7 jours.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await addRide({
        from: formData.from,
        to: formData.to,
        date: formData.date,
        time: formData.time,
        price: parseInt(formData.price),
        seats: parseInt(formData.seats),
        vehicle: formData.vehicle,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Impossible de publier le trajet. Veuillez vérifier vos données.");
    } finally {
      setIsLoading(false);
    }
  };

  const priceValue = formData.price ? parseInt(formData.price) : 0;
  const commission = Number.isNaN(priceValue) ? 0 : priceValue * 0.1;
  const net = Number.isNaN(priceValue) ? 0 : priceValue * 0.9;

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm -ml-3 mb-4 text-slate"
        >
          <ArrowLeft size={16} className="shrink-0" />
          Retour
        </button>

        <motion.header {...rise()}>
          <p className="overline">Conducteur</p>
          <h1 className="mt-2 text-display text-ink">Publier un trajet</h1>
          <p className="mt-3 max-w-lg text-lead text-graphite">
            Annoncez votre itinéraire, vos horaires et votre prix par place. Les passagers
            réservent, vous confirmez.
          </p>
        </motion.header>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-4 rounded-xl mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="relative">
              <label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">Départ</label>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <input
                  type="text"
                  required
                  placeholder="Ville de départ"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-foreground w-full p-0"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label htmlFor="from" className="field-label">
                    Départ
                  </label>
                  <input
                    id="from"
                    type="text"
                    required
                    placeholder="Ville de départ"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="to" className="field-label">
                    Destination
                  </label>
                  <input
                    id="to"
                    type="text"
                    required
                    placeholder="Ville d'arrivée"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="field"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="field-label">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="time" className="field-label">
                  Heure de départ
                </label>
                <input
                  id="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="field"
                />
              </div>
            </div>
          </motion.section>

          {/* Véhicule et places */}
          <motion.section {...rise(0.1)} className="card p-5 sm:p-6">
            <h2 className="text-title text-ink">Véhicule et places</h2>
            <p className="mt-1 text-sm text-slate">
              Combien de passagers pouvez-vous prendre, et à quel prix ?
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vehicle" className="field-label">
                  Véhicule
                </label>
                <input
                  id="vehicle"
                  type="text"
                  required
                  placeholder="Ex. Toyota Corolla"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="price" className="field-label">
                  Prix par place (FCFA)
                </label>
                <input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  required
                  placeholder="Ex. 1 500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="field"
                />
              </div>
            </div>

            <div className="mt-5">
              <span className="field-label">Places disponibles</span>
              <div className="flex items-center justify-between gap-4 rounded-[12px] border border-line bg-surface-alt px-4 py-3">
                <p className="min-w-0 truncate text-sm font-semibold text-slate">
                  {formData.seats} place{parseInt(formData.seats) > 1 ? "s" : ""} à bord
                </p>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    aria-label="Retirer une place"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        seats: Math.max(1, parseInt(formData.seats) - 1).toString(),
                      })
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center text-title tabular-nums text-ink">
                    {formData.seats}
                  </span>
                  <button
                    type="button"
                    aria-label="Ajouter une place"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        seats: Math.min(8, parseInt(formData.seats) + 1).toString(),
                      })
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Récapitulatif */}
          <motion.section {...rise(0.14)} className="card-flat overflow-hidden">
            <p className="border-b border-line bg-surface-alt px-5 py-3.5 text-sm font-bold text-ink">
              Ce que vous gardez, par place
            </p>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="min-w-0 text-sm font-semibold text-slate">
                Commission CovoitElite (10 %)
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
                − {formatPrice(commission)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line bg-brand-soft px-5 py-4">
              <span className="min-w-0 text-sm font-bold text-ink">Vous recevrez</span>
              <span className="shrink-0 text-title tabular-nums text-ink">{formatPrice(net)}</span>
            </div>
          </motion.section>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:bg-yellow-500 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Publier le trajet"
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-night/60 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="card w-full max-w-sm p-7 text-center shadow-lift"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
                <Check size={26} strokeWidth={3} />
              </span>
              <h2 className="mt-5 text-title text-ink">Trajet publié</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Votre trajet est visible par les passagers. Vous recevrez leurs demandes de
                réservation.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
