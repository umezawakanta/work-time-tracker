import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="mb-8 text-gray-600">お探しのページは存在しないか、移動した可能性があります。</p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/">
          <Button aria-label="ホームに戻る">ホームに戻る</Button>
        </Link>
        <Link to="/ai-assistant">
          <Button
            aria-label="AI秘書に相談"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          >
            AI秘書に相談
          </Button>
        </Link>
      </div>
    </div>
  );
}
