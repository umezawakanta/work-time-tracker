import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InfoIcon } from 'lucide-react';
import HokkaidoMap from '@/components/map/HokkaidoMap';

const partyColors: { [key: string]: string } = {
  自民党: 'bg-red-500',
  立憲民主党: 'bg-blue-500',
  日本維新の会: 'bg-green-500',
  公明党: 'bg-yellow-500',
  共産党: 'bg-pink-500',
  国民民主党: 'bg-cyan-500',
  社民党: 'bg-orange-500',
  れいわ新選組: 'bg-teal-500',
  参政党: 'bg-purple-500',
  無所属: 'bg-gray-500',
};

export default function DistrictPage() {
  const { prefecture, district: initialDistrict } = useParams<{
    prefecture: string;
    district: string;
  }>();
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const navigate = useNavigate();
  const candidates = useSelector((state: RootState) => state.candidate.candidates);

  const prefectureCandidates = candidates.filter((c) => c.prefecture === prefecture);

  const districts = Array.from(
    new Set(prefectureCandidates.map((c) => c.district).filter((d): d is number => d !== null))
  ).sort((a, b) => a - b);

  const districtCandidates = prefectureCandidates.filter((c) => c.district === selectedDistrict);

  useEffect(() => {
    const initialDistrictNumber = parseInt(initialDistrict || '1', 10);
    if (districts.includes(initialDistrictNumber)) {
      setSelectedDistrict(initialDistrictNumber);
    } else if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
      navigate(`/district/${prefecture}/${districts[0]}`, { replace: true });
    }
  }, [initialDistrict, districts, prefecture, navigate]);

  const handleDistrictChange = (district: number) => {
    setSelectedDistrict(district);
    navigate(`/district/${prefecture}/${district}`);
  };

  if (selectedDistrict === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/election-candidates" className="text-blue-600 hover:underline mb-4 block">
        ← 選挙区一覧に戻る
      </Link>
      <div className="bg-blue-100 p-8 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">選挙ウォッチ 次期衆院選</h1>
        <div className="flex justify-center items-center space-x-2">
          <Select
            value={selectedDistrict.toString()}
            onValueChange={(value) => handleDistrictChange(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={`${prefecture} 第${selectedDistrict}区`} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d.toString()}>
                  {prefecture} 第{d}区
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <HokkaidoMap
            districts={districts.map((d) => ({ id: d, name: `第${d}区` }))}
            selectedDistrict={selectedDistrict}
            onDistrictSelect={handleDistrictChange}
          />
        </div>
        <div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">選挙区情報</h2>
              <p className="text-sm text-gray-600">
                {prefecture}第{selectedDistrict}区
                {districtCandidates.length > 0
                  ? `には現在${districtCandidates.length}名の候補者が登録されています。`
                  : 'の候補者はまだ登録されていません。'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">予想される顔ぶれ</h2>
      {districtCandidates.length > 0 ? (
        <div className="space-y-4">
          {districtCandidates.map((candidate) => (
            <div
              key={candidate._id}
              className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow"
            >
              <div
                className={`w-6 h-6 rounded-full ${partyColors[candidate.party] || 'bg-gray-500'}`}
              />
              <div className="flex-grow">
                <div className="font-medium">{candidate.name}</div>
                <div className="text-sm text-gray-500">{candidate.party}</div>
              </div>
              <InfoIcon className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      ) : (
        <p>この選挙区の候補者はまだ登録されていません。</p>
      )}
    </div>
  );
}
