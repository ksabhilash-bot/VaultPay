"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useAdminStore from "@/zustandStore/adminStore";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const API = `${process.env.NEXT_PUBLIC_API}/admin`;

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, Adminlogout } = useAdminStore();
  const [hasMounted, setHasMounted] = useState(false);

  // All users tab state
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Unapproved tab state
  const [unapproved, setUnapproved] = useState([]);
  const [loadingUnapproved, setLoadingUnapproved] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending"
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // userId being actioned

  // ── Hydration guard ──────────────────────────────────────────────────
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !admin) router.push("/auth/login");
  }, [hasMounted, admin, router]);

  // ── Fetch all users (paginated) ──────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API}/alluser?page=${page}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // ── Fetch unapproved users ───────────────────────────────────────────
  const fetchUnapproved = useCallback(async () => {
    setLoadingUnapproved(true);
    try {
      const res = await fetch(`${API}/unapprovedUsers`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUnapproved(data.data);
    } catch (err) {
      console.error("Failed to fetch unapproved users", err);
    } finally {
      setLoadingUnapproved(false);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted || !admin) return;
    fetchUsers(1);
    fetchUnapproved();
  }, [hasMounted, admin, fetchUsers, fetchUnapproved]);

  // ── Approve / Reject ─────────────────────────────────────────────────
  const handleApproval = async (userId, isApproved) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API}/approveUser/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isApproved }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh both lists after action
        await Promise.all([
          fetchUsers(pagination.currentPage),
          fetchUnapproved(),
        ]);
      }
    } catch (err) {
      console.error("Approval action failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtered users for search ────────────────────────────────────────
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUnapproved = unapproved.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Skeleton ─────────────────────────────────────────────────────────
  if (!hasMounted || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
        <div className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" />
        <div className="max-w-6xl mx-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"
              />
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  // ── Pagination page numbers ───────────────────────────────────────────
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??";

  const StatusBadge = ({ isApproved }) => {
    if (isApproved === true)
      return (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
          Approved
        </span>
      );
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
        Pending
      </span>
    );
  };

  const UserRow = ({ user, showActions }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[10px] font-medium text-blue-700 dark:text-blue-300 flex-shrink-0">
            {initials(user.name)}
          </div>
          <span className="text-sm text-gray-900 dark:text-white">
            {user.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
        {user.email}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
        {new Date(user.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3">
        <StatusBadge isApproved={user.isApproved} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {showActions && !user.isApproved && (
            <>
              <button
                onClick={() => handleApproval(user._id, true)}
                disabled={actionLoading === user._id}
                className="text-[11px] px-2.5 py-1 rounded border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-40 transition-colors"
              >
                {actionLoading === user._id ? "..." : "Approve"}
              </button>
              <button
                onClick={() => handleApproval(user._id, false)}
                disabled={actionLoading === user._id}
                className="text-[11px] px-2.5 py-1 rounded border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40 transition-colors"
              >
                {actionLoading === user._id ? "..." : "Reject"}
              </button>
            </>
          )}
          <button
            onClick={() => router.push(`/admin/user/${user._id}`)}
            className="text-[11px] px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-700" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            VaultPay
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[10px] font-medium text-blue-700 dark:text-blue-300">
            {initials(admin.name)}
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">
            {admin.name}
          </span>
          <button
            onClick={() => {
              // clear admin store + redirect
              Adminlogout();
              router.push("/auth/login");
            }}
            className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Total users
            </p>
            <p className="text-xl font-medium text-gray-900 dark:text-white">
              {pagination.totalUsers}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Pending approval
            </p>
            <p className="text-xl font-medium text-amber-600 dark:text-amber-400">
              {unapproved.length}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Current page
            </p>
            <p className="text-xl font-medium text-gray-900 dark:text-white">
              {pagination.currentPage} / {pagination.totalPages}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
              Per page
            </p>
            <p className="text-xl font-medium text-gray-900 dark:text-white">
              10
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 dark:border-gray-800 mb-4">
          {[
            { key: "all", label: "All users" },
            {
              key: "pending",
              label: `Pending approval`,
              count: unapproved.length,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setSearch("");
              }}
              className={`text-xs px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full max-w-sm text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-medium px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                  User
                </th>
                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-medium px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                  Email
                </th>
                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-medium px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                  Joined
                </th>
                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-medium px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                  Status
                </th>
                <th className="text-left text-[10px] uppercase tracking-wide text-gray-400 font-medium px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTab === "all" ? (
                loadingUsers ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <UserRow key={u._id} user={u} showActions={true} />
                  ))
                )
              ) : loadingUnapproved ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUnapproved.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No pending users
                  </td>
                </tr>
              ) : (
                filteredUnapproved.map((u) => (
                  <UserRow key={u._id} user={u} showActions={true} />
                ))
              )}
            </tbody>
          </table>

          {/* Pagination — only shown on "all" tab */}
          {activeTab === "all" && !loadingUsers && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <span className="text-xs text-gray-400">
                Showing {(pagination.currentPage - 1) * 10 + 1}–
                {Math.min(pagination.currentPage * 10, pagination.totalUsers)}{" "}
                of {pagination.totalUsers} users
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.hasPrevPage &&
                        fetchUsers(pagination.currentPage - 1)
                      }
                      className={
                        !pagination.hasPrevPage
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === pagination.currentPage}
                          onClick={() => fetchUsers(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pagination.hasNextPage &&
                        fetchUsers(pagination.currentPage + 1)
                      }
                      className={
                        !pagination.hasNextPage
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
