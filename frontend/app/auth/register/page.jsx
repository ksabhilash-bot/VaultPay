"use client";

import { useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useUserStore from "@/zustandStore/userStore";
import useAdminStore from "@/zustandStore/adminStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API;

export default function RegisterPage() {
  const { setUser } = useUserStore();
  const { setAdmin } = useAdminStore();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (role) => {
    try {
      const endpoint =
        role === "admin"
          ? `${API}/admin/createadmin`
          : `${API}/user/signupuser`;

      const res = await axios.post(endpoint, form);

      if (role === "admin") {
        setAdmin(res.data);
        toast.success("Admin registered successfully");
        router.push("/admin/dashboard");
      } else {
        // ❌ DO NOT access res.data.data.isApproved

        toast.success(
          "User registered successfully. Please wait for admin approval.",
        );

        router.push("/auth/login");
      }
    } catch (err) {
      console.log(err.response?.data); // 🔥 debug
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

        <Tabs defaultValue="user">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="user">User</TabsTrigger>
          </TabsList>

          {/* USER REGISTER */}
          <TabsContent value="user">
            <div className="space-y-3">
              <Input name="name" placeholder="Name" onChange={handleChange} />
              <Input name="email" placeholder="Email" onChange={handleChange} />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <Button className="w-full" onClick={() => handleRegister("user")}>
                Register as User
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 hover:underline"
          >
            Login
          </Link>
        </p>
        <p className="text-center text-sm text-slate-400 mt-6">
          Go back to Home Page{" "}
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:underline"
          >
            Click Here
          </Link>
        </p>
      </div>
    </div>
  );
}
