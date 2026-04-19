import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      balance: null,

      setBalance: (balance) => set({ balance }),

      setUser: (userData) =>
        set({
          user: userData.data,
          balance: userData.data.balance,
        }),

      Userlogout: () => set({ user: null, balance: null }),
    }),
    {
      name: "user-storage",
    },
  ),
);

export default useUserStore;
