import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { setTrialActivated } from '@/store/userSlice';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import { DashboardWidgets } from '@/components/home/DashboardWidgets';
import { FeatureGrid } from '@/components/home/FeatureGrid';
import { useAuth } from '@/context/useAuth';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);
  const trialActivated = useSelector((state: RootState) => state.user.trialActivated);

  const [showGetStartedDialog, setShowGetStartedDialog] = useState(false);
  const [currentDialogStep, setCurrentDialogStep] = useState('intro');

  // ToDoデータの初期化
  useEffect(() => {
    if (isAuthenticated && isUserLoggedIn) {
      dispatch(fetchTodoItems()).catch((error) => {
        console.error('ToDoデータ取得エラー:', error);
      });
    }
  }, [isAuthenticated, isUserLoggedIn, dispatch]);

  const handleGetStarted = useCallback(() => {
    if (!isUserLoggedIn) {
      setShowGetStartedDialog(true);
      setCurrentDialogStep('intro');
    } else if (hasActiveSubscription) {
      navigate('/work-time');
    } else if (trialActivated) {
      setShowGetStartedDialog(true);
      setCurrentDialogStep('plans');
    } else {
      setShowGetStartedDialog(true);
      setCurrentDialogStep('trial');
    }
  }, [isUserLoggedIn, hasActiveSubscription, trialActivated, navigate]);

  const handleStartTrial = useCallback(() => {
    dispatch(setTrialActivated(true));
    setShowGetStartedDialog(false);
    navigate('/work-time');
  }, [dispatch, navigate]);

  // 未ログイン時の表示
  if (!isUserLoggedIn) {
    return (
      <div className="min-h-screen">
        <WelcomeSection onGetStarted={handleGetStarted} />

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">主な機能</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                LifeSyncは生産性向上のための包括的なツールセットを提供します
              </p>
            </div>
            <FeatureGrid />
          </div>
        </section>

        {/* Remove PlanDialog usage or create a simple inline dialog */}
      </div>
    );
  }

  // ログイン済み時の表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LifeSync
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            時間管理から資産管理まで、あなたの生活を最適化するオールインワンプラットフォーム
          </p>
        </header>

        <DashboardWidgets isPremium={hasActiveSubscription} />
        <FeatureGrid />

        {/* Remove PlanDialog usage or create a simple inline dialog */}
      </div>
    </div>
  );
};

export default Home;
