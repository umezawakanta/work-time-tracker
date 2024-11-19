import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { surveyApi } from '@/services/api/surveyApi';
import { partyApi } from '@/services/api/partyApi';
import { SupportRate, PoliticalParty, Survey } from '@/types/survey';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface ChartDataPoint {
  surveyId: string;
  date: string;
  [key: string]: string | number;
}

interface SurveyResponseData {
  surveys: Survey[];
  supportRates: Array<SupportRate & {
    partyId: {
      _id: string;
      name: string;
      shortName: string;
    };
  }>;
}

const PoliticalChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchSurveyData = async () => {
    try {
      const [surveyResponse, partiesResponse] = await Promise.all([
        surveyApi.getAll(),
        partyApi.getAll()
      ]);

      setParties(partiesResponse.data);

      const data = surveyResponse.data as unknown as SurveyResponseData;
      const formattedData = data.surveys.map(survey => {
        const dataPoint: ChartDataPoint = {
          surveyId: survey._id,
          date: new Date(survey.surveyEndDate).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit'
          }).replace('/', '/')
        };

        const surveyRates = data.supportRates.filter(rate => rate.surveyId === survey._id);
        surveyRates.forEach(rate => {
          dataPoint[rate.partyId.shortName] = rate.supportRate;
        });

        return dataPoint;
      });

      const sortedData = formattedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setChartData(sortedData);
    } catch {
      toast.error('データの取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const handleDataClick = (data: ChartDataPoint) => {
    setSelectedSurveyId(data.surveyId);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSurveyId) return;

    try {
      await surveyApi.deleteSurvey(selectedSurveyId);
      toast.success('データを削除しました');
      await fetchSurveyData();
      setIsEditDialogOpen(false);
    } catch {
      toast.error('データの削除に失敗しました');
    }
  };

  const selectedData = chartData.find(data => data.surveyId === selectedSurveyId);

  return (
    <div>
      <div className="w-full h-[600px] bg-black p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            onClick={(e) => e?.activePayload && handleDataClick(e.activePayload[0].payload as ChartDataPoint)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#fff" tick={{ fill: '#fff' }} />
            <YAxis stroke="#fff" tick={{ fill: '#fff' }} domain={[0, 35]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#333',
                border: '1px solid #666',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {parties.map(party => (
              <Line
                key={party._id}
                type="monotone"
                dataKey={party.shortName}
                stroke={party.colorCode}
                dot={true}
                label={{
                  position: 'top',
                  fill: party.colorCode,
                  fontSize: 12,
                  formatter: (value: number) => `${value}%`
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>データ編集</DialogTitle>
          </DialogHeader>
          {selectedData && (
            <div className="space-y-4">
              <p>日付: {selectedData.date}</p>
              {Object.entries(selectedData)
                .filter(([key]) => !['date', 'surveyId'].includes(key))
                .map(([party, value]) => (
                  <div key={party} className="flex items-center justify-between">
                    <span>{party}:</span>
                    <span>{value}%</span>
                  </div>
                ))}
              <div className="flex justify-end space-x-2">
                <Button variant="destructive" onClick={handleDelete}>
                  削除
                </Button>
                <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoliticalChart;