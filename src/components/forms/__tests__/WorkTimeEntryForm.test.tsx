import React from 'react';
import { render, screen } from '../../../test/test-utils';
import WorkTimeEntryForm from '../WorkTimeEntryForm';

test('renders WorkTimeEntryForm', () => {
  render(<WorkTimeEntryForm />, {
    initialState: {
      workTime: {
        entries: [],
        isLoading: false,
        error: null,
        workState: null,
      },
    },
  });

  expect(screen.getByText('作業時間の記録')).toBeInTheDocument();
  expect(screen.getByLabelText('プロジェクト名')).toBeInTheDocument();
  expect(screen.getByLabelText('作業内容')).toBeInTheDocument();
  expect(screen.getByLabelText('開始時間')).toBeInTheDocument();
  expect(screen.getByLabelText('終了時間')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '記録を保存' })).toBeInTheDocument();
});

// Add more tests for form submission, validation, etc.
