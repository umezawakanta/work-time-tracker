import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/">
          <Button aria-label="ホームに戻る">ホームに戻る</Button>
        </Link>
        <Link to="/ai-assistant">
          <Button variant="outline" aria-label="AI秘書に相談">
            AI秘書に相談
          </Button>
        </Link>
      </div>
    </div>
  );
}
