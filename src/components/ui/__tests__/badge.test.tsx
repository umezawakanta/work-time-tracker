import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '../badge';

describe('Badge Component', () => {
  test('renders badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  test('applies default variant classes', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-primary');
  });

  test('applies secondary variant classes', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-secondary');
  });

  test('applies destructive variant classes', () => {
    render(
      <Badge variant="destructive" data-testid="badge">
        Destructive
      </Badge>
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-destructive');
  });

  test('applies outline variant classes', () => {
    render(
      <Badge variant="outline" data-testid="badge">
        Outline
      </Badge>
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('border');
  });

  test('forwards additional props', () => {
    render(
      <Badge data-testid="custom-badge" className="custom-class">
        Custom
      </Badge>
    );
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toHaveClass('custom-class');
  });

  test('renders with proper HTML structure', () => {
    render(<Badge>Badge Content</Badge>);
    const badge = screen.getByText('Badge Content');
    expect(badge.tagName).toBe('SPAN');
  });
});
