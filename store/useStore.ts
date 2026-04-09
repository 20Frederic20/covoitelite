import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  seats: number; // Total capacity
  vehicle: string;
  status: "available" | "full" | "completed";
}

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  seatsReserved: number;
  totalPrice: number;
  commission: number;
  date: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface AppState {
  user: User | null;
  rides: Ride[];
  bookings: Booking[];
  setUser: (user: User | null) => void;
  addRide: (ride: Ride) => void;
  bookRide: (rideId: string, passenger: { id: string; name: string; phone: string }, seats: number) => void;
  confirmBooking: (bookingId: string) => void;
  unconfirmBooking: (bookingId: string) => void;
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
      bookRide: (rideId, passenger, seats) =>
        set((state) => {
          const ride = state.rides.find((r) => r.id === rideId);
          if (!ride) return state;

          // Check if total reservations (pending + confirmed) exceed seats * 3
          const rideBookings = state.bookings.filter(b => b.rideId === rideId && b.status !== "cancelled");
          const currentTotalReserved = rideBookings.reduce((acc, b) => acc + b.seatsReserved, 0);
          
          if (currentTotalReserved + seats > ride.seats * 3) return state;

          const newBooking: Booking = {
            id: Math.random().toString(36).substr(2, 9),
            rideId,
            passengerId: passenger.id,
            passengerName: passenger.name,
            passengerPhone: passenger.phone,
            seatsReserved: seats,
            totalPrice: ride.price * seats,
            commission: ride.price * seats * 0.1,
            date: new Date().toISOString(),
            status: "pending",
          };

          return {
            bookings: [newBooking, ...state.bookings],
          };
        }),
      confirmBooking: (bookingId) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking || booking.status !== "pending") return state;

          const ride = state.rides.find((r) => r.id === booking.rideId);
          if (!ride) return state;

          // Check if confirmed seats exceed capacity
          const confirmedSeats = state.bookings
            .filter(b => b.rideId === ride.id && b.status === "confirmed")
            .reduce((acc, b) => acc + b.seatsReserved, 0);

          if (confirmedSeats + booking.seatsReserved > ride.seats) return state;

          const newConfirmedTotal = confirmedSeats + booking.seatsReserved;

          return {
            bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: "confirmed" } : b),
            rides: state.rides.map(r => r.id === ride.id ? { ...r, status: newConfirmedTotal === r.seats ? "full" : "available" } : r)
          };
        }),
      unconfirmBooking: (bookingId) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking || booking.status !== "confirmed") return state;

          return {
            bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: "pending" } : b),
            rides: state.rides.map(r => r.id === booking.rideId ? { ...r, status: "available" } : r)
          };
        }),
      cancelBooking: (bookingId) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking) return state;
          
          const wasConfirmed = booking.status === "confirmed";

          return {
            bookings: state.bookings.filter((b) => b.id !== bookingId),
            rides: state.rides.map((r) =>
              r.id === booking.rideId && wasConfirmed ? { ...r, status: "available" } : r
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
