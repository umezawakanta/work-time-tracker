import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "../store";
import { fetchCandidates, Candidate } from "../store/candidateSlice";
import DistrictCandidatesList from "@/components/list/DistrictCandidatesList";
import CandidateCharts from "@/components/chart/CandidateCharts";
import CandidateEditForm from "@/components/forms/CandidateEditForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ElectionCandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates
  );
  const status = useSelector((state: RootState) => state.candidate.status);
  const error = useSelector((state: RootState) => state.candidate.error);

  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchCandidates());
  }, [dispatch]);

  useEffect(() => {
    if (candidates.length > 0 && !selectedPrefecture) {
      setSelectedPrefecture(candidates[0].prefecture);
    }
  }, [candidates, selectedPrefecture]);

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
  };

  const handleCancelEdit = () => {
    setEditingCandidate(null);
  };

  const handleEditSuccess = () => {
    setEditingCandidate(null);
    dispatch(fetchCandidates());
  };

  if (status === "loading") {
    return <div>データを読み込んでいます...</div>;
  }

  if (status === "failed") {
    return <div>エラーが発生しました: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        衆議院選挙 候補者擁立状況
      </h1>

      <div className="mb-4">
        <Link href="/candidate-registration">
          <Button>候補者登録</Button>
        </Link>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts">グラフ</TabsTrigger>
          <TabsTrigger value="list">候補者一覧</TabsTrigger>
        </TabsList>
        <TabsContent value="charts">
          <CandidateCharts candidates={candidates} />
        </TabsContent>
        <TabsContent value="list">
          {editingCandidate ? (
            <CandidateEditForm
              candidate={editingCandidate}
              onCancel={handleCancelEdit}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <DistrictCandidatesList
              candidates={candidates}
              selectedPrefecture={selectedPrefecture}
              onPrefectureChange={setSelectedPrefecture}
              onEditCandidate={handleEditCandidate}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
