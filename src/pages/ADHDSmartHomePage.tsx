import React from 'react';
import { ADHDSmartHome } from '@/components/ADHDSmartHome';

export default function ADHDSmartHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <ADHDSmartHome />
      </div>
    </div>
  );
}
