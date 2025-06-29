import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link to="/">
        <Button>ホームに戻る</Button>
      </Link>
    </div>
  );
}
