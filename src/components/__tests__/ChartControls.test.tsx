import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartControls from '../ChartControls';

describe('ChartControls', () => {
  it('renders without crashing when mediaList is empty', () => {
    const { container } = render(<ChartControls mediaList={[]} activeMedia="" />);

    expect(container.firstChild).toBeInTheDocument();
    const tabsList = container.querySelector('[role="tablist"]');
    expect(tabsList).toBeInTheDocument();
  });

  it('renders single media item correctly', () => {
    const mediaList = ['テレビ'];

    render(<ChartControls mediaList={mediaList} activeMedia="テレビ" />);

    expect(screen.getByRole('tab', { name: 'テレビ' })).toBeInTheDocument();
  });

  it('renders multiple media items correctly', () => {
    const mediaList = ['テレビ', 'ラジオ', '新聞', 'インターネット'];

    render(<ChartControls mediaList={mediaList} activeMedia="テレビ" />);

    mediaList.forEach((media) => {
      expect(screen.getByRole('tab', { name: media })).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to container', () => {
    const { container } = render(<ChartControls mediaList={['テレビ']} activeMedia="テレビ" />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('sticky', 'top-0', 'z-10', 'bg-black');
  });

  it('applies correct CSS classes to TabsList', () => {
    const { container } = render(<ChartControls mediaList={['テレビ']} activeMedia="テレビ" />);

    const tabsList = container.querySelector('[role="tablist"]');
    expect(tabsList).toHaveClass(
      'mb-4',
      'bg-gray-900',
      'p-2',
      'flex',
      'flex-wrap',
      'justify-center',
      'gap-2'
    );
  });

  it('applies correct CSS classes to TabsTrigger', () => {
    render(<ChartControls mediaList={['テレビ']} activeMedia="テレビ" />);

    const tab = screen.getByRole('tab', { name: 'テレビ' });
    expect(tab).toHaveClass(
      'px-4',
      'py-2',
      'text-base',
      'text-white',
      'rounded-md',
      'flex-shrink-0'
    );
  });

  it.skip('renders tabs with correct value attributes', () => {
    const mediaList = ['テレビ', 'ラジオ'];

    render(<ChartControls mediaList={mediaList} activeMedia="テレビ" />);

    const tvTab = screen.getByRole('tab', { name: 'テレビ' });
    const radioTab = screen.getByRole('tab', { name: 'ラジオ' });

    expect(tvTab).toHaveAttribute('data-value', 'テレビ');
    expect(radioTab).toHaveAttribute('data-value', 'ラジオ');
  });

  it('handles special characters in media names', () => {
    const mediaList = ['テレビ & ラジオ', 'インターネット/SNS', '新聞・雑誌'];

    render(<ChartControls mediaList={mediaList} activeMedia="テレビ & ラジオ" />);

    mediaList.forEach((media) => {
      expect(screen.getByRole('tab', { name: media })).toBeInTheDocument();
    });
  });

  it('handles very long media list', () => {
    const mediaList = Array.from({ length: 20 }, (_, i) => `メディア${i + 1}`);

    render(<ChartControls mediaList={mediaList} activeMedia="メディア1" />);

    mediaList.forEach((media) => {
      expect(screen.getByRole('tab', { name: media })).toBeInTheDocument();
    });
  });

  it('handles undefined activeMedia gracefully', () => {
    const mediaList = ['テレビ', 'ラジオ'];

    const { container } = render(
      <ChartControls mediaList={mediaList} activeMedia={undefined as any} />
    );

    expect(container.firstChild).toBeInTheDocument();
    mediaList.forEach((media) => {
      expect(screen.getByRole('tab', { name: media })).toBeInTheDocument();
    });
  });
});
