"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

const API = process.env.NEXT_PUBLIC_API;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/user/gettransactions`, { withCredentials: true })
      .then((res) => setTransactions(res.data.data));
  }, []);

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>

        {transactions.length === 0 ? (
          <p className="text-gray-400">No transactions</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <span>{tx.type}</span>
                <span
                  className={
                    tx.type === "TRANSFER"
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  ₹ {tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}