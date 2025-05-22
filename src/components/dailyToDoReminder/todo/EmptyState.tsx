import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CheckCircle,
  Target,
  Sparkles,
  BookOpen,
  Lightbulb,
} from "lucide-react";

interface EmptyStateProps {
  readonly isPremium?: boolean;
  readonly onAnalyzeRequest?: () => void;
}

/**
 * Empty State Component
 * Displays when no todos are available with helpful CTAs
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  isPremium = false,
  onAnalyzeRequest,
}) => {
  const suggestions = [
    { icon: BookOpen, text: "今日読む本の章を決める", type: "input" as const },
    {
      icon: Plus,
      text: "プロジェクトの次のステップを計画",
      type: "output" as const,
    },
    { icon: Target, text: "週次レビューを実施", type: "input" as const },
    {
      icon: Lightbulb,
      text: "新しいアイデアをブレインストーミング",
      type: "output" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Empty State */}
      <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              今日のタスクがありません
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              新しいタスクを追加して、生産性を高めましょう。
              インプットとアウトプットのバランスを意識することで、
              より効果的な学習と成長が期待できます。
            </p>
          </div>

          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            最初のタスクを追加
          </Button>
        </CardContent>
      </Card>

      {/* Task Suggestions */}
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Lightbulb className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
            <h4 className="font-medium text-gray-900">タスクのヒント</h4>
            <p className="text-sm text-gray-600">
              こんなタスクはいかがですか？クリックして追加できます
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // This would trigger the add form with pre-filled data
                  console.log(`Add suggestion: ${suggestion.text}`);
                }}
              >
                <suggestion.icon
                  className={`h-4 w-4 ${
                    suggestion.type === "input"
                      ? "text-blue-500"
                      : "text-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {suggestion.text}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        suggestion.type === "input"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {suggestion.type === "input"
                        ? "インプット"
                        : "アウトプット"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features Showcase */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Sparkles className="h-6 w-6 mx-auto text-amber-600 mb-2" />
              <h4 className="font-medium text-amber-900">
                Premiumで更に便利に
              </h4>
              <p className="text-sm text-amber-700">
                AI分析、高度なフィルタリング、カスタムカテゴリなど
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                <Target className="h-5 w-5 mx-auto text-amber-600 mb-2" />
                <h5 className="text-sm font-medium text-amber-900">AI分析</h5>
                <p className="text-xs text-amber-700">
                  タスクパターンを分析し最適化提案
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                <CheckCircle className="h-5 w-5 mx-auto text-amber-600 mb-2" />
                <h5 className="text-sm font-medium text-amber-900">
                  無制限タスク
                </h5>
                <p className="text-xs text-amber-700">制限なしでタスクを管理</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                <Lightbulb className="h-5 w-5 mx-auto text-amber-600 mb-2" />
                <h5 className="text-sm font-medium text-amber-900">
                  カスタム機能
                </h5>
                <p className="text-xs text-amber-700">
                  カテゴリ、タグ、期限設定
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={onAnalyzeRequest}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Premiumを試してみる
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="text-center text-sm text-gray-500">
        <p>
          💡 生産性のコツ:
          インプット（学習）とアウトプット（実践）を7:3のバランスで
        </p>
      </div>
    </div>
  );
};
