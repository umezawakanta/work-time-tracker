import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { addCandidate, Candidate } from "../store/candidateSlice";
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

const parties = [
  "自民党",
  "立憲民主党",
  "日本維新の会",
  "公明党",
  "共産党",
  "国民民主党",
  "社民党",
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

export default function CandidateRegistrationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, "_id">>({
    name: "",
    party: "",
    prefecture: "",
    district: 1,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewCandidate((prev) => ({
      ...prev,
      [name]: name === "district" ? parseInt(value, 10) : value,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(addCandidate(newCandidate));
    toast({ title: "新しい候補者を登録しました" });
    setNewCandidate({ name: "", party: "", prefecture: "", district: 1 });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">候補者登録</h1>

      <Card>
        <CardHeader>
          <CardTitle>新規候補者登録</CardTitle>
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
                value={newCandidate.name}
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
                value={newCandidate.party}
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

            <div>
              <label
                htmlFor="prefecture"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                都道府県
              </label>
              <Select
                value={newCandidate.prefecture}
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
                value={newCandidate.district}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
