import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { surveyApi } from '@/services/api/surveyApi';
import { partyApi } from '@/services/api/partyApi';
import { SupportRate, PoliticalParty, Survey } from '@/types/survey';

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

interface SurveyResponse {
  surveys: Survey[];
  supportRates: SupportRate[];
}

const PoliticalChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyResponse, partiesResponse] = await Promise.all([
          surveyApi.getAll(),
          partyApi.getAll()
        ]);

        const surveyData = surveyResponse.data as unknown as SurveyResponse;
        setParties(partiesResponse.data);

        const formattedData = surveyData.surveys.map(survey => {
          const dataPoint: ChartDataPoint = {
            date: new Date(survey.surveyEndDate).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit'
            }).replace('/', '/')
          };

          const surveyRates = surveyData.supportRates.filter(
            rate => rate.surveyId === survey._id
          );

          surveyRates.forEach((rate: SupportRate) => {
            const party = partiesResponse.data.find(p => p._id === rate.partyId);
            if (party) {
              dataPoint[party.shortName] = rate.supportRate;
            }
          });

          return dataPoint;
        });

        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-[600px] bg-black p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
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
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PoliticalChart;