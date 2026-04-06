import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "driver" | "passenger";
  rating: number;
  tripsCount: number;
  debtDays: number; // Simulation for blocking
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  vehicle: string;
  status: "available" | "full" | "completed";
}

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  seatsReserved: number;
  totalPrice: number;
  commission: number;
  date: string;
}

interface AppState {
  user: User | null;
  rides: Ride[];
  bookings: Booking[];
  setUser: (user: User | null) => void;
  addRide: (ride: Ride) => void;
  bookRide: (rideId: string, passengerId: string, seats: number) => void;
  cancelBooking: (bookingId: string) => void;
  completeRide: (rideId: string) => void;
  rateDriver: (driverId: string, rating: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      rides: [
        {
          id: "ride-1",
          driverId: "driver-1",
          driverName: "Koffi Mensah",
          driverRating: 4.9,
          from: "Cotonou",
          to: "Porto-Novo",
          date: "2026-04-07",
          time: "08:30",
          price: 1500,
          seats: 3,
          vehicle: "Toyota Corolla",
          status: "available",
        },
        {
          id: "ride-2",
          driverId: "driver-2",
          driverName: "Amina Bio",
          driverRating: 4.7,
          from: "Abomey-Calavi",
          to: "Cotonou",
          date: "2026-04-07",
          time: "07:15",
          price: 1000,
          seats: 2,
          vehicle: "Hyundai Elantra",
          status: "available",
        },
        {
          id: "ride-3",
          driverId: "driver-3",
          driverName: "Saliou Gado",
          driverRating: 4.5,
          from: "Parakou",
          to: "Cotonou",
          date: "2026-04-08",
          time: "06:00",
          price: 8000,
          seats: 4,
          vehicle: "Nissan Patrol",
          status: "available",
        }
      ],
      bookings: [],
      setUser: (user) => set({ user }),
      addRide: (ride) => set((state) => ({ rides: [ride, ...state.rides] })),
      bookRide: (rideId, passengerId, seats) =>
        set((state) => {
          const ride = state.rides.find((r) => r.id === rideId);
          if (!ride || ride.seats < seats) return state;

          const newBooking: Booking = {
            id: Math.random().toString(36).substr(2, 9),
            rideId,
            passengerId,
            seatsReserved: seats,
            totalPrice: ride.price * seats,
            commission: ride.price * seats * 0.1,
            date: new Date().toISOString(),
          };

          return {
            bookings: [newBooking, ...state.bookings],
            rides: state.rides.map((r) =>
              r.id === rideId ? { ...r, seats: r.seats - seats, status: r.seats - seats === 0 ? "full" : "available" } : r
            ),
          };
        }),
      cancelBooking: (bookingId) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking) return state;
          return {
            bookings: state.bookings.filter((b) => b.id !== bookingId),
            rides: state.rides.map((r) =>
              r.id === booking.rideId ? { ...r, seats: r.seats + booking.seatsReserved, status: "available" } : r
            ),
          };
        }),
      completeRide: (rideId) =>
        set((state) => ({
          rides: state.rides.map((r) => (r.id === rideId ? { ...r, status: "completed" } : r)),
        })),
      rateDriver: (driverId, rating) =>
        set((state) => ({
          // In a real app we'd update the driver's rating in the DB
          // Here we just update the local user if it's them, or mock it
          user: state.user?.id === driverId ? { ...state.user, rating: (state.user.rating + rating) / 2 } : state.user,
          rides: state.rides.map((r) =>
            r.driverId === driverId ? { ...r, driverRating: (r.driverRating + rating) / 2 } : r
          ),
        })),
    }),
    {
      name: "covoitelite-storage",
    }
  )
);
