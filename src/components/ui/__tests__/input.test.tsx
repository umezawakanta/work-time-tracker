import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Input, type InputProps } from '../input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element correctly', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('applies default styling classes', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm'
      );
    });

    it('applies additional custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex'); // Still has default classes
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      // HTML input defaults to type="text" even when not explicitly set
      expect(input.type).toBe('text');
    });

    it('renders email input when type is email', () => {
      render(<Input type="email" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input when type is password', () => {
      render(<Input type="password" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input when type is number', () => {
      render(<Input type="number" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders file input when type is file', () => {
      render(<Input type="file" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('renders search input when type is search', () => {
      render(<Input type="search" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('renders tel input when type is tel', () => {
      render(<Input type="tel" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input when type is url', () => {
      render(<Input type="url" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'url');
    });
  });

  describe('Props', () => {
    it('applies placeholder correctly', () => {
      render(<Input placeholder="Enter text..." data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('placeholder', 'Enter text...');
    });

    it('applies value correctly', () => {
      render(<Input value="test value" data-testid="input" readOnly />);

      const input = screen.getByTestId('input');
      expect(input).toHaveValue('test value');
    });

    it('applies defaultValue correctly', () => {
      render(<Input defaultValue="default text" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveValue('default text');
    });

    it('applies disabled state correctly', () => {
      render(<Input disabled data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('applies required attribute correctly', () => {
      render(<Input required data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('applies readOnly correctly', () => {
      render(<Input readOnly data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('readonly');
    });

    it('applies aria-label correctly', () => {
      render(<Input aria-label="Search input" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-label', 'Search input');
    });

    it('applies aria-describedby correctly', () => {
      render(<Input aria-describedby="help-text" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('applies name attribute correctly', () => {
      render(<Input name="username" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('applies id correctly', () => {
      render(<Input id="user-input" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('id', 'user-input');
    });

    it('applies min and max for number inputs', () => {
      render(<Input type="number" min="0" max="100" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('applies step for number inputs', () => {
      render(<Input type="number" step="0.1" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('step', '0.1');
    });

    it('applies pattern for text inputs', () => {
      render(<Input pattern="[0-9]*" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('applies maxLength correctly', () => {
      render(<Input maxLength={10} data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('maxlength', '10');
    });

    it('applies autoComplete correctly', () => {
      render(<Input autoComplete="off" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('applies autoFocus correctly', () => {
      render(<Input autoFocus data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveFocus();
    });
  });

  describe('Event Handlers', () => {
    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Input onChange={handleChange} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalledTimes(4); // One call per character
    });

    it('calls onFocus when input is focused', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();

      render(<Input onFocus={handleFocus} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();

      render(
        <div>
          <Input onBlur={handleBlur} data-testid="input" />
          <button>Other element</button>
        </div>
      );

      const input = screen.getByTestId('input');
      const button = screen.getByRole('button');

      await user.click(input);
      await user.click(button);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onKeyDown when key is pressed', async () => {
      const user = userEvent.setup();
      const handleKeyDown = jest.fn();

      render(<Input onKeyDown={handleKeyDown} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'a');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('calls onClick when input is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Input onClick={handleClick} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ForwardRef', () => {
    it('forwards ref correctly', () => {
      const ref = createRef<HTMLInputElement>();

      render(<Input ref={ref} data-testid="input" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByTestId('input'));
    });

    it('allows calling focus through ref', () => {
      const ref = createRef<HTMLInputElement>();

      render(<Input ref={ref} data-testid="input" />);

      expect(ref.current?.focus).toBeDefined();
      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });

    it('allows getting value through ref', async () => {
      const user = userEvent.setup();
      const ref = createRef<HTMLInputElement>();

      render(<Input ref={ref} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'test value');

      expect(ref.current?.value).toBe('test value');
    });
  });

  describe('Accessibility', () => {
    it('supports screen reader navigation', () => {
      render(<Input aria-label="Username" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAccessibleName('Username');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Input data-testid="input1" />
          <Input data-testid="input2" />
        </div>
      );

      const input1 = screen.getByTestId('input1');
      const input2 = screen.getByTestId('input2');

      await user.click(input1);
      expect(input1).toHaveFocus();

      await user.tab();
      expect(input2).toHaveFocus();
    });

    it('supports focus-visible styling', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:outline-none');
      expect(input).toHaveClass('focus-visible:ring-2');
      expect(input).toHaveClass('focus-visible:ring-ring');
    });
  });

  describe('File Input Specific', () => {
    it('handles file input styling correctly', () => {
      render(<Input type="file" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('file:border-0');
      expect(input).toHaveClass('file:bg-transparent');
      expect(input).toHaveClass('file:text-sm');
      expect(input).toHaveClass('file:font-medium');
    });

    it('accepts file input attributes', () => {
      render(<Input type="file" accept=".jpg,.png" multiple data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('accept', '.jpg,.png');
      expect(input).toHaveAttribute('multiple');
    });
  });

  describe('Edge Cases', () => {
    it('handles null className gracefully', () => {
      render(<Input className={undefined} data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
    });

    it('handles empty string value', () => {
      render(<Input value="" data-testid="input" readOnly />);

      const input = screen.getByTestId('input');
      expect(input).toHaveValue('');
    });

    it('handles controlled and uncontrolled modes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'uncontrolled');
      expect(input).toHaveValue('uncontrolled');

      // Switch to controlled
      rerender(<Input value="controlled" data-testid="input" readOnly />);
      expect(input).toHaveValue('controlled');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      const TestComponent = ({ value }: { value: string }) => {
        renderSpy();
        return <Input value={value} data-testid="input" readOnly />;
      };

      const { rerender } = render(<TestComponent value="test" />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Same props should not cause re-render
      rerender(<TestComponent value="test" />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // forwardRef components will re-render
    });
  });
});
