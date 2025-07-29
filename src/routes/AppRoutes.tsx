import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';
import OperationsDashboard from '@/pages/OperationsDashboard';
import DeveloperDashboard from '@/pages/DeveloperDashboard';
import SalesDashboard from '@/pages/SalesDashboard';
import RoleDashboardSelector from '@/components/ui/RoleDashboardSelector';

// その他の既存ページインポート
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import SiteImprovementPlan from '@/pages/SiteImprovementPlan';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 基本ルート */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/improvement-plan" element={<SiteImprovementPlan />} />

      {/* 役割別ダッシュボード選択 */}
      <Route path="/role-dashboards" element={<RoleDashboardSelector />} />

      {/* 役割別ダッシュボード */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/operations-dashboard" element={<OperationsDashboard />} />
      <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
      <Route path="/sales-dashboard" element={<SalesDashboard />} />

      {/* デフォルトルート */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes;
