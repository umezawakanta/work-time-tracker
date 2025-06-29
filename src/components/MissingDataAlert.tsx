import React from 'react';

interface MissingDataAlertProps {
  missingData: {
    [media: string]: string[];
  };
}

const MissingDataAlert: React.FC<MissingDataAlertProps> = ({ missingData }) => {
  if (Object.keys(missingData).length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
      <h3 className="text-yellow-700 font-bold mb-2">調査データの欠落情報</h3>
      {Object.entries(missingData).map(([media, months]) => (
        <div key={media} className="mb-2">
          <span className="font-semibold text-yellow-800">{media}</span>
          <span className="text-yellow-700 ml-2">未調査の月: {months.join(', ')}</span>
        </div>
      ))}
    </div>
  );
};

export default MissingDataAlert;
