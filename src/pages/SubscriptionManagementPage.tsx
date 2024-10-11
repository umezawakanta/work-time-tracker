import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addSubscription,
  fetchSubscriptions,
  updateSubscription,
  deleteSubscription,
} from "@/store/subscriptionSlice";
import { Subscription } from "@/types/subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Pencil, Trash, ArrowUpDown } from "lucide-react";
import { SubscriptionCharts } from "@/components/chart/SubscriptionCharts";
import { MonthlySubscriptionChart } from "@/components/chart/MonthlySubscriptionChart";

export default function SubscriptionManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptions, status, error } = useSelector(
    (state: RootState) => state.subscription
  );

  const [newSubscription, setNewSubscription] = useState<
    Omit<Subscription, "_id">
  >({
    name: "",
    billingDate: "",
    type: "",
    amount: 0,
  });

  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSubscriptions());
    }
  }, [status, dispatch]);

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubscription) {
        await dispatch(
          updateSubscription({
            _id: editingSubscription._id,
            subscription: newSubscription,
          })
        ).unwrap();
        setEditingSubscription(null);
      } else {
        await dispatch(addSubscription(newSubscription)).unwrap();
      }
      setNewSubscription({
        name: "",
        billingDate: "",
        type: "",
        amount: 0,
      });
    } catch (err) {
      console.error("Failed to save the subscription: ", err);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setNewSubscription({
      name: subscription.name,
      billingDate: subscription.billingDate,
      type: subscription.type,
      amount: subscription.amount,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSubscription(id)).unwrap();
    } catch (err) {
      console.error("Failed to delete the subscription: ", err);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedAndFilteredSubscriptions = subscriptions
    .filter((sub) => {
      const monthFilter = filterMonth === "all" || (() => {
        const [year, month] = sub.billingDate.split("/");
        return `${year}/${month}` === filterMonth;
      })();
      const typeFilter = filterType === "all" || sub.type === filterType;
      return monthFilter && typeFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.billingDate.replace(/\//g, "-"));
      const dateB = new Date(b.billingDate.replace(/\//g, "-"));
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  const totalAmount = sortedAndFilteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const uniqueMonths = Array.from(
    new Set(
      subscriptions.map((sub) => {
        const [year, month] = sub.billingDate.split("/");
        return `${year}/${month}`;
      })
    )
  ).sort();

  const uniqueTypes = Array.from(
    new Set(subscriptions.map((sub) => sub.type))
  ).sort();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
            value={newSubscription.amount.toString()}
            onChange={(e) =>
              setNewSubscription({
                ...newSubscription,
                amount: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
              })
            }
            required
          />
        </div>
        <Button type="submit">{editingSubscription ? "更新" : "登録"}</Button>
        {editingSubscription && (
          <Button type="button" onClick={() => {
            setEditingSubscription(null);
            setNewSubscription({
              name: "",
              billingDate: "",
              type: "",
              amount: 0,
            });
          }}>
            キャンセル
          </Button>
        )}
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">サブスクリプション一覧</h2>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={toggleSortOrder} variant="outline">
            引き落とし日でソート
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <div className="flex space-x-2">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="月でフィルター" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての月</SelectItem>
                {uniqueMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="種別でフィルター" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての種別</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4 text-lg font-semibold">
          {filterMonth === "all" ? "全ての月" : filterMonth}
          {filterType !== "all" && `、${filterType}`}
          のサブスクリプションの合計金額: {totalAmount.toLocaleString()}円
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>引き落とし日</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredSubscriptions.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{sub.billingDate}</TableCell>
                <TableCell>{sub.type}</TableCell>
                <TableCell>{sub.amount.toLocaleString()}円</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(sub)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sub._id)}
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8">
        <SubscriptionCharts subscriptions={subscriptions} />
      </div>

      <MonthlySubscriptionChart subscriptions={subscriptions} />
    </div>
  );
}