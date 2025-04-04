// src/components/subscription/SubscriptionList.tsx

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Calendar } from "lucide-react";
import { SubscriptionService } from "@/types";

interface PaymentMethodTagProps {
  method: string;
}

// インラインでPaymentMethodTagコンポーネントを定義
const PaymentMethodTag: React.FC<PaymentMethodTagProps> = ({ method }) => {
  const methods: Record<string, { color: string, label: string }> = {
    credit: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      label: "カード"
    },
    bank: {
      color: "bg-green-100 text-green-800 border-green-200",
      label: "銀行振替"
    },
    paypal: {
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      label: "PayPal"
    },
    apple: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Apple"
    },
    google: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "Google"
    },
  };

  const { color, label } = methods[method] || methods.credit;

  return (
    <Badge
      variant="outline"
      className={`${color} flex items-center text-xs font-normal py-0.5 px-1.5`}
    >
      {label}
    </Badge>
  );
};

// 型定義に onDelete を追加
interface SubscriptionListProps {
    subscriptions: SubscriptionService[];
    onEdit: (subscription: SubscriptionService) => void;
    onDelete?: (id: string) => void; // 削除ハンドラを追加
  }

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onEdit,
  onDelete, // onDelete パラメータを追加
}) => {
  // 削除ボタンクリック時の処理
  const handleDeleteClick = (id: string) => {
    // 親コンポーネントの削除ハンドラを呼び出す
    if (onDelete) {
      onDelete(id);
    } else {
      console.warn("onDelete handler not provided");
    }
  };

  // billingDateが存在しない場合の表示
  const getBillingDateDisplay = (subscription: SubscriptionService): React.ReactNode => {
    if (subscription.billingDate) {
      // billingDateが存在する場合は、適切にフォーマットして表示
      return String(subscription.billingDate);
    }
    // billingDateが存在しない場合は「未設定」と表示
    return (
      <span className="flex items-center text-gray-400 text-sm">
        <Calendar className="h-3 w-3 mr-1" />
        未設定
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>引き落とし日</TableHead>
            <TableHead>支払い方法</TableHead>
            <TableHead>種別</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{getBillingDateDisplay(sub)}</TableCell>
                <TableCell>
                  <PaymentMethodTag
                    method={
                      typeof sub.paymentMethod === "object"
                        ? sub.paymentMethod.type // オブジェクトの場合はtype属性を抽出
                        : sub.paymentMethod || "credit"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{sub.type}</Badge>
                </TableCell>
                <TableCell>
                  {sub.amount.toLocaleString()}円
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(sub)}
                      title="編集"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(sub._id)}
                      title="削除"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-gray-500"
              >
                表示するサブスクリプションがありません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubscriptionList;