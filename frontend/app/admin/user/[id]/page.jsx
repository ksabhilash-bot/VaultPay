"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAdminStore from "@/zustandStore/adminStore";

const API = `${process.env.NEXT_PUBLIC_API}/admin`;

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { admin } = useAdminStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !admin) router.push("/auth/admin/login");
  }, [hasMounted, admin, router]);

  useEffect(() => {
    if (!hasMounted || !admin || !id) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/user/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setUser(data.data);
        else setError(data.message);
      } catch (err) {
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [hasMounted, admin, id]);

  const handleApproval = async (isApproved) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/approveUser/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isApproved }),
      });
      const data = await res.json();
      if (data.success) {
        if (!isApproved) {
          router.push("/admin/dashboard");
        } else {
          setUser((prev) => ({ ...prev, isApproved: true }));
        }
      }
    } catch (err) {
      console.error("Approval action failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??";

  const fmt = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const fmtAmount = (n) =>
    n != null
      ? `₹${Number(n).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";

  // ── Skeleton ────────────────────────────────────────────────────────
  if (!hasMounted || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
        <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" />
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Navbar ───────────────────────────────────────────────────────────
  const Navbar = () => (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to dashboard
        </button>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-700" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            VaultPay
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Admin
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500">{admin.name}</span>
    </nav>
  );

  // ── Error state ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-4 text-xs px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4 animate-pulse">
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const wallet = user?.wallet;
  const transactions = user?.transactions ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-5 space-y-4">
        {/* ── Profile header card ──────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-lg font-medium text-blue-700 dark:text-blue-300 flex-shrink-0">
                {initials(user.name)}
              </div>
              <div>
                <h1 className="text-base font-medium text-gray-900 dark:text-white">
                  {user.name}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      user.isApproved
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {user.isApproved ? "Approved" : "Pending approval"}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {!user.isApproved && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApproval(true)}
                  disabled={actionLoading}
                  className="text-xs px-3.5 py-1.5 rounded-lg border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-40 transition-colors"
                >
                  {actionLoading ? "Processing..." : "Approve user"}
                </button>
                <button
                  onClick={() => handleApproval(false)}
                  disabled={actionLoading}
                  className="text-xs px-3.5 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40 transition-colors"
                >
                  {actionLoading ? "Processing..." : "Reject & delete"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Info + Wallet row ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-3">
              Account info
            </p>
            <div className="space-y-3">
              {[
                { label: "User ID", value: user._id },
                { label: "Account Number", value: user.accountNumber ?? "—" },
                { label: "Email", value: user.email ?? "—" },
                { label: "Joined", value: fmt(user.createdAt) },
                { label: "Last updated", value: fmt(user.updatedAt) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-4"
                >
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-xs text-gray-900 dark:text-white text-right break-all font-mono">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-3">
              Wallet
            </p>
            {wallet ? (
              <div className="space-y-3">
                {[
                  { label: "Wallet ID", value: wallet._id },
                  { label: "Balance", value: fmtAmount(wallet.balance) },
                  { label: "Currency", value: wallet.currency ?? "INR" },
                  { label: "Created", value: fmt(wallet.createdAt) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-start gap-4"
                  >
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {label}
                    </span>
                    <span
                      className={`text-xs text-right break-all font-mono ${
                        label === "Balance"
                          ? "text-green-700 dark:text-green-400 font-medium"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No wallet found for this user.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
