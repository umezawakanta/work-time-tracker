import React from 'react';
import { ADHDTaskManager } from '@/components/cognitive/ADHDTaskManager';

export default function ADHDTaskManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <ADHDTaskManager />
      </div>
    </div>
  );
}
