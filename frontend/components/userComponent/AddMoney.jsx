"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useUserStore from "@/zustandStore/userStore";

const API = process.env.NEXT_PUBLIC_API;

export default function AddMoney() {
  const [amount, setAmount] = useState("");
  const { setBalance } = useUserStore();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleAddMoney = async () => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) return alert("Failed to load Razorpay");

    const { data } = await axios.post(
      `${API}/user/addmoney`,
      { amount },
      { withCredentials: true },
    );

    const { order, transactionId } = data;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,

      handler: async function (response) {
        await axios.post(
          `${API}/user/verifypayment`,
          { ...response, transactionId },
          { withCredentials: true },
        );

        // ✅ Fetch latest balance
        const res = await axios.get(`${API}/user/balance`, {
          withCredentials: true,
        });

        setBalance(res.data.data);

        toast.success("Payment successful");
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6 space-y-3">
        <h2 className="text-lg font-semibold">Add Money</h2>

        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleAddMoney}
        >
          Add via Razorpay
        </Button>
      </CardContent>
    </Card>
  );
}
