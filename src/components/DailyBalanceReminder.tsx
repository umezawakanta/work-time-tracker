import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAssetEntry } from "../store/assetSlice";
import { addDebtEntry } from "../store/debtSlice";
import { updateLastReminderDate } from "../store/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { AppDispatch, RootState } from "../store";

export default function DailyBalanceReminder() {
  const dispatch = useDispatch<AppDispatch>();
  const [showReminder, setShowReminder] = useState(false);
  const [assetValue, setAssetValue] = useState("");
  const [assetAccount, setAssetAccount] = useState("");
  const [debtValue, setDebtValue] = useState("");
  const [debtAccount, setDebtAccount] = useState("");
  const lastReminderDate = useSelector(
    (state: RootState) => state.user.lastReminderDate
  );

  useEffect(() => {
    const now = new Date();
    const lastReminder = lastReminderDate ? new Date(lastReminderDate) : null;
    if (!lastReminder || now.toDateString() !== lastReminder.toDateString()) {
      setShowReminder(true);
    }
  }, [lastReminderDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetValue && assetAccount) {
      dispatch(
        addAssetEntry({
          date: new Date().toISOString().split("T")[0],
          value: parseFloat(assetValue),
          account: assetAccount,
        })
      );
    }
    if (debtValue && debtAccount) {
      dispatch(
        addDebtEntry({
          date: new Date().toISOString().split("T")[0],
          value: parseFloat(debtValue),
          account: debtAccount,
          description: "日次残高更新",
        })
      );
    }
    dispatch(updateLastReminderDate(new Date().toISOString()));
    setShowReminder(false);
    toast({
      title: "残高更新完了",
      description: "本日の残高が正常に記録されました。",
    });
  };

  if (!showReminder) return null;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>日次残高更新リマインダー</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="assetValue">資産残高</Label>
            <Input
              id="assetValue"
              type="number"
              value={assetValue}
              onChange={(e) => setAssetValue(e.target.value)}
              placeholder="資産残高を入力"
            />
          </div>
          <div>
            <Label htmlFor="assetAccount">資産口座</Label>
            <Input
              id="assetAccount"
              type="text"
              value={assetAccount}
              onChange={(e) => setAssetAccount(e.target.value)}
              placeholder="資産口座名を入力"
            />
          </div>
          <div>
            <Label htmlFor="debtValue">負債残高</Label>
            <Input
              id="debtValue"
              type="number"
              value={debtValue}
              onChange={(e) => setDebtValue(e.target.value)}
              placeholder="負債残高を入力"
            />
          </div>
          <div>
            <Label htmlFor="debtAccount">負債口座</Label>
            <Input
              id="debtAccount"
              type="text"
              value={debtAccount}
              onChange={(e) => setDebtAccount(e.target.value)}
              placeholder="負債口座名を入力"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            残高を更新
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
