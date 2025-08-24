import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '../progress';

describe('Progress Component', () => {
  test('renders progress bar', () => {
    render(<Progress value={50} data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  test('displays correct progress value', () => {
    render(<Progress value={75} data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('relative');
  });

  test('handles zero value', () => {
    render(<Progress value={0} data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('h-2');
  });

  test('handles maximum value', () => {
    render(<Progress value={100} data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('w-full');
  });

  test('handles undefined value', () => {
    render(<Progress data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Progress value={50} className="custom-progress" data-testid="progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('custom-progress');
  });
});
