"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useUserStore from "@/zustandStore/userStore";

const API = process.env.NEXT_PUBLIC_API;

export default function SendMoney() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const { setBalance } = useUserStore();

  const handleSend = async () => {
    try {
      await axios.post(
        `${API}/user/transfermoney`,
        { toEmail: email, amount },
        { withCredentials: true },
      );
      // ✅ refetch balance
      const res = await axios.get(`${API}/user/balance`, {
        withCredentials: true,
      });

      setBalance(res.data.data);
      alert("Transfer successful");
      setEmail("");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6 space-y-3">
        <h2 className="text-lg font-semibold">Send Money</h2>

        <Input
          placeholder="Receiver Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleSend}
        >
          Send
        </Button>
      </CardContent>
    </Card>
  );
}
