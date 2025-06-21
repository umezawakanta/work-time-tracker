import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

describe('Card Components', () => {
  test('renders Card with children', () => {
    render(
      <Card data-testid="card">
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders CardHeader with children', () => {
    render(
      <CardHeader data-testid="card-header">
        <div>Header content</div>
      </CardHeader>
    );
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  test('renders CardTitle with text', () => {
    render(<CardTitle>Test Title</CardTitle>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders CardDescription with text', () => {
    render(<CardDescription>Test Description</CardDescription>);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('renders CardContent with children', () => {
    render(
      <CardContent data-testid="card-content">
        <p>Content text</p>
      </CardContent>
    );
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  test('renders CardFooter with children', () => {
    render(
      <CardFooter data-testid="card-footer">
        <button>Footer Button</button>
      </CardFooter>
    );
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
  });

  test('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>This is a complete card example</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });
});
