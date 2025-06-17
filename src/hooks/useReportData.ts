import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchWorkTimeEntries } from '@/store/workTimeSlice';
import { fetchAssetEntries } from '@/store/assetSlice';
import { fetchDebtEntries } from '@/store/debtSlice';

export const useReportData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 開発環境での重複実行を防ぐ
    if (hasInitialized.current) {
      return;
    }

    const initializeData = async () => {
      try {
        // 並列実行ではなく順次実行に変更（エラー時の影響を最小化）
        await dispatch(fetchWorkTimeEntries());
        await dispatch(fetchAssetEntries());
        await dispatch(fetchDebtEntries());

        hasInitialized.current = true;
      } catch (error) {
        console.warn('📊 ReportData初期化エラー（一部データの取得に失敗）:', error);
        // エラーがあっても初期化済みとしてマーク（無限ループを防ぐ）
        hasInitialized.current = true;
      }
    };

    initializeData();
  }, [dispatch]);
};
