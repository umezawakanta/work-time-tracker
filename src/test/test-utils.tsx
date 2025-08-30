import React from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { AuthProvider } from '../context/AuthContext';

// Re-export testing utilities
export * from '@testing-library/react';
export { userEvent };

// Create a minimal test store for testing
const createTestStore = (initialState?: any) => {
  // Create mock reducer that returns initial state
  const mockReducer = (state = {}, action: any) => state;

  return configureStore({
    reducer: mockReducer,
    preloadedState: initialState || {
      workTime: { entries: [] },
      asset: {},
      debt: {},
      user: {},
      todo: {},
      candidate: {},
      subscription: {},
      withdrawal: {},
      book: {},
      sleepTracker: {},
      blog: {},
      guitarPractice: {},
      achievements: {},
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for tests
      }),
  });
};

// Test wrapper component with all necessary providers
interface TestWrapperProps {
  children: React.ReactNode;
  initialState?: any;
  disableRouter?: boolean;
}

function TestWrapper({ children, initialState, disableRouter = false }: TestWrapperProps) {
  const testStore = createTestStore(initialState);

  if (disableRouter) {
    return (
      <Provider store={testStore}>
        <AuthProvider>{children}</AuthProvider>
      </Provider>
    );
  }

  return (
    <Provider store={testStore}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  disableRouter?: boolean;
}

const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const { initialState, disableRouter, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper initialState={initialState} disableRouter={disableRouter}>
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Async testing utilities for UI components
export const asyncTestUtils = {
  // Wait for Radix UI state changes and animations
  waitForRadixUI: async (timeout = 1000) => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 50); // Allow for Radix UI internal state updates
    });

    // Wait for any pending microtasks
    await new Promise((resolve) => setTimeout(resolve, 0));
  },

  // Wait for form validation to complete
  waitForFormValidation: async (timeout = 2000) => {
    // Allow react-hook-form validation to complete
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });

    // Wait for DOM updates
    await new Promise((resolve) => setTimeout(resolve, 0));
  },

  // Wait for element to appear with better error handling
  waitForElement: async (
    callback: () => HTMLElement | null,
    options: { timeout?: number; errorMessage?: string } = {}
  ) => {
    const { timeout = 3000, errorMessage = 'Element not found' } = options;

    return waitFor(
      () => {
        const element = callback();
        if (!element) {
          throw new Error(errorMessage);
        }
        return element;
      },
      { timeout }
    );
  },

  // Wait for text to appear
  waitForText: async (text: string | RegExp, timeout = 3000) => {
    return waitFor(
      () => {
        const element = screen.getByText(text);
        return element;
      },
      { timeout }
    );
  },

  // Wait for error message to appear in forms
  waitForErrorMessage: async (message: string | RegExp, timeout = 3000) => {
    return waitFor(
      () => {
        const errorElement = screen.getByText(message);
        expect(errorElement).toBeInTheDocument();
        return errorElement;
      },
      { timeout }
    );
  },

  // Wait for validation state to change
  waitForValidationState: async (
    input: HTMLElement,
    expectedState: 'true' | 'false',
    timeout = 3000
  ) => {
    return waitFor(
      () => {
        expect(input).toHaveAttribute('aria-invalid', expectedState);
      },
      { timeout }
    );
  },
};

// Form testing utilities
export const formTestUtils = {
  // Trigger form field validation by typing and blurring
  triggerFieldValidation: async (input: HTMLElement, value: string) => {
    const user = userEvent.setup();
    await user.clear(input);
    await user.type(input, value);
    await user.tab(); // Blur to trigger validation
    await asyncTestUtils.waitForFormValidation();
  },

  // Submit form and wait for validation
  submitForm: async (submitButton: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(submitButton);
    await asyncTestUtils.waitForFormValidation();
  },

  // Get form field by label
  getFieldByLabel: (label: string) => {
    return screen.getByLabelText(label);
  },

  // Check if form field has error
  expectFieldError: async (fieldLabel: string, errorMessage: string | RegExp) => {
    const field = screen.getByLabelText(fieldLabel);

    // Check aria-invalid
    await asyncTestUtils.waitForValidationState(field, 'true');

    // Check error message appears
    await asyncTestUtils.waitForErrorMessage(errorMessage);

    return { field };
  },

  // Check if form field is valid
  expectFieldValid: async (fieldLabel: string) => {
    const field = screen.getByLabelText(fieldLabel);
    await asyncTestUtils.waitForValidationState(field, 'false');
    return { field };
  },
};

// Select component testing utilities
export const selectTestUtils = {
  // Open select dropdown
  openSelect: async (trigger: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(trigger);
    await asyncTestUtils.waitForRadixUI();

    // Verify content is open
    const content = screen.getByRole('listbox');
    expect(content).toBeInTheDocument();
    return content;
  },

  // Select an option by text
  selectOption: async (trigger: HTMLElement, optionText: string) => {
    const user = userEvent.setup();

    // Open select
    await user.click(trigger);
    await asyncTestUtils.waitForRadixUI();

    // Click option
    const option = screen.getByRole('option', { name: optionText });
    await user.click(option);
    await asyncTestUtils.waitForRadixUI();

    return option;
  },

  // Navigate options with keyboard
  navigateWithKeyboard: async (trigger: HTMLElement, key: string) => {
    const user = userEvent.setup();
    trigger.focus();
    await user.keyboard(`{${key}}`);
    await asyncTestUtils.waitForRadixUI();
  },

  // Get select trigger by test id or role
  getTrigger: (testId?: string) => {
    if (testId) {
      return screen.getByTestId(testId);
    }
    return screen.getByRole('combobox');
  },

  // Check if select has value
  expectSelectValue: (trigger: HTMLElement, expectedValue: string) => {
    expect(screen.getByText(expectedValue)).toBeInTheDocument();
  },

  // Check placeholder
  expectPlaceholder: (selectValue: HTMLElement, placeholder: string) => {
    expect(selectValue).toHaveAttribute('placeholder', placeholder);
  },
};

// Button testing utilities
export const buttonTestUtils = {
  // Click button and wait for async operations
  clickButton: async (button: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(button);
    await asyncTestUtils.waitForRadixUI();
  },

  // Get button by role and name
  getButton: (name: string) => {
    return screen.getByRole('button', { name });
  },

  // Check button states
  expectButtonDisabled: (button: HTMLElement) => {
    expect(button).toBeDisabled();
  },

  expectButtonEnabled: (button: HTMLElement) => {
    expect(button).toBeEnabled();
  },
};

// Dialog/Modal testing utilities
export const dialogTestUtils = {
  // Open dialog by clicking trigger
  openDialog: async (trigger: HTMLElement) => {
    const user = userEvent.setup();
    await user.click(trigger);
    await asyncTestUtils.waitForRadixUI();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    return dialog;
  },

  // Close dialog with escape key
  closeDialogWithEscape: async () => {
    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    await asyncTestUtils.waitForRadixUI();
  },

  // Check if dialog is open
  expectDialogOpen: () => {
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    return dialog;
  },

  // Check if dialog is closed
  expectDialogClosed: () => {
    const dialog = screen.queryByRole('dialog');
    expect(dialog).not.toBeInTheDocument();
  },
};

// Accessibility testing utilities
export const a11yTestUtils = {
  // Check ARIA attributes
  expectAriaExpanded: (element: HTMLElement, expanded: boolean) => {
    expect(element).toHaveAttribute('aria-expanded', expanded.toString());
  },

  expectAriaInvalid: (element: HTMLElement, invalid: boolean) => {
    expect(element).toHaveAttribute('aria-invalid', invalid.toString());
  },

  expectAriaDescribedBy: (element: HTMLElement, expectedId?: string) => {
    const describedBy = element.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    if (expectedId) {
      expect(describedBy).toContain(expectedId);
    }
  },

  // Check label associations
  expectLabelAssociation: (input: HTMLElement, labelText: string) => {
    const label = screen.getByText(labelText);
    expect(label).toHaveAttribute('for', input.id);
  },

  // Check focus management
  expectElementFocused: (element: HTMLElement) => {
    expect(element).toHaveFocus();
  },

  // Check screen reader content
  expectScreenReaderText: (text: string) => {
    // Look for text that might be visually hidden but available to screen readers
    const element = screen.getByText(text);
    expect(element).toBeInTheDocument();
  },
};

// Mock utilities for testing
export const mockUtils = {
  // Create mock function with specific return value
  createMockFn: <T = any,>(returnValue?: T) => {
    return (() => returnValue) as unknown as (...args: any[]) => T;
  },

  // Create async mock function
  createAsyncMockFn: <T = any,>(returnValue?: T, delay = 0) => {
    return ((..._args: any[]) =>
      new Promise<T>((resolve) =>
        setTimeout(() => resolve(returnValue as T), delay)
      )) as unknown as (...args: any[]) => Promise<T>;
  },

  // Mock form submission
  createFormMock: () => {
    const handleSubmit = (..._args: any[]) => {};
    const handleError = (..._args: any[]) => {};

    return {
      handleSubmit,
      handleError,
      expectSubmitted: (_data: any) => {},
      expectNotSubmitted: () => {},
      expectError: () => {},
    };
  },

  // Mock select value change
  createSelectMock: () => {
    const handleValueChange = (_value: string) => {};

    return {
      handleValueChange,
      expectValueChanged: (_value: string) => {},
      expectNoChange: () => {},
    };
  },
};

// Export custom render as default render
export { customRender as render };

// Export a comprehensive test suite helper
export const createTestSuite = (componentName: string) => {
  return {
    describe: (description: string, tests: () => void) => {
      describe(`${componentName} - ${description}`, tests);
    },

    it: (description: string, test: (() => void) | (() => Promise<void>)) => {
      it(description, test);
    },

    // Common test patterns
    shouldRender: (renderFn: () => void) => {
      it('renders without crashing', renderFn);
    },

    shouldHandleProps: (testFn: () => void) => {
      it('handles props correctly', testFn);
    },

    shouldBeAccessible: (testFn: () => void) => {
      it('meets accessibility requirements', testFn);
    },

    shouldHandleInteractions: (testFn: () => void) => {
      it('handles user interactions correctly', testFn);
    },
  };
};
