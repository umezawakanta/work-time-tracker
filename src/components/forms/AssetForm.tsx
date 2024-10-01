import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addAssetEntry, updateAssetEntry } from "@/store/assetSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface AssetFormProps {
  editingAsset: string | null;
  setEditingAsset: React.Dispatch<React.SetStateAction<string | null>>;
  updateLastBalanceDate: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  editingAsset,
  setEditingAsset,
  updateLastBalanceDate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentAssetValue, setCurrentAssetValue] = useState<string>("");
  const [currentAssetAccount, setCurrentAssetAccount] = useState<string>("");

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssetAccount) {
      toast({
        title: "エラー",
        description: "口座を選択してください。",
        variant: "destructive",
      });
      return;
    }
    const newAssetEntry = {
      date: new Date().toISOString().split("T")[0],
      value: parseFloat(currentAssetValue),
      account: currentAssetAccount,
    };
    if (editingAsset) {
      dispatch(updateAssetEntry({ id: editingAsset, entry: newAssetEntry }));
      setEditingAsset(null);
    } else {
      dispatch(addAssetEntry(newAssetEntry));
    }
    setCurrentAssetValue("");
    setCurrentAssetAccount("");
    updateLastBalanceDate();
    toast({
      title: "成功",
      description: editingAsset
        ? "資産情報が更新されました。"
        : "資産情報が記録されました。",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>資産情報の登録/更新</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssetSubmit} className="space-y-4">
          <div>
            <Label htmlFor="assetValue">資産価値</Label>
            <Input
              id="assetValue"
              type="number"
              value={currentAssetValue}
              onChange={(e) => setCurrentAssetValue(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="assetAccount">口座</Label>
            <Input
              id="assetAccount"
              type="text"
              value={currentAssetAccount}
              onChange={(e) => setCurrentAssetAccount(e.target.value)}
              required
            />
          </div>
          <Button type="submit">{editingAsset ? "更新" : "登録"}</Button>
          {editingAsset && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingAsset(null)}
            >
              キャンセル
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
