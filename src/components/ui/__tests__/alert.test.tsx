import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders alert with default variant', () => {
      render(<Alert data-testid="alert">Default alert</Alert>);

      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4');
    });

    it('applies destructive variant styling', () => {
      render(
        <Alert variant="destructive" data-testid="alert">
          Destructive alert
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('applies custom className', () => {
      render(
        <Alert className="custom-alert" data-testid="alert">
          Custom alert
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('renders children correctly', () => {
      render(
        <Alert data-testid="alert">
          <div data-testid="child">Child content</div>
        </Alert>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('applies ARIA role correctly', () => {
      render(
        <Alert role="alert" data-testid="alert">
          Alert content
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Alert ref={ref} data-testid="alert">
          Alert content
        </Alert>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId('alert'));
    });
  });

  describe('AlertTitle', () => {
    it('renders title with correct styling', () => {
      render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>);

      const title = screen.getByTestId('alert-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
      expect(title).toHaveTextContent('Alert Title');
    });

    it('applies custom className', () => {
      render(
        <AlertTitle className="custom-title" data-testid="alert-title">
          Custom Title
        </AlertTitle>
      );

      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>();

      render(
        <AlertTitle ref={ref} data-testid="alert-title">
          Title
        </AlertTitle>
      );

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current).toBe(screen.getByTestId('alert-title'));
    });
  });

  describe('AlertDescription', () => {
    it('renders description with correct styling', () => {
      render(
        <AlertDescription data-testid="alert-description">Alert description</AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
      expect(description).toHaveTextContent('Alert description');
    });

    it('applies custom className', () => {
      render(
        <AlertDescription className="custom-description" data-testid="alert-description">
          Custom Description
        </AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toHaveClass('custom-description');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <AlertDescription ref={ref} data-testid="alert-description">
          Description
        </AlertDescription>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId('alert-description'));
    });

    it('renders with nested paragraphs', () => {
      render(
        <AlertDescription data-testid="alert-description">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders complete alert with title and description', () => {
      render(
        <Alert data-testid="complete-alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong. Please try again later.')).toBeInTheDocument();
    });

    it('renders destructive alert with icon', () => {
      const TestIcon = () => <span data-testid="error-icon">⚠️</span>;

      render(
        <Alert variant="destructive" data-testid="destructive-alert">
          <TestIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>This is a destructive alert</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('This is a destructive alert')).toBeInTheDocument();
    });

    it('handles complex content', () => {
      render(
        <Alert data-testid="complex-alert">
          <AlertTitle>Complex Alert</AlertTitle>
          <AlertDescription>
            <strong>Important:</strong> This alert contains{' '}
            <a href="#" className="underline">
              a link
            </a>{' '}
            and <em>emphasized text</em>.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Complex Alert')).toBeInTheDocument();
      expect(screen.getByText('Important:')).toBeInTheDocument();
      expect(screen.getByText('a link')).toBeInTheDocument();
      expect(screen.getByText('emphasized text')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports screen reader announcement', () => {
      render(
        <Alert role="alert" aria-live="assertive" data-testid="accessible-alert">
          <AlertTitle>Urgent</AlertTitle>
          <AlertDescription>This requires immediate attention</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('accessible-alert');
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('handles keyboard navigation', () => {
      render(
        <Alert tabIndex={0} data-testid="focusable-alert">
          <AlertTitle>Focusable Alert</AlertTitle>
          <AlertDescription>This alert can receive focus</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('focusable-alert');
      alert.focus();
      expect(alert).toHaveFocus();
    });

    it('provides semantic structure', () => {
      render(
        <Alert data-testid="semantic-alert">
          <AlertTitle>Semantic Title</AlertTitle>
          <AlertDescription>
            <p>First paragraph</p>
            <ul>
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      render(<Alert data-testid="empty-alert" />);

      const alert = screen.getByTestId('empty-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toBeEmptyDOMElement();
    });

    it('handles only title without description', () => {
      render(
        <Alert data-testid="title-only-alert">
          <AlertTitle>Title Only</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('handles only description without title', () => {
      render(
        <Alert data-testid="description-only-alert">
          <AlertDescription>Description only</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Description only')).toBeInTheDocument();
    });

    it('handles multiple descriptions', () => {
      render(
        <Alert data-testid="multiple-descriptions-alert">
          <AlertTitle>Multiple Descriptions</AlertTitle>
          <AlertDescription>First description</AlertDescription>
          <AlertDescription>Second description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('First description')).toBeInTheDocument();
      expect(screen.getByText('Second description')).toBeInTheDocument();
    });
  });

  describe('Styling Variants', () => {
    it('applies correct border and text colors for default variant', () => {
      render(<Alert data-testid="default-variant">Default</Alert>);

      const alert = screen.getByTestId('default-variant');
      expect(alert).toHaveClass('border');
      expect(alert).not.toHaveClass('border-destructive/50');
    });

    it('applies correct border and text colors for destructive variant', () => {
      render(
        <Alert variant="destructive" data-testid="destructive-variant">
          Destructive
        </Alert>
      );

      const alert = screen.getByTestId('destructive-variant');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });
  });
});
