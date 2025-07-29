import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';
import OperationsDashboard from '@/pages/OperationsDashboard';
import DeveloperDashboard from '@/pages/DeveloperDashboard';
import SalesDashboard from '@/pages/SalesDashboard';
import FinanceDashboard from '@/pages/FinanceDashboard';
import LegalDashboard from '@/pages/LegalDashboard';
import RoleDashboardSelector from '@/components/ui/RoleDashboardSelector';

// その他の既存ページインポート
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import IntegratedDashboard from '@/pages/IntegratedDashboard';
import SiteImprovementPlan from '@/pages/SiteImprovementPlan';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 基本ルート */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<IntegratedDashboard />} />
      <Route path="/improvement-plan" element={<SiteImprovementPlan />} />

      {/* 役割別ダッシュボード選択 */}
      <Route path="/role-dashboards" element={<RoleDashboardSelector />} />

      {/* 役割別ダッシュボード */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/operations-dashboard" element={<OperationsDashboard />} />
      <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
      <Route path="/sales-dashboard" element={<SalesDashboard />} />
      <Route path="/finance-dashboard" element={<FinanceDashboard />} />
      <Route path="/legal-dashboard" element={<LegalDashboard />} />

      {/* デフォルトルート */}
      <Route path="/" element={<IntegratedDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
