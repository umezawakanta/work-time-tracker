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
    // 重複実行を防ぐ
    if (hasInitialized.current) {
      return;
    }

    const initializeData = () => {
      // モックデータ使用により401エラーは発生しないため、シンプルに並列実行
      dispatch(fetchWorkTimeEntries());
      dispatch(fetchAssetEntries());
      dispatch(fetchDebtEntries());

      hasInitialized.current = true;
    };

    initializeData();
  }, [dispatch]);
};
