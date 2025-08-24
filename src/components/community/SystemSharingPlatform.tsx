import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share } from 'lucide-react';

// Mock data and types
interface CommunityTemplate {
  id: string;
  name: string;
  description: string;
}

const CommunityTemplateCard = ({
  template,
  onUse,
  onLike,
}: {
  template: CommunityTemplate;
  onUse: () => void;
  onLike: () => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{template.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{template.description}</p>
      <div className="flex gap-2 mt-4">
        <Button onClick={onUse} size="sm">
          使用
        </Button>
        <Button onClick={onLike} variant="outline" size="sm">
          いいね
        </Button>
      </div>
    </CardContent>
  </Card>
);

const SystemSharingPlatform: React.FC = () => {
  const [_shareModalOpen, setShareModalOpen] = useState(false);
  const [communityTemplates] = useState<CommunityTemplate[]>([]);

  const handleUseTemplate = (template: CommunityTemplate) => {
    console.log('Using template:', template);
  };

  const handleLikeTemplate = (template: CommunityTemplate) => {
    console.log('Liking template:', template);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">コミュニティシステム</h2>
        <Button onClick={() => setShareModalOpen(true)}>
          <Share className="h-4 w-4 mr-2" />
          自分の仕組みを共有
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityTemplates.map((template) => (
          <CommunityTemplateCard
            key={template.id}
            template={template}
            onUse={() => handleUseTemplate(template)}
            onLike={() => handleLikeTemplate(template)}
          />
        ))}
      </div>
    </div>
  );
};

export default SystemSharingPlatform;
