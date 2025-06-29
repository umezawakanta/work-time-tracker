import { Routes, Route } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import SubscriptionUpgradePage from '@/pages/subscription/SubscriptionUpgradePage';
import BillingHistoryPage from '@/pages/subscription/BillingHistoryPage';

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 現在のタブを判定
  const getCurrentTab = () => {
    if (currentPath.includes('/billing-history')) return 'billing';
    return 'plans';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">サブスクリプション管理</h1>

      <Tabs value={getCurrentTab()} className="mb-8">
        <TabsList>
          <TabsTrigger value="plans" onClick={() => navigate('/subscription-management')}>
            プラン
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            onClick={() => navigate('/subscription-management/billing-history')}
          >
            請求履歴
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Routes>
        <Route path="/" element={<SubscriptionUpgradePage />} />
        <Route path="/billing-history" element={<BillingHistoryPage />} />
      </Routes>
    </div>
  );
}
