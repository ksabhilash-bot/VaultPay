"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/zustandStore/userStore";

import BalanceCard from "@/components/userComponent/BalanceCard";
import AddMoney from "@/components/userComponent/AddMoney";
import SendMoney from "@/components/userComponent/sendMoney";
import Transactions from "@/components/userComponent/Transactions";
import Logout from "@/components/userComponent/logout";
import { toast } from "sonner";

export default function UserDashboard() {
  const router = useRouter();
  const { user, balance } = useUserStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    // ❌ no user → go login
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // ❌ user not approved → go login
    if (!user.isApproved) {
      toast.error(
        "Your account is pending approval. Please wait for admin approval.",
      );
      router.replace("/auth/login");
    }
  }, [hasMounted, user, router, balance]);

  // Consistent skeleton shown on both server AND first client paint
  // — no mismatch, no flash
  if (!hasMounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
        <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" />
        <div className="max-w-5xl mx-auto px-6 py-5 space-y-4">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"
              />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"
              />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2V3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v1h2V3a1 1 0 0 0-1-1zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            VaultPay
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
            {user.name?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">
            {user.name}
          </span>
          <Logout />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-5">
        <p className="text-xs text-gray-400 mb-4">
          Good to see you, {user.name} — here's your account overview
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <BalanceCard user={user} />
          <AddMoney />
          <SendMoney />
        </div>

        <Transactions />
      </div>
    </div>
  );
}
