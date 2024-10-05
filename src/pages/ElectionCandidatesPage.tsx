import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link"; // Add this import
import { AppDispatch, RootState } from "../store";
import { fetchCandidates } from "../store/candidateSlice";
import DistrictCandidatesList from "@/components/list/DistrictCandidatesList";
import CandidateCharts from "@/components/chart/CandidateCharts";
import { Button } from "@/components/ui/button";

export default function ElectionCandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates
  );
  const status = useSelector((state: RootState) => state.candidate.status);
  const error = useSelector((state: RootState) => state.candidate.error);

  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("");

  useEffect(() => {
    dispatch(fetchCandidates());
  }, [dispatch]);

  useEffect(() => {
    if (candidates.length > 0 && !selectedPrefecture) {
      setSelectedPrefecture(candidates[0].prefecture);
    }
  }, [candidates, selectedPrefecture]);

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

      <Link href="/candidate-registration">
        <Button>候補者登録</Button>
      </Link>

      <CandidateCharts candidates={candidates} />

      <div className="mt-12">
        <DistrictCandidatesList
          candidates={candidates}
          selectedPrefecture={selectedPrefecture}
          onPrefectureChange={setSelectedPrefecture}
        />
      </div>
    </div>
  );
}
