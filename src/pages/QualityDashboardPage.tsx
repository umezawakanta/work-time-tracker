import React from 'react';
import { QualityDashboard } from '@/components/quality/QualityDashboard';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const QualityDashboardPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <QualityDashboard />
      </div>
    </ErrorBoundary>
  );
};

export default QualityDashboardPage;
