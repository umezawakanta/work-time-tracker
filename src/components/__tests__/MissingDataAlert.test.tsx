import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MissingDataAlert from '../MissingDataAlert';

describe('MissingDataAlert', () => {
  it('renders nothing when missingData is empty', () => {
    const { container } = render(<MissingDataAlert missingData={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders alert when missingData is provided', () => {
    const missingData = {
      テレビ: ['2024-01', '2024-02'],
    };

    render(<MissingDataAlert missingData={missingData} />);

    expect(screen.getByText('調査データの欠落情報')).toBeInTheDocument();
    expect(screen.getByText('テレビ')).toBeInTheDocument();
    expect(screen.getByText('未調査の月: 2024-01, 2024-02')).toBeInTheDocument();
  });

  it('renders multiple media types with missing data', () => {
    const missingData = {
      テレビ: ['2024-01', '2024-02'],
      ラジオ: ['2024-03'],
      新聞: ['2024-01', '2024-03', '2024-04'],
    };

    render(<MissingDataAlert missingData={missingData} />);

    expect(screen.getByText('調査データの欠落情報')).toBeInTheDocument();

    // Check all media types are displayed
    expect(screen.getByText('テレビ')).toBeInTheDocument();
    expect(screen.getByText('ラジオ')).toBeInTheDocument();
    expect(screen.getByText('新聞')).toBeInTheDocument();

    // Check all missing months are displayed
    expect(screen.getByText('未調査の月: 2024-01, 2024-02')).toBeInTheDocument();
    expect(screen.getByText('未調査の月: 2024-03')).toBeInTheDocument();
    expect(screen.getByText('未調査の月: 2024-01, 2024-03, 2024-04')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const missingData = {
      テレビ: ['2024-01'],
    };

    const { container } = render(<MissingDataAlert missingData={missingData} />);
    const alertDiv = container.firstChild as HTMLElement;

    expect(alertDiv).toHaveClass('bg-yellow-100', 'border-l-4', 'border-yellow-500', 'p-4', 'mb-4');
  });

  it('applies correct text styles', () => {
    const missingData = {
      テレビ: ['2024-01'],
    };

    render(<MissingDataAlert missingData={missingData} />);

    const title = screen.getByText('調査データの欠落情報');
    expect(title).toHaveClass('text-yellow-700', 'font-bold', 'mb-2');

    const mediaName = screen.getByText('テレビ');
    expect(mediaName).toHaveClass('font-semibold', 'text-yellow-800');

    const monthsText = screen.getByText('未調査の月: 2024-01');
    expect(monthsText).toHaveClass('text-yellow-700', 'ml-2');
  });

  it('handles single month correctly', () => {
    const missingData = {
      ラジオ: ['2024-12'],
    };

    render(<MissingDataAlert missingData={missingData} />);

    expect(screen.getByText('ラジオ')).toBeInTheDocument();
    expect(screen.getByText('未調査の月: 2024-12')).toBeInTheDocument();
  });

  it('handles empty months array', () => {
    const missingData = {
      テレビ: [],
    };

    render(<MissingDataAlert missingData={missingData} />);

    expect(screen.getByText('テレビ')).toBeInTheDocument();
    expect(screen.getByText('未調査の月:')).toBeInTheDocument();
  });
});
