import { WBSCreator } from '@/components/WBSCreator';

export default function WBSCreatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">WBS作成ツール</h1>
      <WBSCreator />
    </div>
  );
}
