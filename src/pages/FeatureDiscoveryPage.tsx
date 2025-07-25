import React from 'react';
import { FeatureDiscoveryDashboard } from '@/components/FeatureDiscoveryDashboard';
import Layout from '@/components/layout/Layout';

export default function FeatureDiscoveryPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <FeatureDiscoveryDashboard />
      </div>
    </Layout>
  );
}
