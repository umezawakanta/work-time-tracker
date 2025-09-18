import React from 'react';
import DiaryReminderComponent from './DiaryReminderComponent';
import DiaryReminderSettings from './DiaryReminderSettings';

interface DiaryReminderIntegrationProps {
  showDiaryReminderSettings: boolean;
  setShowDiaryReminderSettings: (show: boolean) => void;
  diaryReminderSnoozeUntil: number | null;
  setDiaryReminderSnoozeUntil: (time: number | null) => void;
  onOpenDiaryForm: () => void;
}

const DiaryReminderIntegration: React.FC<DiaryReminderIntegrationProps> = ({
  showDiaryReminderSettings,
  setShowDiaryReminderSettings,
  diaryReminderSnoozeUntil,
  setDiaryReminderSnoozeUntil,
  onOpenDiaryForm,
}) => {
  const handleReminderDismiss = () => {
    // 日記フォームを開く
    onOpenDiaryForm();
  };

  const handleReminderSnooze = (minutes: number) => {
    const snoozeUntil = Date.now() + (minutes * 60 * 1000);
    setDiaryReminderSnoozeUntil(snoozeUntil);
  };

  const handleReminderDisable = () => {
    const settings = JSON.parse(localStorage.getItem('diaryReminderSettings') || '{}');
    settings.enabled = false;
    localStorage.setItem('diaryReminderSettings', JSON.stringify(settings));
  };

  return (
    <>
      <DiaryReminderComponent
        onReminderDismiss={handleReminderDismiss}
        onReminderSnooze={handleReminderSnooze}
        onReminderDisable={handleReminderDisable}
      />
      
      {showDiaryReminderSettings && (
        <DiaryReminderSettings
          onClose={() => setShowDiaryReminderSettings(false)}
        />
      )}
    </>
  );
};

export default DiaryReminderIntegration;
