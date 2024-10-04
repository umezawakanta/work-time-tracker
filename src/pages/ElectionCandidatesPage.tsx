import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { AppDispatch, RootState } from "../store";
import {
  fetchCandidates,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  Candidate,
} from "../store/candidateSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

const COLORS = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
  "rgba(199, 199, 199, 0.8)",
  "rgba(83, 102, 255, 0.8)",
  "rgba(40, 159, 64, 0.8)",
];

const CandidateCharts: React.FC<{ candidates: Candidate[] }> = ({
  candidates,
}) => {
  const partyData = {
    labels: parties,
    datasets: [
      {
        data: parties.map(
          (party) => candidates.filter((c) => c.party === party).length
        ),
        backgroundColor: COLORS,
        borderColor: COLORS.map((color) => color.replace("0.8", "1")),
        borderWidth: 1,
      },
    ],
  };

  const prefectureData = {
    labels: prefectures,
    datasets: [
      {
        label: "候補者数",
        data: prefectures.map(
          (prefecture) =>
            candidates.filter((c) => c.prefecture === prefecture).length
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "政党別候補者数",
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "都道府県別候補者数",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>政党別候補者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Pie data={partyData} options={pieOptions} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>都道府県別候補者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={prefectureData} options={barOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ElectionCandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates
  );
  const status = useSelector((state: RootState) => state.candidate.status);
  const error = useSelector((state: RootState) => state.candidate.error);

  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, "_id">>({
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
    dispatch(fetchCandidates());
  }, [dispatch]);

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
      dispatch(updateCandidate({ id: editingId, candidate: newCandidate }));
      setEditingId(null);
      toast({ title: "候補者情報を更新しました" });
    } else {
      dispatch(addCandidate(newCandidate));
      toast({ title: "新しい候補者を登録しました" });
    }
    setNewCandidate({ name: "", party: "", prefecture: "", district: 1 });
  };

  const handleEdit = (candidate: Candidate) => {
    setNewCandidate(candidate);
    setEditingId(candidate._id ?? null);
  };

  const handleDelete = (id: string | undefined) => {
    if (id) {
      dispatch(deleteCandidate(id));
      toast({ title: "候補者を削除しました" });
    } else {
      toast({
        title: "削除に失敗しました",
        description: "候補者IDが見つかりません",
        variant: "destructive",
      });
    }
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
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
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

  if (status === "loading") {
    return <div>データを読み込んでいます...</div>;
  }

  if (status === "failed") {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        衆議院選挙 候補者擁立状況
      </h1>

      <CandidateCharts candidates={candidates} />

      <Card className="mb-8 mt-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                value={filters.party}
                onValueChange={handleFilterChange("party")}
              >
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="inline-block min-w-full align-middle">
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
                    <TableRow key={candidate._id}>
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
                            onClick={() => handleDelete(candidate._id)}
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
