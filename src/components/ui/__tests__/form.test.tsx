import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import '@testing-library/jest-dom';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from '../form';
import { Input } from '../input';
import { Button } from '../button';

// Test schema for form validation
const testSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type TestFormData = z.infer<typeof testSchema>;

// Test component using form
const TestFormComponent: React.FC<{
  onSubmit?: (data: TestFormData) => void;
  defaultValues?: Partial<TestFormData>;
}> = ({ onSubmit = jest.fn(), defaultValues }) => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormDescription>We'll never share your email with anyone else.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

// Component to test useFormField hook
const TestUseFormFieldComponent: React.FC = () => {
  const form = useForm({
    defaultValues: { testField: '' },
  });

  const TestFieldComponent = () => {
    const field = useFormField();

    return (
      <div data-testid="field-info">
        <span data-testid="field-name">{field.name}</span>
        <span data-testid="field-id">{field.id}</span>
        <span data-testid="form-item-id">{field.formItemId}</span>
        <span data-testid="form-description-id">{field.formDescriptionId}</span>
        <span data-testid="form-message-id">{field.formMessageId}</span>
        <span data-testid="field-error">{field.error ? 'has-error' : 'no-error'}</span>
      </div>
    );
  };

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="testField"
        render={() => (
          <FormItem>
            <TestFieldComponent />
          </FormItem>
        )}
      />
    </Form>
  );
};

describe('Form Components', () => {
  describe('Form', () => {
    it('renders form with all components', () => {
      render(<TestFormComponent />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByText("We'll never share your email with anyone else.")
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('applies default values correctly', () => {
      const defaultValues = {
        email: 'test@example.com',
        password: 'password123',
      };

      render(<TestFormComponent defaultValues={defaultValues} />);

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('password123')).toBeInTheDocument();
    });
  });

  describe('FormField', () => {
    it('renders field with proper context', () => {
      render(<TestFormComponent />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter email');
    });

    it('manages field state correctly', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();
      render(<TestFormComponent onSubmit={mockSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Test invalid input
      await user.click(emailInput);
      await user.tab();

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('FormItem', () => {
    it('generates unique IDs for form items', () => {
      render(<TestFormComponent />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput.id).toBeTruthy();
      expect(passwordInput.id).toBeTruthy();
      expect(emailInput.id).not.toBe(passwordInput.id);
    });

    it('applies custom className', () => {
      const TestComponent = () => {
        const form = useForm({ defaultValues: { test: '' } });

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem className="custom-form-item">
                  <div data-testid="form-item">Test</div>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<TestComponent />);
      const formItem = screen.getByTestId('form-item').parentElement;
      expect(formItem).toHaveClass('custom-form-item');
    });
  });

  describe('FormLabel', () => {
    it('links label to form control', () => {
      render(<TestFormComponent />);

      const emailLabel = screen.getByText('Email');
      const emailInput = screen.getByLabelText('Email');

      expect(emailLabel).toHaveAttribute('for', emailInput.id);
    });

    it('shows error state with destructive styling', async () => {
      const user = userEvent.setup();
      render(<TestFormComponent />);

      const emailInput = screen.getByLabelText('Email');
      const emailLabel = screen.getByText('Email');

      // Trigger validation error
      await user.click(emailInput);
      await user.tab();

      expect(emailLabel).toHaveClass('text-destructive');
    });
  });

  describe('FormControl', () => {
    it('provides accessibility attributes', () => {
      render(<TestFormComponent />);

      const emailInput = screen.getByLabelText('Email');

      expect(emailInput).toHaveAttribute('aria-describedby');
      expect(emailInput.getAttribute('aria-describedby')).toContain('form-item-description');
    });

    it('sets aria-invalid when there are errors', async () => {
      const user = userEvent.setup();
      render(<TestFormComponent />);

      const emailInput = screen.getByLabelText('Email');

      // Initially no error
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');

      // Trigger validation
      await user.click(emailInput);
      await user.tab();

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('FormDescription', () => {
    it('renders description with correct ID', () => {
      render(<TestFormComponent />);

      const description = screen.getByText("We'll never share your email with anyone else.");
      const emailInput = screen.getByLabelText('Email');

      expect(description.id).toBeTruthy();
      expect(emailInput.getAttribute('aria-describedby')).toContain(description.id);
    });

    it('applies custom className', () => {
      const TestComponent = () => {
        const form = useForm({ defaultValues: { test: '' } });

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormDescription className="custom-description">
                    Custom description
                  </FormDescription>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<TestComponent />);
      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('FormMessage', () => {
    it('does not render when no error', () => {
      render(<TestFormComponent />);

      const errorMessage = screen.queryByText('Invalid email address');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('renders error message when validation fails', async () => {
      const mockSubmit = jest.fn();
      render(<TestFormComponent onSubmit={mockSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await submitButton.click();

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('renders custom children when no error', () => {
      const TestComponent = () => {
        const form = useForm({ defaultValues: { test: '' } });

        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage>Custom message</FormMessage>
                </FormItem>
              )}
            />
          </Form>
        );
      };

      render(<TestComponent />);
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('applies correct styling for error messages', async () => {
      const mockSubmit = jest.fn();
      render(<TestFormComponent onSubmit={mockSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await submitButton.click();

      const errorMessage = screen.getByText('Invalid email address');
      expect(errorMessage).toHaveClass('text-destructive');
      expect(errorMessage).toHaveClass('font-medium');
    });
  });

  describe('useFormField', () => {
    it('provides field context information', () => {
      render(<TestUseFormFieldComponent />);

      expect(screen.getByTestId('field-name')).toHaveTextContent('testField');
      expect(screen.getByTestId('field-id')).toHaveTextContent(/^.+$/);
      expect(screen.getByTestId('form-item-id')).toHaveTextContent(/-form-item$/);
      expect(screen.getByTestId('form-description-id')).toHaveTextContent(
        /-form-item-description$/
      );
      expect(screen.getByTestId('form-message-id')).toHaveTextContent(/-form-item-message$/);
      expect(screen.getByTestId('field-error')).toHaveTextContent('no-error');
    });

    it('throws error when used outside FormField', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const InvalidComponent = () => {
        useFormField();
        return <div>Invalid</div>;
      };

      expect(() => render(<InvalidComponent />)).toThrow(
        'useFormField should be used within <FormField>'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('handles complete form submission flow', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();
      render(<TestFormComponent onSubmit={mockSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Fill valid data
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('prevents submission with invalid data', async () => {
      const mockSubmit = jest.fn();
      const user = userEvent.setup();
      render(<TestFormComponent onSubmit={mockSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Fill invalid data
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });
});
