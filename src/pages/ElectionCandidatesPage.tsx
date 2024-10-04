import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Candidate {
  id: string;
  name: string;
  party: string;
  prefecture: string;
  district: number;
}

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

export default function ElectionCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, "id">>({
    name: "",
    party: "",
    prefecture: "",
    district: 1,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Candidate;
    direction: "asc" | "desc";
  } | null>(null);
  const [filters, setFilters] = useState<{ party: string; prefecture: string }>(
    {
      party: "all",
      prefecture: "all",
    }
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();

  useEffect(() => {
    // ここでAPIから候補者データを取得する
    // 仮のデータをセット
    setCandidates([
      {
        id: "1",
        name: "道下大樹",
        party: "立憲民主党",
        prefecture: "北海道",
        district: 1,
      },
      {
        id: "2",
        name: "加藤貴弘",
        party: "自民党",
        prefecture: "北海道",
        district: 1,
      },
      {
        id: "3",
        name: "小林陽",
        party: "日本維新の会",
        prefecture: "北海道",
        district: 1,
      },
      {
        id: "4",
        name: "千葉恵子",
        party: "共産党",
        prefecture: "北海道",
        district: 1,
      },
      {
        id: "5",
        name: "田中義人",
        party: "参政党",
        prefecture: "北海道",
        district: 1,
      },
    ]);
  }, []);

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
    if (editingId) {
      // 編集モード
      setCandidates((prevCandidates) =>
        prevCandidates.map((c) =>
          c.id === editingId ? { ...newCandidate, id: editingId } : c
        )
      );
      setEditingId(null);
      toast({ title: "候補者情報を更新しました" });
    } else {
      // 新規追加モード
      const id = Date.now().toString();
      setCandidates((prevCandidates) => [
        ...prevCandidates,
        { ...newCandidate, id },
      ]);
      toast({ title: "新しい候補者を登録しました" });
    }
    setNewCandidate({ name: "", party: "", prefecture: "", district: 1 });
  };

  const handleEdit = (candidate: Candidate) => {
    setNewCandidate(candidate);
    setEditingId(candidate.id);
  };

  const handleDelete = (id: string) => {
    setCandidates((prevCandidates) =>
      prevCandidates.filter((c) => c.id !== id)
    );
    toast({ title: "候補者を削除しました" });
  };

  const handleSort = (key: keyof Candidate) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (name: string) => (value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredAndSortedCandidates = React.useMemo(() => {
    let result = [...candidates];

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.prefecture.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.district.toString().includes(searchTerm)
      );
    }

    if (filters.party !== "all") {
      result = result.filter((c) => c.party === filters.party);
    }
    if (filters.prefecture !== "all") {
      result = result.filter((c) => c.prefecture === filters.prefecture);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [candidates, sortConfig, filters, searchTerm]);

  const pageCount = Math.ceil(
    filteredAndSortedCandidates.length / itemsPerPage
  );
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">衆議院選挙 候補者擁立状況</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingId ? "候補者情報編集" : "新規候補者登録"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="候補者名"
              name="name"
              value={newCandidate.name}
              onChange={handleInputChange}
              required
            />
            <Select
              value={newCandidate.party}
              onValueChange={handleSelectChange("party")}
            >
              <SelectTrigger>
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
            <Select
              value={newCandidate.prefecture}
              onValueChange={handleSelectChange("prefecture")}
            >
              <SelectTrigger>
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
            <Input
              type="number"
              placeholder="選挙区"
              name="district"
              value={newCandidate.district}
              onChange={handleInputChange}
              min="1"
              required
            />
            <Button type="submit" className="w-full">
              {editingId ? "更新" : "登録"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>登録済み候補者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <Input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={filters.party}
                onValueChange={handleFilterChange("party")}
              >
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="政党でフィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての政党</SelectItem>
                  {parties.map((party) => (
                    <SelectItem key={party} value={party}>
                      {party}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.prefecture}
                onValueChange={handleFilterChange("prefecture")}
              >
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="都道府県でフィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての都道府県</SelectItem>
                  {prefectures.map((prefecture) => (
                    <SelectItem key={prefecture} value={prefecture}>
                      {prefecture}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("name")}
                    className="cursor-pointer"
                  >
                    名前
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("party")}
                    className="cursor-pointer"
                  >
                    政党
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("prefecture")}
                    className="cursor-pointer"
                  >
                    都道府県
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("district")}
                    className="cursor-pointer"
                  >
                    選挙区
                  </TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.party}</Badge>
                    </TableCell>
                    <TableCell>{candidate.prefecture}</TableCell>
                    <TableCell>{candidate.district}</TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(candidate)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(candidate.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-2 sm:mb-0 text-sm text-gray-600">
              全{filteredAndSortedCandidates.length}件中{" "}
              {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedCandidates.length
              )}
              件を表示
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                size="sm"
              >
                前へ
              </Button>
              <span className="text-sm">
                {currentPage} / {pageCount}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                }
                disabled={currentPage === pageCount}
                size="sm"
              >
                次へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
