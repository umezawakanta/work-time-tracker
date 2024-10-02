import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchWorkTimeEntries } from "@/store/workTimeSlice";
import { fetchAssetEntries } from "@/store/assetSlice";
import { fetchDebtEntries } from "@/store/debtSlice";

export const useReportData = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchWorkTimeEntries());
    dispatch(fetchAssetEntries());
    dispatch(fetchDebtEntries());
  }, [dispatch]);
};
