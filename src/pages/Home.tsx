import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        作業時間トラッカーへようこそ
      </h1>
      <p className="text-center mb-8">
        効率的に作業時間を管理し、生産性を向上させましょう。
      </p>
      <div className="text-center">
        <Link to="/work-time">
          <Button>作業時間トラッカーを開始</Button>
        </Link>
      </div>
    </div>
  );
}
