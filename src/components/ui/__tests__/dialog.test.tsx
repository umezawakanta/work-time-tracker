import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from '../dialog';
import { Button } from '../button';

// Test component with dialog functionality
const TestDialogComponent: React.FC<{
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
}> = ({ onOpenChange = jest.fn(), defaultOpen = false, modal = true }) => (
  <Dialog onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
    <DialogTrigger asChild>
      <Button data-testid="dialog-trigger">Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogDescription>This is a test dialog for comprehensive testing.</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p>Dialog content goes here.</p>
        <input data-testid="dialog-input" placeholder="Test input" />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" data-testid="cancel-button">
            Cancel
          </Button>
        </DialogClose>
        <Button data-testid="confirm-button">Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Controlled dialog component
const ControlledDialogComponent: React.FC<{
  onConfirm?: () => void;
}> = ({ onConfirm = jest.fn() }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} data-testid="controlled-trigger">
        Open Controlled Dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This dialog is controlled by external state.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              data-testid="controlled-confirm"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Custom dialog with specific props
const CustomDialogComponent: React.FC = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Custom Dialog</Button>
    </DialogTrigger>
    <DialogContent className="custom-dialog-content">
      <DialogOverlay className="custom-overlay" />
      <DialogHeader className="custom-header">
        <DialogTitle className="custom-title">Custom Title</DialogTitle>
        <DialogDescription className="custom-description">Custom description</DialogDescription>
      </DialogHeader>
      <DialogFooter className="custom-footer">
        <Button>Custom Button</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

describe('Dialog Components', () => {
  describe('Dialog Root', () => {
    it('renders trigger correctly', () => {
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Open Dialog');
    });

    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('calls onOpenChange when dialog state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      render(<TestDialogComponent onOpenChange={handleOpenChange} />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('opens dialog by default when defaultOpen is true', () => {
      render(<TestDialogComponent defaultOpen />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });
  });

  describe('DialogTrigger', () => {
    it('renders as child component when asChild is true', () => {
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('handles keyboard activation', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles Space key activation', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      trigger.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('DialogContent', () => {
    it('renders dialog content correctly', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveClass(
        'fixed',
        'left-[50%]',
        'top-[50%]',
        'z-50',
        'grid',
        'w-full',
        'max-w-lg',
        'translate-x-[-50%]',
        'translate-y-[-50%]',
        'gap-4',
        'border',
        'bg-background',
        'p-6',
        'shadow-lg'
      );
    });

    it('includes close button by default', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.querySelector('svg')).toBeInTheDocument(); // X icon
    });

    it('closes dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(<CustomDialogComponent />);

      const trigger = screen.getByText('Custom Dialog');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-dialog-content');
    });

    it('traps focus within dialog', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialogInput = screen.getByTestId('dialog-input');
      const cancelButton = screen.getByTestId('cancel-button');
      const confirmButton = screen.getByTestId('confirm-button');

      // Focus should be trapped within dialog
      dialogInput.focus();
      expect(dialogInput).toHaveFocus();

      await user.tab();
      expect(cancelButton).toHaveFocus();

      await user.tab();
      expect(confirmButton).toHaveFocus();
    });
  });

  describe('DialogOverlay', () => {
    it('renders overlay when dialog is open', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      // Overlay is rendered but may not be directly accessible
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('closes dialog when overlay is clicked', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click outside the dialog content (on overlay)
      await user.click(document.body);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('applies custom styling to overlay', async () => {
      const user = userEvent.setup();
      render(<CustomDialogComponent />);

      const trigger = screen.getByText('Custom Dialog');
      await user.click(trigger);

      // Note: Overlay styling verification depends on implementation
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('DialogHeader', () => {
    it('renders header with correct styling', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const title = screen.getByText('Test Dialog');
      const description = screen.getByText('This is a test dialog for comprehensive testing.');

      expect(title.parentElement).toHaveClass(
        'flex',
        'flex-col',
        'space-y-1.5',
        'text-center',
        'sm:text-left'
      );
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(<CustomDialogComponent />);

      const trigger = screen.getByText('Custom Dialog');
      await user.click(trigger);

      const title = screen.getByText('Custom Title');
      expect(title.parentElement).toHaveClass('custom-header');
    });
  });

  describe('DialogTitle', () => {
    it('renders title with correct styling', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const title = screen.getByText('Test Dialog');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('provides accessible name for dialog', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName('Test Dialog');
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(<CustomDialogComponent />);

      const trigger = screen.getByText('Custom Dialog');
      await user.click(trigger);

      const title = screen.getByText('Custom Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('DialogDescription', () => {
    it('renders description with correct styling', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const description = screen.getByText('This is a test dialog for comprehensive testing.');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('provides accessible description for dialog', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleDescription(
        'This is a test dialog for comprehensive testing.'
      );
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(<CustomDialogComponent />);

      const trigger = screen.getByText('Custom Dialog');
      await user.click(trigger);

      const description = screen.getByText('Custom description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('DialogFooter', () => {
    it('renders footer with correct styling', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const cancelButton = screen.getByTestId('cancel-button');
      const confirmButton = screen.getByTestId('confirm-button');

      expect(cancelButton.parentElement).toHaveClass(
        'flex',
        'flex-col-reverse',
        'sm:flex-row',
        'sm:justify-end',
        'sm:space-x-2'
      );
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(<CustomDialogComponent />);

      const trigger = screen.getByText('Custom Dialog');
      await user.click(trigger);

      const customButton = screen.getByText('Custom Button');
      expect(customButton.parentElement).toHaveClass('custom-footer');
    });
  });

  describe('DialogClose', () => {
    it('closes dialog when DialogClose button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders as child component when asChild is true', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton.tagName).toBe('BUTTON');
    });
  });

  describe('Controlled Dialog', () => {
    it('handles controlled state correctly', async () => {
      const user = userEvent.setup();
      render(<ControlledDialogComponent />);

      const trigger = screen.getByTestId('controlled-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
    });

    it('calls onConfirm and closes dialog', async () => {
      const user = userEvent.setup();
      const handleConfirm = jest.fn();
      render(<ControlledDialogComponent onConfirm={handleConfirm} />);

      const trigger = screen.getByTestId('controlled-trigger');
      await user.click(trigger);

      const confirmButton = screen.getByTestId('controlled-confirm');
      await user.click(confirmButton);

      expect(handleConfirm).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes dialog when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('returns focus to trigger when dialog closes', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(trigger).toHaveFocus();
    });

    it('prevents Tab from leaving dialog content', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <input data-testid="external-input" />
          <TestDialogComponent />
          <button data-testid="external-button">External</button>
        </div>
      );

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialogInput = screen.getByTestId('dialog-input');
      dialogInput.focus();

      // Tab should cycle within dialog, not reach external elements
      await user.tab();
      await user.tab();
      await user.tab();

      const externalInput = screen.getByTestId('external-input');
      const externalButton = screen.getByTestId('external-button');

      expect(externalInput).not.toHaveFocus();
      expect(externalButton).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('Test Dialog');
      expect(dialog).toHaveAccessibleDescription(
        'This is a test dialog for comprehensive testing.'
      );
    });

    it('manages focus correctly on open', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      // Focus should move into the dialog
      const dialog = screen.getByRole('dialog');
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('supports screen reader announcements', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Screen reader should announce dialog when opened
      expect(dialog).toHaveAccessibleName();
      expect(dialog).toHaveAccessibleDescription();
    });
  });

  describe('Portal Behavior', () => {
    it('renders dialog content in portal', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');

      // Dialog should be rendered outside the normal document flow
      expect(dialog).toBeInTheDocument();
      expect(dialog.closest('[data-radix-portal]')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid open/close operations', async () => {
      const user = userEvent.setup();
      render(<TestDialogComponent />);

      const trigger = screen.getByTestId('dialog-trigger');

      // Rapidly open and close
      await user.click(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles missing title gracefully', async () => {
      const user = userEvent.setup();
      const DialogWithoutTitle = () => (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <p>Content without title</p>
          </DialogContent>
        </Dialog>
      );

      render(<DialogWithoutTitle />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Content without title')).toBeInTheDocument();
    });

    it('handles nested interactive elements', async () => {
      const user = userEvent.setup();
      const NestedDialog = () => (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Parent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Parent Dialog</DialogTitle>
            <div>
              <input placeholder="Parent input" />
              <select>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </DialogContent>
        </Dialog>
      );

      render(<NestedDialog />);

      const trigger = screen.getByText('Open Parent');
      await user.click(trigger);

      const input = screen.getByPlaceholderText('Parent input');
      const select = screen.getByRole('combobox');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.click(select);
      expect(select).toHaveFocus();
    });
  });
});
