import { Card, CardContent } from "@/components/ui/card";
import useUserStore from "@/zustandStore/userStore";

export default function BalanceCard({ user }) {
  const { balance } = useUserStore();
  return (
    <Card className="bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-xl">
      <CardContent className="p-6">
        <h2 className="text-lg">Balance</h2>
        <p className="text-3xl font-bold mt-2">₹ {balance || 0}</p>

        <p className="text-sm mt-2 opacity-80">Acc: {user?.accountNumber}</p>
      </CardContent>
    </Card>
  );
}
