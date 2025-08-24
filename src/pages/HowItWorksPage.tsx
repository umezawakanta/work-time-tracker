import React from 'react';
import HowItWorks from '@/components/hero/HowItWorks';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">仕組みを見る</h1>
        <HowItWorks />
      </div>
    </div>
  );
};

export default HowItWorksPage;
