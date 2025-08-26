import React from 'react';

type Props = {
  isWip?: boolean;
  isMock?: boolean;
};

export const StatusBanners: React.FC<Props> = ({ isWip, isMock }) => {
  if (!isWip && !isMock) return null;
  return (
    <div className="space-y-2 mb-3" role="status" aria-live="polite">
      {isWip && (
        <div className="w-full rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          このページは現在開発中です（機能が未完成の部分があります）。
        </div>
      )}
      {isMock && (
        <div className="w-full rounded-md border border-sky-300 bg-sky-50 text-sky-800 px-3 py-2 text-sm">
          一部にダミー/モックデータを表示しています。
        </div>
      )}
    </div>
  );
};

export default StatusBanners;
