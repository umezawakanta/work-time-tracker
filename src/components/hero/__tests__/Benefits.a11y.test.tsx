import React from 'react';
import { render, screen, within } from '@/test-utils/render';
import Benefits from '@/components/hero/Benefits';
import { BENEFITS_COPY } from '@/constants/copy';

describe.skip('Benefits accessibility', () => {
  it('has an accessible section label and proper heading hierarchy (h3 only)', () => {
    const { container } = render(<Benefits />);

    const section = screen.getByLabelText('Benefits section');
    expect(section).toBeInTheDocument();

    // Ensure only h3 within this component (no h1/h2 in the section scope)
    const h1s = within(section).queryAllByRole('heading', { level: 1 });
    const h2s = within(section).queryAllByRole('heading', { level: 2 });
    const h3s = within(section).getAllByRole('heading', { level: 3 });

    expect(h1s.length).toBe(0);
    expect(h2s.length).toBe(0);
    expect(h3s.length).toBe(BENEFITS_COPY.items.length);

    // Each title should match copy
    BENEFITS_COPY.items.forEach((item) => {
      expect(
        within(section).getByRole('heading', { level: 3, name: item.title })
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('uses sufficiently contrasting text utility classes for titles and descriptions', () => {
    render(<Benefits />);
    const section = screen.getByLabelText('Benefits section');

    // Titles should use text-slate-900
    BENEFITS_COPY.items.forEach((item) => {
      const titleEl = within(section).getByRole('heading', { level: 3, name: item.title });
      expect(titleEl).toHaveClass('text-slate-900');
    });

    // Descriptions should use text-slate-600 and be present
    BENEFITS_COPY.items.forEach((item) => {
      const descEl = within(section).getByText(item.description);
      expect(descEl).toHaveClass('text-slate-600');
    });
  });

  it('hides decorative icon SVGs from the accessibility tree', () => {
    render(<Benefits />);
    const section = screen.getByLabelText('Benefits section');

    // Each card has an icon wrapper span with aria-hidden
    const iconWrappers = section.querySelectorAll('span[aria-hidden]');
    expect(iconWrappers.length).toBeGreaterThanOrEqual(BENEFITS_COPY.items.length);
  });
});
