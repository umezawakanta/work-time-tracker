import PoliticalChart from '@/components/chart/PoliticalChart';

export default function PoliticalTrends() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">政党支持率トレンド</h1>
      <div className="w-full h-[600px] bg-black rounded-lg shadow-lg overflow-hidden">
        <PoliticalChart />
      </div>
    </div>
  );
}