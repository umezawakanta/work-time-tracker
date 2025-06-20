import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';

const SystemSharingPlatform: React.FC = () => {
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
