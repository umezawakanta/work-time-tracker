import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export interface KeyFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * キー機能カードコンポーネント
 * 主要な機能をアイコン付きで表示します
 */
export const KeyFeatureCard: React.FC<KeyFeatureCardProps> = ({ 
  title, 
  description, 
  icon 
}) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="mb-2">{icon}</div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">{description}</p>
    </CardContent>
  </Card>
);