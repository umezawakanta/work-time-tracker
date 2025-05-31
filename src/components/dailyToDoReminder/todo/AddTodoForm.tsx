import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles } from 'lucide-react';

import { useTodoForm } from './hooks/useTodoForm';
import { TaskNameInput } from './components/TaskNameInput';
import { TaskDescription } from './components/TaskDescription';
import { TaskTypeSelect } from './components/TaskTypeSelect';
import { PrioritySelect } from './components/PrioritySelect';
import { DeadlineInput } from './components/DeadlineInput';
import { DurationInput } from './components/DurationInput';
import { CategorySelect } from './components/CategorySelect';
import { TagsInput } from './components/TagsInput';
import { PrioritizedSwitch } from './components/PrioritizedSwitch';
import { FormActions } from './components/FormActions';

interface AddTodoFormProps {
  readonly isVisible: boolean;
  readonly onClose: () => void;
  readonly isPremium?: boolean;
}

/**
 * Add Todo Form Component
 * Advanced task creation form with premium features
 */
export const AddTodoForm = React.memo<AddTodoFormProps>(
  ({ isVisible, onClose, isPremium = false }) => {
    const {
      formData,
      isSubmitting,
      isAnalyzing,
      handleInputChange,
      handleAIAnalysis,
      handleSubmit,
      handleReset,
    } = useTodoForm(onClose);

    if (!isVisible) return null;

    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" aria-hidden="true" />
              新しいタスクを追加
              {isPremium && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="閉じる">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <TaskNameInput
                value={formData.text}
                onChange={(value) => handleInputChange('text', value)}
                onAIAnalysis={handleAIAnalysis}
                isAnalyzing={isAnalyzing}
                isPremium={isPremium}
              />

              {isPremium && (
                <TaskDescription
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                />
              )}
            </div>

            <Separator />

            {/* Task Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaskTypeSelect
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
              />

              <PrioritySelect
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value)}
              />
            </div>

            {/* Advanced Options (Premium) */}
            {isPremium && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DeadlineInput
                      value={formData.deadline}
                      onChange={(value) => handleInputChange('deadline', value)}
                    />

                    <DurationInput
                      value={formData.estimatedDuration}
                      onChange={(value) => handleInputChange('estimatedDuration', value)}
                    />
                  </div>

                  <CategorySelect
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                  />

                  <TagsInput
                    tags={formData.tags}
                    onChange={(tags) => handleInputChange('tags', tags)}
                  />

                  <PrioritizedSwitch
                    checked={formData.isPrioritized}
                    onChange={(checked) => handleInputChange('isPrioritized', checked)}
                  />
                </div>
              </>
            )}

            <Separator />

            <FormActions onReset={handleReset} onCancel={onClose} isSubmitting={isSubmitting} />
          </form>
        </CardContent>
      </Card>
    );
  }
);

AddTodoForm.displayName = 'AddTodoForm';
