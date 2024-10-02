import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceUpdateReminderProps {
  lastUpdateDate: string | null;
}

export const BalanceUpdateReminder: React.FC<BalanceUpdateReminderProps> = ({
  lastUpdateDate,
}) => {
  return (
    <Card className="mb-8 bg-yellow-100">
      <CardHeader>
        <CardTitle>残高更新リマインダー</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          本日の資産・負債の残高を入力してください。最後の更新日:{" "}
          {lastUpdateDate || "未更新"}
        </p>
      </CardContent>
    </Card>
  );
};
