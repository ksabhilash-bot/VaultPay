"use client";

import { useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAdminStore from "@/zustandStore/adminStore";
import useUserStore from "@/zustandStore/userStore";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Loader2 } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API;

export default function LoginPage() {
  const { setAdmin } = useAdminStore();
  const { setUser } = useUserStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (role) => {
    setLoading(true);
    try {
      const endpoint =
        role === "admin" ? `${API}/admin/loginadmin` : `${API}/user/loginuser`;

      const res = await axios.post(endpoint, form, {
        withCredentials: true, // important for cookies
      });

      if (role === "admin") {
        setAdmin(res.data);
        toast.success(res.data.message || "Admin logged in successfully");
        router.push("/admin/dashboard");
      } else {
        if (!res.data.data.isApproved) {
          toast.error("Your account is pending approval. Please wait.");
          return;
        }
        setUser(res.data);
        toast.success(res.data.message || "Logged in successfully");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black mb-4">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 p-8">
          <Tabs defaultValue="user">
            <TabsList className="grid grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl h-11">
              <TabsTrigger
                value="user"
                className="rounded-lg flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <User className="w-4 h-4" /> User
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="rounded-lg flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </TabsTrigger>
            </TabsList>

            {/* USER LOGIN */}
            <TabsContent value="user">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200 focus:border-slate-400 bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200 focus:border-slate-400 bg-slate-50"
                  />
                </div>
                <Button
                  className="w-full h-11 rounded-xl bg-black hover:bg-slate-800 text-white font-medium mt-2"
                  onClick={() => handleLogin("user")}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Sign in as User"
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* ADMIN LOGIN */}
            <TabsContent value="admin">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Admin Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200 focus:border-slate-400 bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="h-11 rounded-xl border-slate-200 focus:border-slate-400 bg-slate-50"
                  />
                </div>
                <Button
                  className="w-full h-11 rounded-xl bg-black hover:bg-slate-800 text-white font-medium mt-2"
                  onClick={() => handleLogin("admin")}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Sign in as Admin"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-sm font-medium text-slate-700 hover:underline"
            >
              Register
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
    </div>
  );
}
