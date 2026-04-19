"use client";

import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import useUserStore from "@/zustandStore/userStore";
import { Button } from "../ui/button";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API;

const Logout = () => {
  const router = useRouter();
  const { Userlogout } = useUserStore();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${API}/user/logoutuser`,
        {},
        {
          withCredentials: true, // ✅ important for cookies
        },
      );

      if (res.data.success) {
        Userlogout();
        toast.success("Logged out successfully");
        router.push("/auth/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out");
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default Logout;
