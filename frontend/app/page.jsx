"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4">
        <h1 className="text-xl font-bold tracking-wide">VaultPay</h1>
        <div className="space-x-4">
          <Button
            variant="ghost"
            onClick={() => {
              router.push("/auth/login");
            }}
          >
            Login
          </Button>
          <Button className="bg-white text-black hover:bg-gray-200" onClick={() => router.push("/auth/register")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-20 px-6">
        <h2 className="text-5xl font-extrabold leading-tight max-w-3xl">
          Send, Receive & Manage Money <br />
          <span className="text-blue-400">Instantly & Securely</span>
        </h2>

        <p className="mt-6 text-gray-300 max-w-xl">
          VaultPay is your modern digital wallet. Add money, transfer funds, and
          track transactions with ease — all in one place.
        </p>

        <div className="mt-8 flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-2">
            Start Now
          </Button>
          <Button variant="outline" className="border-gray-500">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 grid md:grid-cols-3 gap-6 px-8">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">💳 Add Money</h3>
          <p className="text-gray-400">
            Easily add funds using UPI, cards, or net banking via Razorpay.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">⚡ Instant Transfer</h3>
          <p className="text-gray-400">
            Send money to other users instantly using email or account number.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">📊 Track History</h3>
          <p className="text-gray-400">
            View all your transactions in a clean and simple interface.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center px-6">
        <h3 className="text-3xl font-bold">
          Ready to take control of your money?
        </h3>
        <Button
          className="mt-6 bg-blue-600 px-8 py-3 hover:bg-blue-700"
          onClick={() => router.push("/auth/register")}
        >
          Create Account
        </Button>
      </section>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-500 text-sm pb-6">
        © {new Date().getFullYear()} VaultPay. All rights reserved.
      </footer>
    </div>
  );
}
