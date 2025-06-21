import React from 'react';
import { Team } from '@/types/team';

interface TeamManagementProps {
  team: Team;
  onTeamUpdate?: (team: Team) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = () => {
  // TODO: 実装を追加
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">チーム管理</h2>
      <p className="text-gray-600">機能実装予定</p>
    </div>
  );
};
