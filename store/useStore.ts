import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "driver" | "passenger" | "admin";
  rating: number;
  tripsCount: number;
  debtDays: number; // Simulation for blocking
  totalDebt?: number;
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

interface AppState {
  user: User | null;
  users: User[]; // All users for admin
  rides: Ride[];
  bookings: Booking[];
  notifications: Notification[];
  setUser: (user: User | null) => void;
  updateUserDebt: (userId: string, amount: number, days: number) => void;
  resetUserDebt: (userId: string) => void;
  addRide: (ride: Ride) => void;
  bookRide: (rideId: string, passenger: { id: string; name: string; phone: string }, seats: number) => void;
  confirmBooking: (bookingId: string) => void;
  unconfirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  deleteRide: (rideId: string) => void;
  completeRide: (rideId: string) => void;
  rateDriver: (driverId: string, rating: number) => void;
  addNotification: (userId: string, title: string, message: string, type: Notification["type"]) => void;
  markNotificationRead: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      users: [
        {
          id: "driver-1",
          name: "Koffi Mensah",
          email: "koffi@example.com",
          phone: "+229 90 00 00 01",
          role: "driver",
          rating: 4.9,
          tripsCount: 45,
          debtDays: 2,
          totalDebt: 1400,
        },
        {
          id: "driver-2",
          name: "Amina Bio",
          email: "amina@example.com",
          phone: "+229 90 00 00 02",
          role: "driver",
          rating: 4.7,
          tripsCount: 28,
          debtDays: 8, // Blocked
          totalDebt: 3500,
        },
        {
          id: "admin-1",
          name: "Admin CovoitElite",
          email: "admin@covoitelite.com",
          phone: "+229 99 99 99 99",
          role: "admin",
          rating: 5.0,
          tripsCount: 0,
          debtDays: 0,
        },
        {
          id: "passenger-1",
          name: "Sèna Houédanou",
          email: "sena@example.com",
          phone: "+229 95 00 00 10",
          role: "passenger",
          rating: 4.5,
          tripsCount: 5,
          debtDays: 0,
        },
        {
          id: "driver-3",
          name: "Saliou Gado",
          email: "saliou@example.com",
          phone: "+229 96 00 00 20",
          role: "driver",
          rating: 4.2,
          tripsCount: 12,
          debtDays: 0,
          totalDebt: 0,
        }
      ],
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
      notifications: [],
      setUser: (user) => set({ user }),
      updateUserDebt: (userId, amount, days) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, totalDebt: (u.totalDebt || 0) + amount, debtDays: days } : u
          ),
        })),
      resetUserDebt: (userId) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, totalDebt: 0, debtDays: 0 } : u
          ),
        })),
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
      addNotification: (userId, title, message, type) =>
        set((state) => ({
          notifications: [
            {
              id: Math.random().toString(36).substr(2, 9),
              userId,
              title,
              message,
              date: new Date().toISOString(),
              read: false,
              type,
            },
            ...state.notifications,
          ],
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      cancelBooking: (bookingId) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking) return state;
          
          const ride = state.rides.find((r) => r.id === booking.rideId);
          if (!ride) return state;

          const wasConfirmed = booking.status === "confirmed";

          // Notify driver
          const notification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            userId: ride.driverId,
            title: "Réservation annulée",
            message: `${booking.passengerName} a annulé sa réservation pour le trajet ${ride.from} → ${ride.to}.`,
            date: new Date().toISOString(),
            read: false,
            type: "warning",
          };

          return {
            bookings: state.bookings.filter((b) => b.id !== bookingId),
            rides: state.rides.map((r) =>
              r.id === booking.rideId && wasConfirmed ? { ...r, status: "available" } : r
            ),
            notifications: [notification, ...state.notifications],
          };
        }),
      deleteRide: (rideId) =>
        set((state) => ({
          rides: state.rides.filter((r) => r.id !== rideId),
          bookings: state.bookings.filter((b) => b.rideId !== rideId),
        })),
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
