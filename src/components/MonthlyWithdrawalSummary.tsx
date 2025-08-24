import { useMemo } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { WithdrawalEntry } from '@/store/withdrawalSlice';

interface MonthlyWithdrawalSummaryProps {
  withdrawals: WithdrawalEntry[];
  currentMonth: Date;
}

export function MonthlyWithdrawalSummary({
  withdrawals,
  currentMonth,
}: MonthlyWithdrawalSummaryProps) {
  const totalWithdrawal = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return withdrawals
      .filter((withdrawal) => {
        const withdrawalDate = parseISO(withdrawal.date);
        return withdrawalDate >= monthStart && withdrawalDate <= monthEnd;
      })
      .reduce((total, withdrawal) => total + withdrawal.amount, 0);
  }, [withdrawals, currentMonth]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">当月の引き落とし合計</h3>
      <p className="text-2xl font-bold text-red-600">{totalWithdrawal.toLocaleString()}円</p>
    </div>
  );
}
