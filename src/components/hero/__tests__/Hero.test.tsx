import React from 'react';
import { render, screen } from '@/test-utils/render';
import Hero from '@/components/hero/Hero';

// Snapshot test for Hero component
describe('Hero', () => {
  it('renders default hero and matches snapshot', () => {
    const { container } = render(<Hero onPrimaryClick={jest.fn()} onSecondaryClick={jest.fn()} />);
    // Ensure critical texts are in the document before snapshot
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders with custom texts and matches snapshot', () => {
    const { container } = render(
      <Hero
        title="カスタムタイトル"
        subtitle="カスタムサブタイトル"
        ctaPrimaryText="今すぐ始める"
        ctaSecondaryText="3分でセットアップ"
        onPrimaryClick={jest.fn()}
        onSecondaryClick={jest.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: 'カスタムタイトル' })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
