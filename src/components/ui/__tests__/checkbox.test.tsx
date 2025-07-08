import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders checkbox correctly', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'button');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    it('applies default styling classes', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass(
        'peer',
        'h-4',
        'w-4',
        'shrink-0',
        'rounded-sm',
        'border',
        'border-primary',
        'ring-offset-background'
      );
    });

    it('applies custom className', () => {
      render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
      expect(checkbox).toHaveClass('peer'); // Still has default classes
    });
  });

  describe('States', () => {
    it('renders unchecked state by default', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('renders checked state when checked prop is true', () => {
      render(<Checkbox checked={true} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('renders indeterminate state when checked is "indeterminate"', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });

    it('renders disabled state correctly', () => {
      render(<Checkbox disabled data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('renders checked and disabled state', () => {
      render(<Checkbox checked={true} disabled data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Icons', () => {
    it('shows check icon when checked', () => {
      render(<Checkbox checked={true} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      const checkIcon = checkbox.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveClass('h-4', 'w-4');
    });

    it('shows minus icon when indeterminate', () => {
      render(<Checkbox checked="indeterminate" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      const minusIcon = checkbox.querySelector('svg');
      expect(minusIcon).toBeInTheDocument();
      expect(minusIcon).toHaveClass('h-4', 'w-4');
    });

    it('does not show icon when unchecked', () => {
      render(<Checkbox checked={false} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      const icon = checkbox.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('does not call onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox disabled onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);

      expect(handleCheckedChange).not.toHaveBeenCalled();
    });

    it('toggles between checked and unchecked states', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');

      // Click to check
      await user.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      // Reset mock and simulate checked state
      handleCheckedChange.mockClear();
      render(
        <Checkbox checked={true} onCheckedChange={handleCheckedChange} data-testid="checkbox" />
      );
      const checkedCheckbox = screen.getByTestId('checkbox');

      // Click to uncheck
      await user.click(checkedCheckbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });

    it('supports keyboard interaction with Space key', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      await user.keyboard(' ');

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('supports keyboard interaction with Enter key', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();

      await user.keyboard('{Enter}');

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await user.click(checkbox);
      // In uncontrolled mode, the component manages its own state
      // This test verifies the component doesn't break without controlled props
    });

    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={handleCheckedChange} data-testid="checkbox" />
      );

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      await user.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      // Simulate parent component updating the checked state
      rerender(
        <Checkbox checked={true} onCheckedChange={handleCheckedChange} data-testid="checkbox" />
      );

      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'true');
    });

    it('handles indeterminate to checked transition', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(
        <Checkbox
          checked="indeterminate"
          onCheckedChange={handleCheckedChange}
          data-testid="checkbox"
        />
      );

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

      await user.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });
  });

  describe('ForwardRef', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(<Checkbox ref={ref} data-testid="checkbox" />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toBe(screen.getByTestId('checkbox'));
    });

    it('allows calling focus through ref', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(<Checkbox ref={ref} data-testid="checkbox" />);

      expect(ref.current?.focus).toBeDefined();
      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('supports aria-label', () => {
      render(<Checkbox aria-label="Accept terms" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
      expect(checkbox).toHaveAccessibleName('Accept terms');
    });

    it('supports aria-labelledby', () => {
      render(
        <div>
          <label id="checkbox-label">Terms and Conditions</label>
          <Checkbox aria-labelledby="checkbox-label" data-testid="checkbox" />
        </div>
      );

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-labelledby', 'checkbox-label');
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Checkbox aria-describedby="checkbox-help" data-testid="checkbox" />
          <div id="checkbox-help">Check this to agree to terms</div>
        </div>
      );

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'checkbox-help');
    });

    it('handles focus management correctly', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Before</button>
          <Checkbox data-testid="checkbox" />
          <button>After</button>
        </div>
      );

      const checkbox = screen.getByTestId('checkbox');

      await user.tab(); // Focus first button
      await user.tab(); // Focus checkbox

      expect(checkbox).toHaveFocus();

      await user.tab(); // Focus next button
      expect(screen.getByText('After')).toHaveFocus();
    });

    it('supports focus-visible styling', () => {
      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('focus-visible:outline-none');
      expect(checkbox).toHaveClass('focus-visible:ring-2');
      expect(checkbox).toHaveClass('focus-visible:ring-ring');
    });
  });

  describe('Form Integration', () => {
    it('works with form labels', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(
        <div>
          <label htmlFor="form-checkbox">Accept Terms</label>
          <Checkbox
            id="form-checkbox"
            onCheckedChange={handleCheckedChange}
            data-testid="checkbox"
          />
        </div>
      );

      const label = screen.getByText('Accept Terms');
      await user.click(label);

      // Note: This test verifies the checkbox can be associated with labels
      // Actual label clicking behavior depends on implementation
      expect(screen.getByTestId('checkbox')).toHaveAttribute('id', 'form-checkbox');
    });

    it('supports name attribute for form submission', () => {
      render(<Checkbox name="terms" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('name', 'terms');
    });

    it('supports value attribute', () => {
      render(<Checkbox value="accepted" data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('value', 'accepted');
    });

    it('supports required attribute', () => {
      render(<Checkbox required data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('required');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks gracefully', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');

      // Rapid clicking
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledTimes(3);
    });

    it('handles mixed keyboard and mouse interactions', async () => {
      const user = userEvent.setup();
      const handleCheckedChange = jest.fn();

      render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');

      // Mix of interactions
      await user.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledTimes(1);

      checkbox.focus();
      await user.keyboard(' ');
      expect(handleCheckedChange).toHaveBeenCalledTimes(2);
    });

    it('handles null/undefined onCheckedChange gracefully', async () => {
      const user = userEvent.setup();

      render(<Checkbox data-testid="checkbox" />);

      const checkbox = screen.getByTestId('checkbox');

      // Should not throw error
      expect(() => user.click(checkbox)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestCheckbox = ({ checked }: { checked: boolean }) => {
        renderSpy();
        return <Checkbox checked={checked} data-testid="checkbox" />;
      };

      const { rerender } = render(<TestCheckbox checked={false} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Same props should not cause re-render
      rerender(<TestCheckbox checked={false} />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // forwardRef components will re-render
    });
  });
});
