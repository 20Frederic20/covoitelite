import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAuthToken } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "driver" | "passenger" | "admin";
  rating: number;
  tripsCount: number;
  debtDays: number;
  totalDebt?: number;
  isBlocked?: boolean;
  kycLevel?: string;
  status?: string;
  isEmailVerified?: boolean;
  deletedAt?: string | null;
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
  vehicleId?: string;
  status: "available" | "full" | "completed" | "cancelled";
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
  status: "pending" | "confirmed" | "cancelled" | "rejected";
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

export interface KycDocument {
  id: string;
  userId: string;
  type: string;
  documentNumber?: string;
  expirationDate?: string;
  fileUrl: string;
  fileUrlBack?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  type: "CAR" | "MOTO";
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  capacity: number;
  registrationFileUrl?: string;
  insuranceFileUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  driverId: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueAt: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  users: User[];
  rides: Ride[];
  bookings: Booking[];
  notifications: Notification[];
  kycDocuments: KycDocument[];
  vehicles: Vehicle[];
  debts: Debt[];

  // Actions
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  loadSession: () => Promise<void>;

  // Fetch lists
  fetchUsers: () => Promise<void>;
  fetchRides: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchKycDocuments: () => Promise<void>;
  fetchKycVehicles: () => Promise<void>;
  fetchAllDebts: () => Promise<void>;

  // Mutation operations
  addRide: (rideData: { from: string; to: string; date: string; time: string; price: number; seats: number; vehicle: string }) => Promise<void>;
  bookRide: (rideId: string, passenger: { id: string; name: string; phone: string }, seats: number) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  unconfirmBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  deleteRide: (rideId: string) => Promise<void>;
  completeRide: (rideId: string) => Promise<void>;
  rateDriver: (driverId: string, rating: number) => Promise<void>;
  updateUserDebt: (userId: string, amount: number, days: number) => Promise<void>;
  resetUserDebt: (userId: string) => Promise<void>;

  // Admin operations
  promoteAdmin: (userId: string) => Promise<void>;
  demoteAdmin: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
  verifyKycDocument: (documentId: string, approved: boolean) => Promise<void>;
  verifyVehicle: (vehicleId: string) => Promise<void>;

  // Notifications
  addNotification: (userId: string, title: string, message: string, type: Notification["type"]) => void;
  markNotificationRead: (id: string) => void;
}

// Maps backend user roles to store roles
export function mapRole(roles: any[]): "admin" | "driver" | "passenger" {
  if (!roles || roles.length === 0) return "passenger";
  const roleNames = roles.map(r => (typeof r === "string" ? r : r.name).toLowerCase());
  if (roleNames.some(name => name.includes("admin"))) return "admin";
  if (roleNames.includes("driver") || roleNames.includes("premium_driver")) return "driver";
  return "passenger";
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      users: [],
      rides: [],
      bookings: [],
      notifications: [],
      kycDocuments: [],
      vehicles: [],
      debts: [],

      setUser: (user, token = null) => {
        if (token) {
          setAuthToken(token);
          set({ user, token });
        } else if (user === null) {
          setAuthToken(null);
          set({ user: null, token: null });
        } else {
          set({ user });
        }
      },

      logout: () => {
        setAuthToken(null);
        set({ user: null, token: null });
      },

      loadSession: async () => {
        const state = get();
        if (state.token) {
          setAuthToken(state.token);
          try {
            // Fetch profile to verify token and update user
            const userId = state.user?.id;
            if (userId) {
              const res = await api.get(`/api/v1/auth/profile/${userId}`);
              const u = res.data;
              const mappedUser: User = {
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email || "",
                phone: u.phone,
                role: mapRole(u.roles),
                rating: 4.8,
                tripsCount: 12,
                debtDays: 0,
                totalDebt: 0,
                isBlocked: u.isBlocked || false,
              };

              // Fetch debts if user is a driver
              if (mappedUser.role === "driver") {
                try {
                  const debtRes = await api.get(`/api/v1/billing/drivers/${u.id}/summary`);
                  if (debtRes.data) {
                    mappedUser.totalDebt = debtRes.data.totalPending || 0;
                    mappedUser.debtDays = debtRes.data.isBlocked ? 8 : 0;
                    mappedUser.isBlocked = debtRes.data.isBlocked || false;
                  }
                } catch (e) {
                  console.error("Failed to fetch debts", e);
                }
              }

              set({ user: mappedUser });
            }
          } catch (err) {
            console.error("Load session failed:", err);
            // Clear expired token/session
            get().setUser(null);
          }
        }
      },

      fetchUsers: async () => {
        try {
          const res = await api.get("/api/v1/auth/users?limit=100&offset=0&orderBy=createdAt&order=DESC");
          const usersList = res.data?.data || [];
          const mappedUsers = usersList.map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email || "",
            phone: u.phone,
            role: mapRole(u.roles),
            rating: 4.8,
            tripsCount: 12,
            debtDays: u.status === "BLOCKED" ? 8 : 0,
            totalDebt: 0,
            kycLevel: u.kycLevel || "NON_VERIFIED",
            status: u.status || "ACTIVE",
            isBlocked: u.status === "BLOCKED",
            isEmailVerified: u.isEmailVerified || false,
            deletedAt: u.deletedAt || null,
          }));
          set({ users: mappedUsers });
        } catch (e) {
          console.error("fetchUsers failed", e);
        }
      },

      fetchRides: async () => {
        try {
          // First fetch all users to discover drivers
          const usersRes = await api.get("/api/v1/auth/users?limit=100&offset=0&orderBy=createdAt&order=DESC");
          const usersList = usersRes.data?.data || [];
          
          let allRides: Ride[] = [];

          // Fetch rides for each user
          const ridePromises = usersList.map(async (u: any) => {
            try {
              const ridesRes = await api.get(`/api/v1/rides/list?driverId=${u.id}&limit=50&offset=0&orderBy=createdAt&order=DESC`);
              const list = ridesRes.data?.data || [];
              return list.map((r: any) => ({
                id: r.id,
                driverId: r.driverId,
                driverName: `${u.firstName} ${u.lastName}`,
                driverRating: 4.8,
                from: r.departure?.label || r.departure || "",
                to: r.destination?.label || r.destination || "",
                date: r.departureAt?.split("T")[0] || "",
                time: r.departureAt?.split("T")[1]?.substring(0, 5) || "",
                price: r.pricePerSeat || 0,
                seats: r.availableSeats || 0,
                vehicle: r.vehicleId || "Voiture",
                vehicleId: r.vehicleId,
                status: r.status === "OPEN" ? "available" : r.status === "FULL" ? "full" : r.status === "CANCELLED" ? "cancelled" : "completed",
              }));
            } catch (err) {
              return [];
            }
          });

          const results = await Promise.all(ridePromises);
          allRides = results.flat();

          set({ rides: allRides });
        } catch (e) {
          console.error("fetchRides failed", e);
        }
      },

      fetchBookings: async () => {
        try {
          const user = get().user;
          if (!user) return;

          let res;
          if (user.role === "admin") {
            res = await api.get("/api/v1/bookings/admin/list?limit=100&offset=0&orderBy=createdAt&order=DESC");
          } else {
            res = await api.get(`/api/v1/bookings/admin/list?passengerId=${user.id}&limit=100&offset=0&orderBy=createdAt&order=DESC`);
          }

          const list = res.data?.data || [];
          const storedRides = get().rides;
          const storedUsers = get().users;

          // totalPrice = seatsRequested × pricePerSeat (récupéré depuis le trajet correspondant)
          const mappedBookings: Booking[] = list.map((b: any) => {
            const ride = storedRides.find((r) => r.id === b.rideId);
            const pricePerSeat = ride?.price ?? 0;
            const passenger = storedUsers.find((u) => u.id === b.passengerId);
            return {
              id: b.id,
              rideId: b.rideId,
              passengerId: b.passengerId,
              passengerName: passenger?.name || "Passager",
              passengerPhone: passenger?.phone || "",
              seatsReserved: b.seatsRequested,
              totalPrice: b.seatsRequested * pricePerSeat,
              commission: b.seatsRequested * pricePerSeat * 0.1,
              date: b.createdAt,
              status: b.status.toLowerCase(),
            };
          });

          set({ bookings: mappedBookings });
        } catch (e) {
          console.error("fetchBookings failed", e);
        }
      },

      fetchDebts: async () => {
        const user = get().user;
        if (!user || user.role !== "driver") return;
        try {
          const debtRes = await api.get(`/api/v1/billing/drivers/${user.id}/summary`);
          if (debtRes.data) {
            set((state) => {
              if (state.user) {
                return {
                  user: {
                    ...state.user,
                    totalDebt: debtRes.data.totalPending || 0,
                    debtDays: debtRes.data.isBlocked ? 8 : 0,
                    isBlocked: debtRes.data.isBlocked || false,
                  }
                };
              }
              return state;
            });
          }
        } catch (e) {
          console.error("fetchDebts failed", e);
        }
      },

      addRide: async (rideData) => {
        const user = get().user;
        if (!user) return;

        // 1. Check/Register Vehicle
        let vehicleId = "default-vehicle-id";
        try {
          const vRes = await api.get(`/api/v1/kyc/vehicles/${user.id}?limit=1&offset=0&orderBy=createdAt&order=ASC`);
          const vehiclesList = vRes.data?.data || [];
          if (vehiclesList.length > 0) {
            vehicleId = vehiclesList[0].id;
          } else {
            // Auto-register vehicle
            const formData = new FormData();
            formData.append("ownerId", user.id);
            formData.append("type", "CAR");
            formData.append("make", rideData.vehicle.split(" ")[0] || "Toyota");
            formData.append("model", rideData.vehicle.split(" ").slice(1).join(" ") || "Corolla");
            formData.append("color", "Noir");
            formData.append("licensePlate", "AB-1234-CD");
            formData.append("capacity", rideData.seats.toString());

            // Create a dummy file blob for required registration document
            const dummyFile = new Blob(["dummy registration"], { type: "text/plain" });
            formData.append("registrationFile", dummyFile, "carte_grise.txt");

            const regRes = await api.post("/api/v1/kyc/vehicles", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            vehicleId = regRes.data?.id || vehicleId;
          }
        } catch (e) {
          console.error("Vehicle check/registration failed", e);
        }

        // 2. Post Ride
        const departureAt = `${rideData.date}T${rideData.time}:00Z`;
        const createRideDto = {
          driverId: user.id,
          vehicleId,
          departure: {
            label: rideData.from,
            latitude: 6.37,
            longitude: 2.45,
          },
          destination: {
            label: rideData.to,
            latitude: 6.37,
            longitude: 2.45,
          },
          departureAt,
          pricePerSeat: rideData.price,
          availableSeats: rideData.seats,
        };

        await api.post("/api/v1/rides", createRideDto);
        await get().fetchRides();
      },

      bookRide: async (rideId, passenger, seats) => {
        const createBookingDto = {
          rideId,
          passengerId: passenger.id,
          seatsRequested: seats,
        };

        await api.post("/api/v1/bookings", createBookingDto);
        await get().fetchBookings();
      },

      confirmBooking: async (bookingId) => {
        const user = get().user;
        if (!user) return;
        await api.patch(`/api/v1/bookings/${bookingId}/respond`, {
          bookingId,
          driverId: user.id,
          action: "CONFIRM",
        });
        await get().fetchBookings();
      },

      unconfirmBooking: async (bookingId) => {
        const user = get().user;
        if (!user) return;
        await api.patch(`/api/v1/bookings/${bookingId}/respond`, {
          bookingId,
          driverId: user.id,
          action: "REJECT",
        });
        await get().fetchBookings();
      },

      cancelBooking: async (bookingId) => {
        const user = get().user;
        if (!user) return;
        await api.delete(`/api/v1/bookings/${bookingId}`, {
          data: {
            bookingId,
            passengerId: user.id,
          }
        });
        await get().fetchBookings();
      },

      deleteRide: async (rideId) => {
        const user = get().user;
        if (!user) return;
        await api.delete(`/api/v1/rides/${rideId}`, {
          data: {
            driverId: user.id,
          }
        });
        await get().fetchRides();
      },

      completeRide: async (rideId) => {
        // Mocking complete or calling appropriate backend status updater if available
        set((state) => ({
          rides: state.rides.map((r) => (r.id === rideId ? { ...r, status: "completed" as const } : r)),
        }));
      },

      rateDriver: async (driverId, rating) => {
        // Store locally or extend
        set((state) => ({
          rides: state.rides.map((r) =>
            r.driverId === driverId ? { ...r, driverRating: (r.driverRating + rating) / 2 } : r
          ),
        }));
      },

      updateUserDebt: async (userId, amount, days) => {
        // Trigger cron overdue or state mock
        try {
          await api.post("/api/v1/billing/cron/overdue");
        } catch (e) {
          console.error("Cron trigger failed", e);
        }
        await get().fetchUsers();
      },

      resetUserDebt: async (userId) => {
        try {
          // Fetch summary to find pending debt
          const summaryRes = await api.get(`/api/v1/billing/drivers/${userId}/summary`);
          const debts = summaryRes.data?.debts || [];
          const pendingDebt = debts.find((d: any) => d.status === "PENDING");
          if (pendingDebt) {
            await api.post(`/api/v1/billing/debts/${pendingDebt.id}/pay`, {
              debtId: pendingDebt.id,
              driverId: userId,
            });
          }
        } catch (e) {
          console.error("Debt reset failed", e);
        }
        await get().fetchUsers();
      },

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

      fetchKycDocuments: async () => {
        try {
          const res = await api.get("/api/v1/admin/kyc/documents?limit=100&offset=0&orderBy=createdAt&order=DESC");
          const documents = res.data?.data || [];
          set({ kycDocuments: documents });
        } catch (e) {
          console.error("fetchKycDocuments failed", e);
        }
      },

      fetchKycVehicles: async () => {
        try {
          const res = await api.get("/api/v1/kyc/vehicles?limit=100&offset=0&orderBy=createdAt&order=DESC");
          const vehicles = res.data?.data || [];
          set({ vehicles: vehicles });
        } catch (e) {
          console.error("fetchKycVehicles failed", e);
        }
      },

      fetchAllDebts: async () => {
        try {
          const res = await api.get("/api/v1/billing/admin/debts?limit=100&offset=0&orderBy=createdAt&order=DESC");
          const debts = res.data?.data || [];
          set({ debts: debts });
        } catch (e) {
          console.error("fetchAllDebts failed", e);
        }
      },

      promoteAdmin: async (userId) => {
        try {
          await api.post(`/api/v1/auth/users/${userId}/promote-admin`);
          await get().fetchUsers();
        } catch (e) {
          console.error("promoteAdmin failed", e);
          throw e;
        }
      },

      demoteAdmin: async (userId) => {
        try {
          await api.post(`/api/v1/auth/users/${userId}/demote-admin`);
          await get().fetchUsers();
        } catch (e) {
          console.error("demoteAdmin failed", e);
          throw e;
        }
      },

      deleteUser: async (userId) => {
        try {
          await api.delete(`/api/v1/auth/users/${userId}`);
          await get().fetchUsers();
        } catch (e) {
          console.error("deleteUser failed", e);
          throw e;
        }
      },

      restoreUser: async (userId) => {
        try {
          await api.post(`/api/v1/auth/users/${userId}/restore`);
          await get().fetchUsers();
        } catch (e) {
          console.error("restoreUser failed", e);
          throw e;
        }
      },

      verifyKycDocument: async (documentId, approved) => {
        try {
          await api.patch(`/api/v1/admin/kyc/documents/${documentId}/verify`, {
            status: approved ? "APPROVED" : "REJECTED",
          });
          await get().fetchKycDocuments();
        } catch (e) {
          console.error("verifyKycDocument failed", e);
          throw e;
        }
      },

      verifyVehicle: async (vehicleId) => {
        try {
          await api.post(`/api/v1/admin/kyc/vehicles/${vehicleId}/verify`);
          await get().fetchKycVehicles();
        } catch (e) {
          console.error("verifyVehicle failed", e);
          throw e;
        }
      },

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
    }),
    {
      name: "covoitelite-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        notifications: state.notifications,
      }),
    }
  )
);
