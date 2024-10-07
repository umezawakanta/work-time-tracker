"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addSubscription, Subscription } from "@/store/subscriptionSlice";

export default function SubscriptionManagementPage() {
  const subscriptions = useSelector(
    (state: RootState) => state.subscription.subscriptions
  );
  const [newSubscription, setNewSubscription] = useState<Subscription>({
    id: "",
    name: "",
    billingDate: "",
    type: "",
    amount: 0,
  });

  const dispatch = useDispatch<AppDispatch>();

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addSubscription({ ...newSubscription, id: Date.now().toString() })
    );
    setNewSubscription({
      id: "",
      name: "",
      billingDate: "",
      type: "",
      amount: 0,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">サブスクリプション管理</h1>
      <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">名称</Label>
          <Input
            id="name"
            value={newSubscription.name}
            onChange={(e) =>
              setNewSubscription({ ...newSubscription, name: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="billingDate">引き落とし日 (YYYY/MM/DD)</Label>
          <Input
            id="billingDate"
            value={newSubscription.billingDate}
            onChange={(e) =>
              setNewSubscription({
                ...newSubscription,
                billingDate: e.target.value,
              })
            }
            pattern="\d{4}/\d{2}/\d{2}"
            placeholder="2024/01/01"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">種別</Label>
          <Input
            id="type"
            value={newSubscription.type}
            onChange={(e) =>
              setNewSubscription({ ...newSubscription, type: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">金額</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="1"
            value={newSubscription.amount}
            onChange={(e) =>
              setNewSubscription({
                ...newSubscription,
                amount: parseInt(e.target.value),
              })
            }
            required
          />
        </div>
        <Button type="submit">登録</Button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">サブスクリプション一覧</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>引き落とし日</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{sub.billingDate}</TableCell>
                <TableCell>{sub.type}</TableCell>
                <TableCell>{sub.amount.toLocaleString()}円</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
