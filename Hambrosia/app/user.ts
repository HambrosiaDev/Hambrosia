// store/user.ts
import { create } from "zustand";

type Role = "CLIENTE" | "RESTAURANTE" | null;

export const useUserStore = create<{
  role: Role;
  setRole: (role: Role) => void;
}>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
}));
