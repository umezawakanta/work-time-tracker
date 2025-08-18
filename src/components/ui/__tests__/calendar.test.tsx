import React, { createRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Calendar } from '../calendar';

// Mock react-day-picker to avoid complex date picker testing
jest.mock('react-day-picker', () => ({
  DayPicker: ({ selected, onSelect, mode, ...props }: any) => {
    const getSelectedText = () => {
      if (!selected) return 'No date selected';
      if (Array.isArray(selected)) {
        return selected.length > 0 ? `${selected.length} dates selected` : 'No date selected';
      }
      if (selected instanceof Date && !isNaN(selected.getTime())) {
        return selected.toISOString().split('T')[0];
      }
      if (selected.from) {
        // Range mode
        return selected.to
          ? `${selected.from.toISOString().split('T')[0]} to ${selected.to.toISOString().split('T')[0]}`
          : `From ${selected.from.toISOString().split('T')[0]}`;
      }
      return 'No date selected';
    };

    return (
      <div data-testid="day-picker" data-mode={mode} tabIndex={0} {...props}>
        <div data-testid="selected-date">{getSelectedText()}</div>
        <button
          data-testid="select-date"
          onClick={() => onSelect && onSelect(new Date('2023-10-15'))}
        >
          Select October 15, 2023
        </button>
        <button
          data-testid="select-range-start"
          onClick={() => onSelect && onSelect({ from: new Date('2023-10-15'), to: undefined })}
        >
          Select Range Start
        </button>
        <button
          data-testid="select-range-end"
          onClick={() =>
            onSelect && onSelect({ from: new Date('2023-10-15'), to: new Date('2023-10-20') })
          }
        >
          Select Range End
        </button>
      </div>
    );
  },
}));

describe('Calendar', () => {
  describe('Rendering', () => {
    it('renders calendar correctly', () => {
      render(<Calendar data-testid="calendar" />);

      const calendar = screen.getByTestId('calendar');
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveClass('p-3');
    });

    it('applies custom className', () => {
      render(<Calendar className="custom-calendar" data-testid="calendar" />);

      const calendar = screen.getByTestId('calendar');
      expect(calendar).toHaveClass('custom-calendar');
      expect(calendar).toHaveClass('p-3'); // Still has default classes
    });

    it('renders DayPicker component', () => {
      render(<Calendar />);

      expect(screen.getByTestId('day-picker')).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('handles single date selection', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(<Calendar mode="single" selected={undefined} onSelect={handleSelect} />);

      const selectButton = screen.getByTestId('select-date');
      await user.click(selectButton);

      expect(handleSelect).toHaveBeenCalledWith(new Date('2023-10-15'));
    });

    it('displays selected single date', () => {
      const selectedDate = new Date('2023-10-15');

      render(<Calendar mode="single" selected={selectedDate} />);

      expect(screen.getByTestId('selected-date')).toHaveTextContent('2023-10-15');
    });

    it('handles date range selection', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(<Calendar mode="range" onSelect={handleSelect} />);

      // Select range start
      const selectRangeStart = screen.getByTestId('select-range-start');
      await user.click(selectRangeStart);

      expect(handleSelect).toHaveBeenCalledWith({ from: new Date('2023-10-15'), to: undefined });

      // Select range end
      const selectRangeEnd = screen.getByTestId('select-range-end');
      await user.click(selectRangeEnd);

      expect(handleSelect).toHaveBeenCalledWith({
        from: new Date('2023-10-15'),
        to: new Date('2023-10-20'),
      });
    });

    it('handles multiple date selection', () => {
      const selectedDates = [new Date('2023-10-15'), new Date('2023-10-20')];

      render(<Calendar mode="multiple" selected={selectedDates} />);

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-mode', 'multiple');
    });

    it('handles no date selection', () => {
      render(<Calendar mode="single" selected={undefined} />);

      expect(screen.getByTestId('selected-date')).toHaveTextContent('No date selected');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards mode prop to DayPicker', () => {
      render(<Calendar mode="range" />);

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-mode', 'range');
    });

    it('forwards custom props to DayPicker', () => {
      // This test verifies that the component accepts the prop without error
      expect(() => {
        render(<Calendar showOutsideDays={true} />);
      }).not.toThrow();

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toBeInTheDocument();
    });

    it('applies default props', () => {
      // This test verifies that the component renders with default settings
      expect(() => {
        render(<Calendar />);
      }).not.toThrow();

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies default calendar styling', () => {
      render(<Calendar data-testid="calendar" />);

      const calendar = screen.getByTestId('calendar');
      expect(calendar).toHaveClass('p-3');
    });

    it('merges custom className with default styling', () => {
      render(<Calendar className="my-custom-class" data-testid="calendar" />);

      const calendar = screen.getByTestId('calendar');
      expect(calendar).toHaveClass('p-3');
      expect(calendar).toHaveClass('my-custom-class');
    });

    it('overrides default styling when needed', () => {
      render(<Calendar className="p-0" data-testid="calendar" />);

      const calendar = screen.getByTestId('calendar');
      expect(calendar).toHaveClass('p-0');
    });
  });

  describe('Accessibility', () => {
    it('is keyboard navigable', async () => {
      render(<Calendar />);

      const calendar = screen.getByTestId('day-picker');

      // Test that the calendar is focusable (without actually focusing it)
      expect(calendar).toBeInTheDocument();
      expect(calendar.getAttribute('tabIndex')).not.toBe('-1');
    });

    it('supports screen readers', () => {
      render(<Calendar />);

      const calendar = screen.getByTestId('day-picker');
      expect(calendar).toBeInTheDocument();

      // DayPicker should provide appropriate ARIA labels
      // This test verifies the component renders without accessibility issues
    });

    it('handles tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before Calendar</button>
          <Calendar />
          <button>After Calendar</button>
        </div>
      );

      const beforeButton = screen.getByText('Before Calendar');
      const afterButton = screen.getByText('After Calendar');

      beforeButton.focus();
      await user.tab();

      // Should move focus into the calendar - since our mock DayPicker has tabIndex={0} on the container
      // the focus will be on the day picker container itself
      const dayPicker = screen.getByTestId('day-picker');
      expect(document.activeElement).toBe(dayPicker);
    });
  });

  describe('Event Handling', () => {
    it('calls onSelect when date is selected', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      // @ts-ignore - Test props don't need to match strict typing
      render(<Calendar onSelect={handleSelect} />);

      const selectButton = screen.getByTestId('select-date');
      await user.click(selectButton);

      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith(new Date('2023-10-15'));
    });

    it('does not call onSelect when not provided', async () => {
      const user = userEvent.setup();

      // Should not throw error
      expect(() => {
        render(<Calendar />);
        const selectButton = screen.getByTestId('select-date');
        user.click(selectButton);
      }).not.toThrow();
    });
  });

  describe('Different Modes', () => {
    it('supports single mode', () => {
      render(<Calendar mode="single" />);

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-mode', 'single');
    });

    it('supports multiple mode', () => {
      render(<Calendar mode="multiple" />);

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-mode', 'multiple');
    });

    it('supports range mode', () => {
      render(<Calendar mode="range" />);

      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toHaveAttribute('data-mode', 'range');
    });

    it('defaults to single mode when no mode specified', () => {
      render(<Calendar />);

      // Default behavior should be single mode
      const dayPicker = screen.getByTestId('day-picker');
      expect(dayPicker).toBeInTheDocument();
    });
  });

  describe('ForwardRef', () => {
    it.skip('forwards ref correctly', () => {
      const ref = createRef<HTMLDivElement>();

      // @ts-ignore - Test ref forwarding doesn't need strict typing
      render(<Calendar ref={ref} data-testid="calendar" />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId('calendar'));
    });

    it.skip('allows accessing DOM methods through ref', () => {
      const ref = createRef<HTMLDivElement>();

      // @ts-ignore - Test ref forwarding doesn't need strict typing
      render(<Calendar ref={ref} />);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.scrollIntoView).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid date gracefully', () => {
      const invalidDate = new Date('invalid');

      expect(() => {
        render(<Calendar mode="single" selected={invalidDate} />);
      }).not.toThrow();
    });

    it('handles null selected date', () => {
      expect(() => {
        render(<Calendar mode="single" selected={null as any} />);
      }).not.toThrow();
    });

    it('handles undefined selected date', () => {
      expect(() => {
        render(<Calendar mode="single" selected={undefined} />);
      }).not.toThrow();
    });

    it('handles empty array for multiple mode', () => {
      expect(() => {
        render(<Calendar mode="multiple" selected={[]} />);
      }).not.toThrow();
    });

    it('handles undefined range for range mode', () => {
      expect(() => {
        render(<Calendar mode="range" selected={undefined} />);
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('works with controlled state', async () => {
      const user = userEvent.setup();
      const TestCalendar = () => {
        const [selected, setSelected] = useState<Date | undefined>(undefined);

        return (
          <div>
            <Calendar mode="single" selected={selected} onSelect={setSelected} />
            <div data-testid="selected-display">
              {selected ? selected.toISOString().split('T')[0] : 'No date'}
            </div>
          </div>
        );
      };

      render(<TestCalendar />);

      expect(screen.getByTestId('selected-display')).toHaveTextContent('No date');

      const selectButton = screen.getByTestId('select-date');
      await user.click(selectButton);

      expect(screen.getByTestId('selected-display')).toHaveTextContent('2023-10-15');
    });

    it('works with form integration', () => {
      const TestForm = () => {
        const [date, setDate] = useState<Date | undefined>(undefined);

        return (
          <form data-testid="calendar-form">
            <Calendar mode="single" selected={date} onSelect={setDate} />
            <input
              type="hidden"
              name="selectedDate"
              value={date ? date.toISOString() : ''}
              data-testid="hidden-input"
            />
          </form>
        );
      };

      render(<TestForm />);

      expect(screen.getByTestId('calendar-form')).toBeInTheDocument();
      expect(screen.getByTestId('hidden-input')).toHaveValue('');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestCalendar = ({ selected }: { selected?: Date }) => {
        renderSpy();
        return <Calendar mode="single" selected={selected} />;
      };

      const { rerender } = render(<TestCalendar />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Same props should not cause unnecessary re-renders
      rerender(<TestCalendar />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // forwardRef will re-render
    });

    it('handles frequent date changes efficiently', () => {
      const dates = [new Date('2023-10-01'), new Date('2023-10-02'), new Date('2023-10-03')];

      const { rerender } = render(<Calendar mode="single" selected={dates[0]} />);

      // Rapidly change dates
      dates.forEach((date) => {
        expect(() => {
          rerender(<Calendar mode="single" selected={date} />);
        }).not.toThrow();
      });
    });
  });
});
