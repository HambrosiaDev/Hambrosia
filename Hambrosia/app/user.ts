import { create } from "zustand";

type Role = "CLIENTE" | "RESTAURANTE" | null;

export const useUserStore = create<{
  role: Role;
  cedRuc: string | null;
  setRole: (role: Role) => void;
  setCedRuc: (cedRuc: string) => void;
}>((set) => ({
  role: null,
  cedRuc: null,
  setRole: (role) => set({ role }),
  setCedRuc: (cedRuc) => set({ cedRuc }),
}));
