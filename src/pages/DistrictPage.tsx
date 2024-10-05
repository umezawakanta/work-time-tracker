import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

export default function DistrictPage() {
  const { prefecture, district } = useParams<{
    prefecture: string;
    district: string;
  }>();
  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates
  );

  const districtCandidates = candidates.filter(
    (c) =>
      c.prefecture === prefecture &&
      c.district === parseInt(district || "0", 10)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {prefecture} 第{district}区
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>候補者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {districtCandidates.map((candidate) => (
              <div key={candidate._id} className="flex items-center space-x-4">
                <div
                  className={`party-color-bar party-color-${candidate.party}`}
                />
                <div className="flex-grow">
                  <div className="font-medium">{candidate.name}</div>
                  <div className="text-sm text-gray-500">{candidate.party}</div>
                </div>
                <InfoIcon className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
