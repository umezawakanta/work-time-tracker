import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateCandidate, Candidate } from "@/store/candidateSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const parties = [
  "自民党",
  "立憲民主党",
  "日本維新の会",
  "公明党",
  "共産党",
  "国民民主党",
  "社民党",
  "れいわ新選組",
  "参政党",
  "無所属",
];

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const proportionalBlocks = [
  "北海道",
  "東北",
  "北関東",
  "南関東",
  "東京",
  "北陸信越",
  "東海",
  "近畿",
  "中国",
  "四国",
  "九州",
];

interface CandidateEditFormProps {
  candidate: Candidate;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CandidateEditForm({
  candidate,
  onCancel,
  onSuccess,
}: CandidateEditFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const [editedCandidate, setEditedCandidate] = useState<Candidate>(candidate);
  const [isProportionalOnly, setIsProportionalOnly] = useState(false);

  useEffect(() => {
    setEditedCandidate(candidate);
    setIsProportionalOnly(!candidate.district);
  }, [candidate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedCandidate((prev) => ({
      ...prev,
      [name]:
        name === "district" ? (value ? parseInt(value, 10) : null) : value,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setEditedCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleProportionalOnlyChange = (checked: boolean) => {
    setIsProportionalOnly(checked);
    if (checked) {
      setEditedCandidate((prev) => ({
        ...prev,
        district: null,
        prefecture: "",
      }));
    } else {
      setEditedCandidate((prev) => ({ ...prev, proportionalBlock: "" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editedCandidate._id) {
      toast({
        title: "更新に失敗しました",
        description: "候補者IDが見つかりません",
        variant: "destructive",
      });
      return;
    }
    try {
      await dispatch(
        updateCandidate({
          id: editedCandidate._id,
          candidate: {
            name: editedCandidate.name,
            party: editedCandidate.party,
            prefecture: isProportionalOnly ? "" : editedCandidate.prefecture,
            district: editedCandidate.district,
            proportionalBlock: isProportionalOnly
              ? editedCandidate.proportionalBlock
              : "",
          },
        })
      ).unwrap();
      toast({ title: "候補者情報を更新しました" });
      onSuccess();
    } catch (error) {
      toast({
        title: "更新に失敗しました",
        description:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>候補者情報編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              候補者名
            </label>
            <Input
              id="name"
              type="text"
              placeholder="候補者名"
              name="name"
              value={editedCandidate.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="party"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              政党
            </label>
            <Select
              value={editedCandidate.party}
              onValueChange={handleSelectChange("party")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="政党を選択してください" />
              </SelectTrigger>
              <SelectContent>
                {parties.map((party) => (
                  <SelectItem key={party} value={party}>
                    {party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isProportionalOnly"
              checked={isProportionalOnly}
              onCheckedChange={handleProportionalOnlyChange}
            />
            <Label htmlFor="isProportionalOnly">比例単独出馬</Label>
          </div>

          {isProportionalOnly ? (
            <div>
              <label
                htmlFor="proportionalBlock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                比例代表ブロック
              </label>
              <Select
                value={editedCandidate.proportionalBlock || ""}
                onValueChange={handleSelectChange("proportionalBlock")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="比例代表ブロックを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {proportionalBlocks.map((block) => (
                    <SelectItem key={block} value={block}>
                      {block}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="prefecture"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  都道府県
                </label>
                <Select
                  value={editedCandidate.prefecture}
                  onValueChange={handleSelectChange("prefecture")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="都道府県を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {prefectures.map((prefecture) => (
                      <SelectItem key={prefecture} value={prefecture}>
                        {prefecture}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  選挙区
                </label>
                <Input
                  id="district"
                  type="number"
                  placeholder="選挙区"
                  name="district"
                  value={editedCandidate.district || ""}
                  onChange={handleInputChange}
                  min="1"
                  required={!isProportionalOnly}
                />
              </div>
            </>
          )}

          <div className="flex justify-between space-x-4">
            <Button type="submit" className="flex-1">
              更新
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
