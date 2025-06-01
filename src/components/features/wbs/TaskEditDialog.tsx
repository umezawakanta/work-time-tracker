import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WBSNode } from '@/types/wbs';

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WBSNode | null;
  onSave: (nodeId: string, updates: Partial<WBSNode>) => Promise<void>;
  onAIAnalyze?: (task: WBSNode) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <p>Task Edit Dialog - Coming Soon</p>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
