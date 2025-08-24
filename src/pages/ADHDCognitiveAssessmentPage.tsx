import React from 'react';
import { ADHDCognitiveAssessment } from '@/components/cognitive/ADHDCognitiveAssessment';

export default function ADHDCognitiveAssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <ADHDCognitiveAssessment />
      </div>
    </div>
  );
}
