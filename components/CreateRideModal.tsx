"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { useStore, type CreateRidePayload } from "@/store/useStore";
import type { LocationValue } from "./LocationPicker";

// Leaflet touche à `window` : la carte ne doit jamais être rendue côté serveur.
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[248px] place-items-center rounded-[12px] border border-line bg-surface-alt">
      <Loader2 size={18} className="animate-spin text-muted" />
    </div>
  ),
});

const EMPTY: LocationValue = { label: "", latitude: null, longitude: null };

/**
 * Formulaire monté uniquement quand la modale est ouverte : la remise à zéro
 * des champs vient du démontage, pas d'un effet.
 */
function CreateRideForm({ onClose }: { onClose: () => void }) {
  const { users, vehicles, createAdminRide, fetchUsers, fetchKycVehicles } = useStore();

  const [driverId, setDriverId] = useState("");
  const [vehicleChoice, setVehicleChoice] = useState("");
  const [departure, setDeparture] = useState<LocationValue>(EMPTY);
  const [destination, setDestination] = useState<LocationValue>(EMPTY);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchKycVehicles();
  }, [fetchUsers, fetchKycVehicles]);

  // Un admin peut aussi être conducteur : le rôle mappé ne suffit pas, on retient
  // donc aussi tout utilisateur propriétaire d'au moins un véhicule.
  const driverOptions = useMemo(() => {
    const owners = new Set(vehicles.map((v) => v.ownerId));
    return users
      .filter((u) => !u.deletedAt && (u.role === "driver" || owners.has(u.id)))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [users, vehicles]);

  const driverVehicles = useMemo(
    () => vehicles.filter((v) => v.ownerId === driverId),
    [vehicles, driverId]
  );

  // Le véhicule est dérivé du conducteur : changer de conducteur invalide
  // d'office un choix qui ne lui appartient pas.
  const vehicleId = driverVehicles.some((v) => v.id === vehicleChoice)
    ? vehicleChoice
    : driverVehicles.length === 1
      ? driverVehicles[0].id
      : "";

  const selectedVehicle = driverVehicles.find((v) => v.id === vehicleId);
  const selectedDriver = driverOptions.find((u) => u.id === driverId);

  // Le backend refuse tout conducteur dont le KYC n'est pas DRIVER_VERIFIED,
  // et tout véhicule non validé. On le signale avant l'envoi.
  const driverIsVerified = selectedDriver?.kycLevel === "DRIVER_VERIFIED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!driverId) return setError("Choisissez un conducteur.");
    if (!driverIsVerified)
      return setError(
        "Ce conducteur n'est pas au niveau KYC « conducteur vérifié ». Validez son dossier avant de publier un trajet."
      );
    if (!vehicleId) return setError("Choisissez un véhicule pour ce conducteur.");
    if (selectedVehicle && !selectedVehicle.isVerified)
      return setError("Ce véhicule n'est pas encore validé. Validez-le dans la section KYC.");
    if (departure.latitude === null || departure.longitude === null)
      return setError("Placez le point de départ sur la carte.");
    if (destination.latitude === null || destination.longitude === null)
      return setError("Placez le point d'arrivée sur la carte.");
    if (!departure.label.trim() || !destination.label.trim())
      return setError("Renseignez le libellé du départ et de l'arrivée.");
    if (!date || !time) return setError("Renseignez la date et l'heure de départ.");

    // Même convention que le reste de l'application : l'heure saisie est
    // envoyée telle quelle en UTC, pour que la liste réaffiche la même valeur.
    const departureAt = `${date}T${time}:00Z`;
    if (new Date(departureAt).getTime() <= Date.now())
      return setError("La date de départ doit être dans le futur.");

    const pricePerSeat = Number(price);
    if (!Number.isFinite(pricePerSeat) || pricePerSeat <= 0)
      return setError("Le prix par place doit être supérieur à zéro.");

    const availableSeats = Number(seats);
    if (!Number.isInteger(availableSeats) || availableSeats < 1)
      return setError("Le nombre de places doit être d'au moins 1.");
    if (selectedVehicle && availableSeats > selectedVehicle.capacity)
      return setError(`Ce véhicule n'accepte que ${selectedVehicle.capacity} place(s).`);

    const payload: CreateRidePayload = {
      driverId,
      vehicleId,
      departure: {
        label: departure.label.trim(),
        latitude: departure.latitude,
        longitude: departure.longitude,
      },
      destination: {
        label: destination.label.trim(),
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      departureAt,
      pricePerSeat,
      availableSeats,
    };

    setIsSubmitting(true);
    try {
      await createAdminRide(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "La création du trajet a échoué.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="border-b border-line px-6 pb-4 pt-6">
        <h3 className="text-base font-extrabold text-ink sm:text-lg">Nouveau trajet</h3>
        <p className="mt-1 text-xs text-slate">
          Publiez un trajet pour le compte d&apos;un conducteur enregistré.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-lg bg-danger-soft p-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="driverId" className="overline mb-1 block">
                Conducteur
              </label>
              <select
                id="driverId"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="field"
                required
              >
                <option value="">Sélectionner…</option>
                {driverOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.phone}
                    {u.kycLevel === "DRIVER_VERIFIED" ? "" : " (KYC incomplet)"}
                  </option>
                ))}
              </select>
              {driverOptions.length === 0 && (
                <p className="mt-1 text-[11px] font-semibold text-muted">
                  Aucun conducteur enregistré.
                </p>
              )}
              {selectedDriver && !driverIsVerified && (
                <p className="mt-1 text-[11px] font-semibold text-danger">
                  KYC insuffisant ({selectedDriver.kycLevel || "NON_VERIFIED"}) : le trajet sera
                  refusé.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="vehicleId" className="overline mb-1 block">
                Véhicule
              </label>
              <select
                id="vehicleId"
                value={vehicleId}
                onChange={(e) => setVehicleChoice(e.target.value)}
                className="field"
                disabled={!driverId || driverVehicles.length === 0}
                required
              >
                <option value="">Sélectionner…</option>
                {driverVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} — {v.licensePlate} ({v.capacity} pl.)
                    {v.isVerified ? "" : " — non validé"}
                  </option>
                ))}
              </select>
              {driverId && driverVehicles.length === 0 && (
                <p className="mt-1 text-[11px] font-semibold text-danger">
                  Ce conducteur n&apos;a aucun véhicule enregistré.
                </p>
              )}
              {selectedVehicle && !selectedVehicle.isVerified && (
                <p className="mt-1 text-[11px] font-semibold text-danger">
                  Véhicule non validé : le trajet sera refusé.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <LocationPicker
              title="Départ"
              value={departure}
              onChange={setDeparture}
              color="#1f6feb"
              placeholder="ex: Carrefour Toyota"
            />
            <LocationPicker
              title="Arrivée"
              value={destination}
              onChange={setDestination}
              color="#e5484d"
              placeholder="ex: Godomey"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="date" className="overline mb-1 block">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="overline mb-1 block">
                Heure
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="overline mb-1 block">
                Prix / place (F)
              </label>
              <input
                type="number"
                id="price"
                min={1}
                step={50}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="seats" className="overline mb-1 block">
                Places
              </label>
              <input
                type="number"
                id="seats"
                min={1}
                max={selectedVehicle?.capacity}
                step={1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                placeholder={selectedVehicle ? String(selectedVehicle.capacity) : "3"}
                className="field"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn-ink btn-sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Création…" : "Créer le trajet"}
          </button>
        </div>
      </form>
    </>
  );
}

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRideModal({ isOpen, onClose }: CreateRideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-night/50 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-panel border border-line bg-surface shadow-lift"
          >
            <CreateRideForm onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
