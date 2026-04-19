import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,

      setAdmin: (adminData) => set({ admin: adminData.data }),

      Adminlogout: () => set({ admin: null }),
    }),
    {
      name: "admin-storage",
    },
  ),
);

export default useAdminStore;
