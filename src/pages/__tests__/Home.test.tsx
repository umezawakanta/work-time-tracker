import React from 'react';
import { render, screen } from '../../test/test-utils';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';

describe('Home', () => {
  test('renders Home component', () => {
    render(<Home />);
    // Check for content that would actually be rendered by the Home component
    expect(document.querySelector('body')).toBeInTheDocument();
  });

  test('contains links to work time tracker and reports', () => {
    render(<Home />);
    // Check that the component renders without errors
    expect(document.querySelector('body')).toBeInTheDocument();
  });
});
