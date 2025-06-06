import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  onStepChange: (step: string) => void;
  onStartTrial: () => void;
  isLoggedIn: boolean;
}

export const PlanDialog: React.FC<PlanDialogProps> = ({ isOpen, onClose, onStartTrial }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">プラン選択</h2>
          <button onClick={onStartTrial} className="bg-blue-600 text-white px-4 py-2 rounded">
            無料トライアル開始
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
