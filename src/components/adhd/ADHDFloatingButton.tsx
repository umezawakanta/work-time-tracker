import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useADHDNotifications } from '@/hooks/useADHDNotifications';
import { Brain, Shield, Clock, Eye, X, Zap } from 'lucide-react';

export const ADHDFloatingButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { triggerEmergencyRealityCheck } = useADHDNotifications();

  const quickActions = [
    {
      icon: <Shield className="h-4 w-4" />,
      label: '緊急現実チェック',
      action: () => {
        triggerEmergencyRealityCheck();
        setIsExpanded(false);
      },
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      icon: <Eye className="h-4 w-4" />,
      label: '5-4-3-2-1法',
      action: () => {
        alert(
          '5つ見えるもの、4つ触れるもの、3つ聞こえるもの、2つ匂うもの、1つ味わうものを見つけてください'
        );
        setIsExpanded(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: '2分タイマー',
      action: () => {
        setTimeout(() => alert('2分完了！'), 2 * 60 * 1000);
        alert('2分集中タイマー開始');
        setIsExpanded(false);
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <Card className="mb-4 shadow-lg border-2 border-purple-200">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-800">🧠 ADHD緊急サポート</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white w-full justify-start text-xs h-8`}
                  size="sm"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 rounded-full shadow-lg border-2 border-white
          ${
            isExpanded
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }
          text-white transition-all duration-300 transform hover:scale-110
        `}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
      </Button>
    </div>
  );
};
