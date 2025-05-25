import { create } from "zustand";

type Role = "CLIENTE" | "RESTAURANTE" | null;

export const useUserStore = create<{
  role: Role;
  cedRuc: string | null;
  ciudad: string | null;
  token?: string | null;
  setCiudad: (ciudad: string) => void;
  setRole: (role: Role) => void;
  setCedRuc: (cedRuc: string) => void;
  setToken?: (token: string | null) => void;
}>((set) => ({
  role: null,
  cedRuc: null,
  ciudad: null,
  setRole: (role) => set({ role }),
  setCedRuc: (cedRuc) => set({ cedRuc }),
  setCiudad: (ciudad) => set({ ciudad }),
  setToken: (token) => set({ token: token || null }),
}));
