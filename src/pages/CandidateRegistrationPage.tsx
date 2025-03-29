import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { addCandidate, fetchCandidates } from "../store/candidateSlice";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Search,
  Bookmark,
  Users,
  Database,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Candidate } from "@/types";

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

// 各都道府県の選挙区数
const districtsByPrefecture = {
  北海道: 12,
  青森県: 3,
  岩手県: 3,
  宮城県: 5,
  秋田県: 3,
  山形県: 3,
  福島県: 4,
  茨城県: 7,
  栃木県: 5,
  群馬県: 5,
  埼玉県: 15,
  千葉県: 13,
  東京都: 25,
  神奈川県: 18,
  新潟県: 6,
  富山県: 3,
  石川県: 3,
  福井県: 2,
  山梨県: 2,
  長野県: 5,
  岐阜県: 5,
  静岡県: 8,
  愛知県: 15,
  三重県: 4,
  滋賀県: 4,
  京都府: 6,
  大阪府: 19,
  兵庫県: 12,
  奈良県: 4,
  和歌山県: 3,
  鳥取県: 2,
  島根県: 2,
  岡山県: 5,
  広島県: 7,
  山口県: 4,
  徳島県: 2,
  香川県: 3,
  愛媛県: 4,
  高知県: 2,
  福岡県: 11,
  佐賀県: 2,
  長崎県: 4,
  熊本県: 5,
  大分県: 3,
  宮崎県: 3,
  鹿児島県: 4,
  沖縄県: 4,
};

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

// 比例ブロックごとの定数
const proportionalBlockSeats = {
  北海道: 8,
  東北: 14,
  北関東: 20,
  南関東: 22,
  東京: 17,
  北陸信越: 11,
  東海: 21,
  近畿: 29,
  中国: 11,
  四国: 6,
  九州: 21,
};

// 都道府県コードマッピング（選挙ウォッチURLでの使用）
const prefectureCodeMap = {
  北海道: "01",
  青森県: "02",
  岩手県: "03",
  宮城県: "04",
  秋田県: "05",
  山形県: "06",
  福島県: "07",
  茨城県: "08",
  栃木県: "09",
  群馬県: "10",
  埼玉県: "11",
  千葉県: "12",
  東京都: "13",
  神奈川県: "14",
  新潟県: "15",
  富山県: "16",
  石川県: "17",
  福井県: "18",
  山梨県: "19",
  長野県: "20",
  岐阜県: "21",
  静岡県: "22",
  愛知県: "23",
  三重県: "24",
  滋賀県: "25",
  京都府: "26",
  大阪府: "27",
  兵庫県: "28",
  奈良県: "29",
  和歌山県: "30",
  鳥取県: "31",
  島根県: "32",
  岡山県: "33",
  広島県: "34",
  山口県: "35",
  徳島県: "36",
  香川県: "37",
  愛媛県: "38",
  高知県: "39",
  福岡県: "40",
  佐賀県: "41",
  長崎県: "42",
  熊本県: "43",
  大分県: "44",
  宮崎県: "45",
  鹿児島県: "46",
  沖縄県: "47",
};

// 比例ブロックコードマッピング
const proportionalBlockCodeMap = {
  北海道: "01",
  東北: "02",
  北関東: "03",
  南関東: "04",
  東京: "05",
  北陸信越: "06",
  東海: "07",
  近畿: "08",
  中国: "09",
  四国: "10",
  九州: "11",
};

export default function CandidateRegistrationPage({ isPremium = false }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates || []
  );
  const candidatesStatus = useSelector(
    (state: RootState) => state.candidate.status
  );

  const [newCandidate, setNewCandidate] = useState<Omit<Candidate, "_id">>({
    name: "",
    party: "",
    prefecture: "",
    district: null,
    proportionalBlock: "", // null の代わりに空文字列を使用
  });

  const [isProportionalOnly, setIsProportionalOnly] = useState(false);
  const [selectedTabPrefecture, setSelectedTabPrefecture] =
    useState<string>("東京都");
  const [selectedProportionalBlock, setSelectedProportionalBlock] =
    useState<string>("東京");
  const [activeTab, setActiveTab] = useState<string>("registration");
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [dataSourceExpanded, setDataSourceExpanded] = useState(true);

  useEffect(() => {
    if (candidatesStatus === "idle") {
      dispatch(fetchCandidates());
    }
  }, [candidatesStatus, dispatch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewCandidate((prev) => ({
      ...prev,
      [name]:
        name === "district" ? (value ? parseInt(value, 10) : null) : value,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setNewCandidate((prev) => ({ ...prev, [name]: value }));

    // プレフィックスが変更された場合、選挙区をリセット
    if (name === "prefecture") {
      setNewCandidate((prev) => ({ ...prev, district: null }));
      setSelectedTabPrefecture(value);
    }

    // 比例ブロックが変更された場合
    if (name === "proportionalBlock") {
      setSelectedProportionalBlock(value);
    }
  };

  const handleProportionalOnlyChange = (checked: boolean) => {
    setIsProportionalOnly(checked);
    if (checked) {
      setNewCandidate((prev) => ({ ...prev, district: null, prefecture: "" }));
    } else {
      setNewCandidate((prev) => ({ ...prev, proportionalBlock: "" })); // null の代わりに空文字列
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(addCandidate(newCandidate)).unwrap();
      toast({ title: "新しい候補者を登録しました" });

      // フォームをリセット
      setNewCandidate({
        name: "",
        party: "",
        prefecture: isProportionalOnly ? "" : newCandidate.prefecture,
        district: null,
        proportionalBlock: isProportionalOnly
          ? newCandidate.proportionalBlock
          : "",
      });

      // 候補者リストを更新
      dispatch(fetchCandidates());
    } catch (error) {
      toast({
        title: "登録に失敗しました",
        description:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/election-candidates");
  };

  const handleSelectDistrict = (prefecture: string, district: number) => {
    setNewCandidate({
      ...newCandidate,
      prefecture,
      district,
      proportionalBlock: "", // null の代わりに空文字列
    });
    setIsProportionalOnly(false);
    setSelectedDistrict(district);
    setActiveTab("registration");
  };

  const handleSelectProportionalBlock = (block: string) => {
    setNewCandidate({
      ...newCandidate,
      prefecture: "",
      district: null,
      proportionalBlock: block,
    });
    setIsProportionalOnly(true);
    setActiveTab("registration");
  };

  // 選挙ウォッチURLの生成
  const getElectionWatchUrl = () => {
    if (isProportionalOnly && newCandidate.proportionalBlock) {
      const blockCode =
        proportionalBlockCodeMap[
          newCandidate.proportionalBlock as keyof typeof proportionalBlockCodeMap
        ];
      return `https://senkyo.watch/shu/hirei/${blockCode}`;
    } else if (
      !isProportionalOnly &&
      newCandidate.prefecture &&
      newCandidate.district
    ) {
      const prefCode =
        prefectureCodeMap[
          newCandidate.prefecture as keyof typeof prefectureCodeMap
        ];
      return `https://senkyo.watch/shu/senkyoku/${prefCode}/${newCandidate.district
        .toString()
        .padStart(2, "0")}`;
    }
    return "https://senkyo.watch/shu/senkyoku";
  };

  // 選挙区選択時の選挙ウォッチURL
  const getDistrictElectionWatchUrl = (
    prefecture: string,
    district: number
  ) => {
    const prefCode =
      prefectureCodeMap[prefecture as keyof typeof prefectureCodeMap];
    return `https://senkyo.watch/shu/senkyoku/${prefCode}/${district
      .toString()
      .padStart(2, "0")}`;
  };

  // 比例ブロック選択時の選挙ウォッチURL
  const getProportionalElectionWatchUrl = (block: string) => {
    const blockCode =
      proportionalBlockCodeMap[block as keyof typeof proportionalBlockCodeMap];
    return `https://senkyo.watch/shu/hirei/${blockCode}`;
  };

  // 都道府県ごとの登録状況を計算
  const getDistrictStatus = () => {
    const status: Record<string, Record<number, Candidate[]>> = {};

    prefectures.forEach((prefecture) => {
      status[prefecture] = {};
      const maxDistricts =
        districtsByPrefecture[
          prefecture as keyof typeof districtsByPrefecture
        ] || 0;

      for (let i = 1; i <= maxDistricts; i++) {
        status[prefecture][i] = [];
      }
    });

    candidates.forEach((candidate) => {
      if (candidate.prefecture && candidate.district) {
        if (!status[candidate.prefecture][candidate.district]) {
          status[candidate.prefecture][candidate.district] = [];
        }
        status[candidate.prefecture][candidate.district].push(candidate);
      }
    });

    return status;
  };

  // 比例ブロックごとの登録状況を計算
  const getProportionalStatus = () => {
    const status: Record<string, Candidate[]> = {};

    proportionalBlocks.forEach((block) => {
      status[block] = [];
    });

    candidates.forEach((candidate) => {
      if (candidate.proportionalBlock) {
        status[candidate.proportionalBlock].push(candidate);
      }
    });

    return status;
  };

  const districtStatus = getDistrictStatus();
  const proportionalStatus = getProportionalStatus();

  // 未登録の選挙区を計算
  const getUnregisteredDistricts = (prefecture: string) => {
    const districts: number[] = [];
    const maxDistricts =
      districtsByPrefecture[prefecture as keyof typeof districtsByPrefecture] ||
      0;

    for (let i = 1; i <= maxDistricts; i++) {
      if (
        !districtStatus[prefecture][i] ||
        districtStatus[prefecture][i].length === 0
      ) {
        districts.push(i);
      }
    }

    return districts;
  };

  // 全国の未登録選挙区の総数を計算
  const getTotalUnregisteredDistricts = () => {
    let count = 0;
    prefectures.forEach((prefecture) => {
      count += getUnregisteredDistricts(prefecture).length;
    });
    return count;
  };

  // 全国の選挙区総数を計算
  const getTotalDistricts = () => {
    let count = 0;
    Object.values(districtsByPrefecture).forEach((num) => {
      count += num;
    });
    return count;
  };

  const totalUnregisteredDistricts = getTotalUnregisteredDistricts();
  const totalDistricts = getTotalDistricts();
  const registrationProgress = Math.round(
    ((totalDistricts - totalUnregisteredDistricts) / totalDistricts) * 100
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">
        候補者登録システム
      </h1>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-4 w-full md:w-auto">
          <div className="bg-blue-100 p-2 rounded-full">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">登録状況</p>
            <p className="text-xs text-blue-700">
              選挙区: {totalDistricts - totalUnregisteredDistricts}/
              {totalDistricts} 区 ({registrationProgress}%)
            </p>
          </div>
        </div>

        {isPremium && (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 px-3 py-1 flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            <span>プレミアムプラン</span>
          </Badge>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registration">候補者登録</TabsTrigger>
          <TabsTrigger value="status">選挙区登録状況</TabsTrigger>
        </TabsList>

        <TabsContent value="registration">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>新規候補者登録</CardTitle>
                  {selectedDistrict && !isProportionalOnly && (
                    <CardDescription>
                      現在選択: {newCandidate.prefecture} 第
                      {newCandidate.district}区
                    </CardDescription>
                  )}
                  {isProportionalOnly && newCandidate.proportionalBlock && (
                    <CardDescription>
                      現在選択: 比例代表 {newCandidate.proportionalBlock}
                      ブロック
                    </CardDescription>
                  )}
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
                          value={newCandidate.proportionalBlock || ""}
                          onValueChange={handleSelectChange(
                            "proportionalBlock"
                          )}
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
                            value={newCandidate.prefecture || ""}
                            onValueChange={handleSelectChange("prefecture")}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="都道府県を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {prefectures.map((prefecture) => {
                                const unregisteredCount =
                                  getUnregisteredDistricts(prefecture).length;
                                return (
                                  <SelectItem
                                    key={prefecture}
                                    value={prefecture}
                                  >
                                    {prefecture}
                                    {unregisteredCount > 0 && (
                                      <span className="ml-2 text-red-500 text-xs">
                                        (未登録: {unregisteredCount}区)
                                      </span>
                                    )}
                                  </SelectItem>
                                );
                              })}
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
                          <Select
                            value={newCandidate.district?.toString() || ""}
                            onValueChange={(value) => {
                              setNewCandidate((prev) => ({
                                ...prev,
                                district: parseInt(value, 10),
                              }));
                            }}
                            disabled={!newCandidate.prefecture}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="選挙区を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {newCandidate.prefecture &&
                                Array.from(
                                  {
                                    length:
                                      districtsByPrefecture[
                                        newCandidate.prefecture as keyof typeof districtsByPrefecture
                                      ] || 0,
                                  },
                                  (_, i) => i + 1
                                ).map((district) => {
                                  const isUnregistered =
                                    !districtStatus[newCandidate.prefecture][
                                      district
                                    ] ||
                                    districtStatus[newCandidate.prefecture][
                                      district
                                    ].length === 0;
                                  return (
                                    <SelectItem
                                      key={district}
                                      value={district.toString()}
                                    >
                                      第{district}区
                                      {isUnregistered && (
                                        <span className="ml-2 text-red-500 text-xs">
                                          (未登録)
                                        </span>
                                      )}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between space-x-4 mt-6">
                      <Button type="submit" className="flex-1">
                        登録
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancel}
                      >
                        戻る
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* 選挙ウォッチデータソース */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>データソース</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDataSourceExpanded(!dataSourceExpanded)}
                    >
                      {dataSourceExpanded ? "縮小" : "拡大"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    選挙区情報を確認する外部リソース
                  </CardDescription>
                </CardHeader>
                {dataSourceExpanded && (
                  <CardContent className="pb-3">
                    <Alert className="mb-4 bg-orange-50 border-orange-200">
                      <Info className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-orange-800">
                        候補者情報の参照元
                      </AlertTitle>
                      <AlertDescription className="text-orange-700 text-sm">
                        選挙ウォッチサイトでは各選挙区の最新候補者情報を確認できます。
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      {/* 現在選択中の選挙区/比例ブロックへのリンク */}
                      <div className="border rounded-md p-3 bg-gray-50">
                        <p className="text-sm font-medium mb-2">現在の選択:</p>
                        {(newCandidate.prefecture && newCandidate.district) ||
                        newCandidate.proportionalBlock ? (
                          <a
                            href={getElectionWatchUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="mr-1 font-medium">
                              {isProportionalOnly &&
                              newCandidate.proportionalBlock
                                ? `比例代表 ${newCandidate.proportionalBlock}ブロック`
                                : newCandidate.prefecture &&
                                  newCandidate.district
                                ? `${newCandidate.prefecture} 第${newCandidate.district}区`
                                : "未選択"}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="text-gray-500 text-sm">未選択</p>
                        )}
                      </div>

                      {/* 一般リンク */}
                      <div>
                        <p className="text-sm font-medium mb-2">一般リンク:</p>
                        <ul className="space-y-2">
                          <li>
                            <a
                              href="https://senkyo.watch/shu/senkyoku"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Search className="h-4 w-4 mr-1" />
                              <span>選挙区一覧</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://senkyo.watch/shu/hirei"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Search className="h-4 w-4 mr-1" />
                              <span>比例代表ブロック一覧</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* 未登録選挙区 */}
                      {totalUnregisteredDistricts > 0 && (
                        <div className="border border-red-200 rounded-md p-3 bg-red-50">
                          <p className="text-sm font-medium mb-2 text-red-700 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            未登録選挙区 ({totalUnregisteredDistricts}区)
                          </p>
                          <div className="max-h-32 overflow-y-auto text-sm">
                            <ul className="space-y-1">
                              {prefectures.map((prefecture) => {
                                const unregisteredDistricts =
                                  getUnregisteredDistricts(prefecture);
                                if (unregisteredDistricts.length === 0)
                                  return null;

                                return (
                                  <li key={prefecture} className="text-red-700">
                                    <strong>{prefecture}</strong>:
                                    {unregisteredDistricts.map(
                                      (district, index) => (
                                        <a
                                          key={`${prefecture}-${district}`}
                                          href={getDistrictElectionWatchUrl(
                                            prefecture,
                                            district
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-1 text-blue-600 hover:text-blue-800 underline"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleSelectDistrict(
                                              prefecture,
                                              district
                                            );
                                          }}
                                        >
                                          {district}区
                                          {index <
                                          unregisteredDistricts.length - 1
                                            ? ", "
                                            : ""}
                                        </a>
                                      )
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
                <CardFooter className={dataSourceExpanded ? "pt-0" : ""}>
                  <a
                    href={getElectionWatchUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      選挙ウォッチで確認
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 未登録選挙区一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>未登録選挙区一覧</CardTitle>
                <CardDescription>
                  候補者が登録されていない選挙区
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={selectedTabPrefecture}
                  onValueChange={setSelectedTabPrefecture}
                >
                  <ScrollArea className="h-12 whitespace-nowrap">
                    <TabsList className="w-full inline-flex">
                      {prefectures.map((prefecture) => {
                        const unregisteredCount =
                          getUnregisteredDistricts(prefecture).length;
                        const hasUnregistered = unregisteredCount > 0;

                        return (
                          <TabsTrigger
                            key={prefecture}
                            value={prefecture}
                            className={hasUnregistered ? "relative" : ""}
                          >
                            {prefecture}
                            {hasUnregistered && (
                              <Badge className="ml-1 bg-red-500 absolute -top-1 -right-1 text-xs h-4 min-w-4 flex items-center justify-center">
                                {unregisteredCount}
                              </Badge>
                            )}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </ScrollArea>

                  {prefectures.map((prefecture) => (
                    <TabsContent key={prefecture} value={prefecture}>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>選挙区</TableHead>
                              <TableHead>状態</TableHead>
                              <TableHead className="text-right">
                                アクション
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from(
                              {
                                length:
                                  districtsByPrefecture[
                                    prefecture as keyof typeof districtsByPrefecture
                                  ] || 0,
                              },
                              (_, i) => i + 1
                            ).map((district) => {
                              const candidates =
                                districtStatus[prefecture][district] || [];
                              const isRegistered = candidates.length > 0;

                              return (
                                <TableRow key={`${prefecture}-${district}`}>
                                  <TableCell>第{district}区</TableCell>
                                  <TableCell>
                                    {isRegistered ? (
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        <span>
                                          {candidates.length}名登録済み
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                        <span>未登録</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleSelectDistrict(
                                            prefecture,
                                            district
                                          )
                                        }
                                      >
                                        選択
                                      </Button>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <a
                                              href={getDistrictElectionWatchUrl(
                                                prefecture,
                                                district
                                              )}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                                              title={`選挙ウォッチで確認`}
                                            >
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>選挙ウォッチで確認</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* 比例代表ブロック */}
            <Card>
              <CardHeader>
                <CardTitle>比例代表ブロック登録状況</CardTitle>
                <CardDescription>比例代表の候補者登録状況</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={selectedProportionalBlock}
                  onValueChange={setSelectedProportionalBlock}
                >
                  <ScrollArea className="h-12 whitespace-nowrap">
                    <TabsList className="w-full inline-flex">
                      {proportionalBlocks.map((block) => (
                        <TabsTrigger key={block} value={block}>
                          {block}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  {proportionalBlocks.map((block) => {
                    const candidates = proportionalStatus[block] || [];
                    const totalSeats =
                      proportionalBlockSeats[
                        block as keyof typeof proportionalBlockSeats
                      ] || 0;

                    return (
                      <TabsContent key={block} value={block}>
                        <div className="p-4 mb-4 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{block}ブロック</p>
                              <p className="text-sm text-gray-500">
                                定数: {totalSeats}名
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleSelectProportionalBlock(block)
                                }
                              >
                                このブロックで登録
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={getProportionalElectionWatchUrl(
                                        block
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                                      title={`選挙ウォッチで確認`}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>選挙ウォッチで確認</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm flex items-center">
                              <Info className="h-4 w-4 mr-1" />
                              現在の登録候補者数: {candidates.length}名
                            </p>
                          </div>
                        </div>

                        {candidates.length > 0 ? (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>候補者名</TableHead>
                                  <TableHead>政党</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {candidates.map((candidate) => (
                                  <TableRow key={candidate._id}>
                                    <TableCell>{candidate.name}</TableCell>
                                    <TableCell>{candidate.party}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>
                              このブロックにはまだ候補者が登録されていません
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
