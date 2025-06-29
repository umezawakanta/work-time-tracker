import React from 'react';
import { useInternationalization } from '@/hooks/useInternationalization';
import { LanguageSwitcher } from '@/components/internationalization/LanguageSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LanguageTest: React.FC = () => {
  const { locale, t } = useInternationalization();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🌍 Language Test Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Switcher */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Language Switcher:</h3>
            <LanguageSwitcher variant="button" />
          </div>

          {/* Current Language */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Language:</h3>
            <p className="text-sm text-muted-foreground">
              Locale: <code>{locale}</code>
            </p>
          </div>

          {/* Translated Text Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Translated Text Examples:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Navigation:</strong>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Dashboard: {t('navigation.dashboard')}</li>
                  <li>Tasks: {t('navigation.tasks')}</li>
                  <li>Analytics: {t('navigation.analytics')}</li>
                  <li>Reports: {t('navigation.reports')}</li>
                </ul>
              </div>
              <div>
                <strong>Common:</strong>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Save: {t('common.save')}</li>
                  <li>Cancel: {t('common.cancel')}</li>
                  <li>Edit: {t('common.edit')}</li>
                  <li>Delete: {t('common.delete')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Task Management */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Task Management:</h3>
            <div className="text-sm space-y-1">
              <p>Title: {t('tasks.title')}</p>
              <p>Create: {t('tasks.create')}</p>
              <p>Priority High: {t('tasks.priority.high')}</p>
              <p>Status Completed: {t('tasks.status.completed')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
