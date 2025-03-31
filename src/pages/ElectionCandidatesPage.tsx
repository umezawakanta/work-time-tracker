import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; // Next.jsのLinkを React RouterのLinkに変更
import { AppDispatch, RootState } from "../store";
import {
  fetchCandidates,
  subscribeToUpdates,
  unsubscribeFromUpdates,
} from "../store/candidateSlice";
import DistrictCandidatesList from "@/components/list/DistrictCandidatesList";
import CandidateCharts from "@/components/chart/CandidateCharts";
import CandidateEditForm from "@/components/forms/CandidateEditForm";
import CandidateDetailView from "@/components/detail/CandidateDetailView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { RefreshCcw, Download } from "lucide-react";
import { exportCandidatesAsCSV } from "@/utils/export";
import { useNavigate, useLocation } from "react-router-dom"; // Next.jsのuseRouterの代わりにReact Routerのフックを使用
import { Candidate } from "@/types";

export default function ElectionCandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // useRouterの代わりにuseNavigateを使用
  const location = useLocation(); // クエリパラメータ取得用
  const { user, isSubscribed, isLoading: authLoading } = useAuthStatus();

  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates
  );
  const status = useSelector((state: RootState) => state.candidate.status);
  const error = useSelector((state: RootState) => state.candidate.error);
  const lastUpdated = useSelector(
    (state: RootState) => state.candidate.lastUpdated
  );

  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(
    ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("charts");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 候補者データの初回ロード
  useEffect(() => {
    dispatch(fetchCandidates());
  }, [dispatch]);

  // リアルタイム更新の購読設定
  useEffect(() => {
    // サブスクリプションユーザーのみリアルタイム更新を有効化
    if (isSubscribed) {
      dispatch(subscribeToUpdates());
    }

    return () => {
      dispatch(unsubscribeFromUpdates());
    };
  }, [dispatch, isSubscribed]);

  // 都道府県の初期選択
  useEffect(() => {
    if (candidates.length > 0 && !selectedPrefecture) {
      setSelectedPrefecture(candidates[0].prefecture);

      // URLから指定があれば、その都道府県を選択
      const searchParams = new URLSearchParams(location.search);
      const prefecture = searchParams.get("prefecture");

      if (prefecture) {
        const validPrefecture = candidates.some(
          (c) => c.prefecture === prefecture
        );
        if (validPrefecture) {
          setSelectedPrefecture(prefecture);
        }
      }
    }
  }, [candidates, selectedPrefecture, location.search]);

  const handleEditCandidate = (candidate: Candidate) => {
    if (!isSubscribed && !user?.isAdmin) {
      navigate("/subscription"); // router.pushの代わりにnavigate
      return;
    }
    setEditingCandidate(candidate);
    setViewingCandidate(null);
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setViewingCandidate(candidate);
    setEditingCandidate(null);
  };

  const handleCancelEdit = () => {
    setEditingCandidate(null);
  };

  const handleEditSuccess = () => {
    setEditingCandidate(null);
    refreshData();
  };

  const handleCloseDetailView = () => {
    setViewingCandidate(null);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await dispatch(fetchCandidates());
    setIsRefreshing(false);
  };

  const handleExportData = () => {
    if (!isSubscribed) {
      navigate("/subscription"); // router.pushの代わりにnavigate
      return;
    }

    const filteredCandidates = selectedPrefecture
      ? candidates.filter((c) => c.prefecture === selectedPrefecture)
      : candidates;

    exportCandidatesAsCSV(filteredCandidates);
  };

  // ローディング表示
  if (status === "loading" || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-24" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (status === "failed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>
            {error ||
              "データの取得中に問題が発生しました。しばらく経ってから再度お試しください。"}
            <Button variant="outline" onClick={refreshData} className="mt-4">
              再読み込み
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">
        衆議院選挙 候補者擁立状況
      </h1>

      {lastUpdated && (
        <p className="text-sm text-gray-500 text-center mb-4">
          最終更新: {new Date(lastUpdated).toLocaleString("ja-JP")}
        </p>
      )}

      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex gap-2">
          <Link to="/candidate-registration">
            <Button>候補者登録</Button>
          </Link>

          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            更新
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            CSVエクスポート
            {!isSubscribed && (
              <span className="ml-1 text-xs">(サブスク限定)</span>
            )}
          </Button>

          {!isSubscribed && !user?.isAdmin && (
            <Link to="/subscription">
              <Button variant="secondary">プレミアム会員になる</Button>
            </Link>
          )}
        </div>
      </div>

      {!isSubscribed && !user?.isAdmin && (
        <Alert className="mb-6">
          <AlertTitle>一部機能が制限されています</AlertTitle>
          <AlertDescription>
            データの編集、エクスポート、詳細分析機能を利用するには、プレミアム会員にご登録ください。
            <Link to="/subscription">
              <Button variant="link" className="p-0 h-auto">
                詳細を見る
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="charts"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">グラフ</TabsTrigger>
          <TabsTrigger value="list">候補者一覧</TabsTrigger>
          <TabsTrigger
            value="analysis"
            disabled={!isSubscribed && !user?.isAdmin}
          >
            詳細分析
            {!isSubscribed && !user?.isAdmin && (
              <span className="ml-1 text-xs">(サブスク限定)</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <CandidateCharts
            candidates={candidates}
            selectedPrefecture={selectedPrefecture || ""}
            onPrefectureChange={setSelectedPrefecture}
            isPremium={isSubscribed || !!user?.isAdmin}
          />
        </TabsContent>

        <TabsContent value="list">
          {editingCandidate ? (
            <CandidateEditForm
              candidate={editingCandidate}
              onCancel={handleCancelEdit}
              onSuccess={handleEditSuccess}
            />
          ) : viewingCandidate ? (
            <CandidateDetailView
              candidate={viewingCandidate}
              onClose={handleCloseDetailView}
              onEdit={() => handleEditCandidate(viewingCandidate)}
              isPremium={isSubscribed || !!user?.isAdmin}
            />
          ) : (
            <DistrictCandidatesList
              candidates={candidates}
              selectedPrefecture={selectedPrefecture || ""}
              selectedDistrict={selectedDistrict}
              onPrefectureChange={setSelectedPrefecture}
              onDistrictChange={setSelectedDistrict}
              onEditCandidate={handleEditCandidate}
              onViewCandidate={handleViewCandidate}
              isPremium={isSubscribed || !!user?.isAdmin}
            />
          )}
        </TabsContent>

        <TabsContent value="analysis">
          {isSubscribed || user?.isAdmin ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">詳細分析</h2>
              {/* ここに詳細分析コンポーネントが入る */}
              <p>この機能は現在開発中です。もうしばらくお待ちください。</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">
                プレミアム会員限定機能
              </h3>
              <p className="mb-6">
                詳細分析機能を利用するには、プレミアム会員にご登録ください。
              </p>
              <Link to="/subscription">
                <Button>プレミアム会員登録</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
