import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CalendarHeader } from '../CalendarHeader';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
}));

describe('CalendarHeader', () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to have consistent tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with day view', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '今日' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '前の日' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '次の日' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '日' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '週' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '月' })).toBeInTheDocument();
  });

  it('renders correctly with week view', () => {
    render(<CalendarHeader view="week" onViewChange={mockOnViewChange} />);

    expect(screen.getByRole('button', { name: '前の週' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '次の週' })).toBeInTheDocument();
  });

  it('renders correctly with month view', () => {
    render(<CalendarHeader view="month" onViewChange={mockOnViewChange} />);

    expect(screen.getByRole('button', { name: '前の月' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '次の月' })).toBeInTheDocument();
  });

  it('displays current date correctly', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    // Check if date is displayed in Japanese format
    expect(screen.getByText('2024年3月15日')).toBeInTheDocument();
  });

  it.skip('highlights active view button', () => {
    render(<CalendarHeader view="week" onViewChange={mockOnViewChange} />);

    const dayButton = screen.getByRole('button', { name: '日' });
    const weekButton = screen.getByRole('button', { name: '週' });
    const monthButton = screen.getByRole('button', { name: '月' });

    // Week button should be active (default variant)
    expect(weekButton).toHaveAttribute('data-variant', 'default');
    expect(dayButton).toHaveAttribute('data-variant', 'outline');
    expect(monthButton).toHaveAttribute('data-variant', 'outline');
  });

  it('calls onViewChange when view buttons are clicked', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    fireEvent.click(screen.getByRole('button', { name: '週' }));
    expect(mockOnViewChange).toHaveBeenCalledWith('week');

    fireEvent.click(screen.getByRole('button', { name: '月' }));
    expect(mockOnViewChange).toHaveBeenCalledWith('month');

    fireEvent.click(screen.getByRole('button', { name: '日' }));
    expect(mockOnViewChange).toHaveBeenCalledWith('day');
  });

  it('navigates to previous period correctly for day view', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    const prevButton = screen.getByRole('button', { name: '前の日' });
    fireEvent.click(prevButton);

    // Date should change to previous day
    expect(screen.getByText('2024年3月14日')).toBeInTheDocument();
  });

  it('navigates to next period correctly for day view', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    const nextButton = screen.getByRole('button', { name: '次の日' });
    fireEvent.click(nextButton);

    // Date should change to next day
    expect(screen.getByText('2024年3月16日')).toBeInTheDocument();
  });

  it('navigates to previous week correctly for week view', () => {
    render(<CalendarHeader view="week" onViewChange={mockOnViewChange} />);

    const prevButton = screen.getByRole('button', { name: '前の週' });
    fireEvent.click(prevButton);

    // Date should change to previous week
    expect(screen.getByText('2024年3月8日')).toBeInTheDocument();
  });

  it('navigates to next week correctly for week view', () => {
    render(<CalendarHeader view="week" onViewChange={mockOnViewChange} />);

    const nextButton = screen.getByRole('button', { name: '次の週' });
    fireEvent.click(nextButton);

    // Date should change to next week
    expect(screen.getByText('2024年3月22日')).toBeInTheDocument();
  });

  it('navigates to previous month correctly for month view', () => {
    render(<CalendarHeader view="month" onViewChange={mockOnViewChange} />);

    const prevButton = screen.getByRole('button', { name: '前の月' });
    fireEvent.click(prevButton);

    // Date should change to previous month
    expect(screen.getByText('2024年2月15日')).toBeInTheDocument();
  });

  it('navigates to next month correctly for month view', () => {
    render(<CalendarHeader view="month" onViewChange={mockOnViewChange} />);

    const nextButton = screen.getByRole('button', { name: '次の月' });
    fireEvent.click(nextButton);

    // Date should change to next month
    expect(screen.getByText('2024年4月15日')).toBeInTheDocument();
  });

  it('goes to today when today button is clicked', () => {
    render(<CalendarHeader view="month" onViewChange={mockOnViewChange} />);

    // First navigate to different month
    const nextButton = screen.getByRole('button', { name: '次の月' });
    fireEvent.click(nextButton);
    expect(screen.getByText('2024年4月15日')).toBeInTheDocument();

    // Then click today button
    const todayButton = screen.getByRole('button', { name: '今日' });
    fireEvent.click(todayButton);

    // Should return to current date
    expect(screen.getByText('2024年3月15日')).toBeInTheDocument();
  });

  it('contains proper accessibility attributes', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    // Check screen reader text
    expect(screen.getByText('今日')).toHaveClass('sr-only');
    expect(screen.getByText('前の日')).toHaveClass('sr-only');
    expect(screen.getByText('次の日')).toHaveClass('sr-only');
  });

  it('renders icons correctly', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-4', 'border-b');
  });

  it('handles multiple navigation clicks correctly', () => {
    render(<CalendarHeader view="day" onViewChange={mockOnViewChange} />);

    const nextButton = screen.getByRole('button', { name: '次の日' });

    // Click multiple times
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    // Should be 3 days ahead
    expect(screen.getByText('2024年3月18日')).toBeInTheDocument();
  });
});
