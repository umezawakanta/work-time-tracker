import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/store/candidateSlice";
import { InfoIcon, Edit2Icon } from "lucide-react";

interface DistrictCandidatesListProps {
  candidates: Candidate[];
  selectedPrefecture: string;
  onPrefectureChange: (prefecture: string) => void;
  onEditCandidate: (candidate: Candidate) => void;
}

export default function DistrictCandidatesList({
  candidates,
  selectedPrefecture,
  onPrefectureChange,
  onEditCandidate,
}: DistrictCandidatesListProps) {
  const districts = Array.from(new Set(candidates.map((c) => c.district))).sort(
    (a, b) => a - b
  );
  const prefectures = Array.from(
    new Set(candidates.map((c) => c.prefecture))
  ).sort();

  const filteredCandidates = candidates.filter(
    (c) => c.prefecture === selectedPrefecture
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          選挙ウォッチ 次期衆院選
        </CardTitle>
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Select value={selectedPrefecture} onValueChange={onPrefectureChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="都道府県を選択" />
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
      </CardHeader>
      <CardContent>
        {districts.map((district) => {
          const districtCandidates = filteredCandidates.filter(
            (c) => c.district === district
          );
          if (districtCandidates.length === 0) return null;

          return (
            <div key={district} className="mb-8">
              <Link to={`/district/${selectedPrefecture}/${district}`}>
                <h3 className="text-xl font-semibold mb-4 hover:text-blue-600 cursor-pointer">
                  {selectedPrefecture} 第{district}区
                </h3>
              </Link>
              <div className="space-y-4">
                {districtCandidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="flex items-center space-x-4"
                  >
                    <div
                      className={`party-color-bar party-color-${candidate.party}`}
                    />
                    <div className="flex-grow">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-gray-500">
                        {candidate.party}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCandidate(candidate)}
                    >
                      <Edit2Icon className="w-4 h-4 mr-2" />
                      編集
                    </Button>
                    <InfoIcon className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
