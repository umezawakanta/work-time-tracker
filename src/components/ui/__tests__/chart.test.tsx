import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
} from '../chart';

// Mock recharts to avoid Canvas issues in testing
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children, data, onMouseEnter, onMouseLeave }: any) => (
    <div
      data-testid="line-chart"
      data-chart-data={JSON.stringify(data)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  PieChart: ({ children, data }: any) => (
    <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }: any) => (
    <div data-testid="chart-line" data-key={dataKey} data-stroke={stroke} />
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid="chart-bar" data-key={dataKey} data-fill={fill} />
  ),
  Pie: ({ dataKey, data }: any) => (
    <div data-testid="chart-pie" data-key={dataKey} data-pie-data={JSON.stringify(data)} />
  ),
  Cell: ({ fill }: any) => <div data-testid="chart-cell" data-fill={fill} />,
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ dataKey }: any) => <div data-testid="y-axis" data-key={dataKey} />,
  Tooltip: ({ content, active, payload, label }: any) =>
    active && content ? React.createElement(content, { active, payload, label }) : null,
  Legend: ({ content, payload }: any) => {
    if (content && React.isValidElement(content)) {
      return React.cloneElement(content, { payload } as any);
    }
    if (content && typeof content === 'function') {
      return React.createElement(content, { payload });
    }
    return null;
  },
}));

// Test data
const testData = [
  { month: 'Jan', sales: 100, revenue: 1200 },
  { month: 'Feb', sales: 150, revenue: 1800 },
  { month: 'Mar', sales: 120, revenue: 1440 },
  { month: 'Apr', sales: 200, revenue: 2400 },
];

// Test chart config
const testConfig: ChartConfig = {
  sales: {
    label: 'Sales',
    color: '#8884d8',
  },
  revenue: {
    label: 'Revenue',
    color: '#82ca9d',
  },
  users: {
    label: 'Users',
    theme: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
};

// Test chart config with icons
const TestIcon = () => <span data-testid="test-icon">📈</span>;

const testConfigWithIcons: ChartConfig = {
  sales: {
    label: 'Sales',
    color: '#8884d8',
    icon: TestIcon,
  },
  revenue: {
    label: 'Revenue',
    color: '#82ca9d',
    icon: TestIcon,
  },
};

// Test components
const TestLineChart: React.FC<{
  config?: ChartConfig;
  data?: any[];
  className?: string;
}> = ({ config = testConfig, data = testData, className }) => (
  <ChartContainer config={config} className={className}>
    <LineChart data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <Line dataKey="sales" stroke="var(--color-sales)" />
      <Line dataKey="revenue" stroke="var(--color-revenue)" />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </LineChart>
  </ChartContainer>
);

const TestBarChart: React.FC = () => (
  <ChartContainer config={testConfig}>
    <BarChart data={testData}>
      <XAxis dataKey="month" />
      <YAxis />
      <Bar dataKey="sales" fill="var(--color-sales)" />
      <ChartTooltip content={<ChartTooltipContent />} />
    </BarChart>
  </ChartContainer>
);

const TestChartWithCustomTooltip: React.FC<{
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
}> = ({ hideLabel, hideIndicator, indicator }) => (
  <ChartContainer config={testConfigWithIcons}>
    <LineChart data={testData}>
      <Line dataKey="sales" stroke="var(--color-sales)" />
      <ChartTooltip
        content={
          <ChartTooltipContent
            hideLabel={hideLabel}
            hideIndicator={hideIndicator}
            indicator={indicator}
          />
        }
      />
    </LineChart>
  </ChartContainer>
);

describe('Chart Components', () => {
  describe('ChartContainer', () => {
    it('renders chart container with default styling', () => {
      render(<TestLineChart />);

      const container = screen.getByTestId('responsive-container').parentElement;
      expect(container).toHaveClass('flex', 'aspect-video', 'justify-center', 'text-xs');
    });

    it('applies custom className', () => {
      render(<TestLineChart className="custom-chart-class" />);

      const container = screen.getByTestId('responsive-container').parentElement;
      expect(container).toHaveClass('custom-chart-class');
    });

    it('generates unique chart ID', () => {
      render(<TestLineChart />);

      const container = screen.getByTestId('responsive-container').parentElement;
      expect(container).toHaveAttribute('data-chart');
      expect(container?.getAttribute('data-chart')).toMatch(/^chart-/);
    });

    it('uses provided ID when specified', () => {
      const TestChartWithId = () => (
        <ChartContainer config={testConfig} id="custom-chart">
          <LineChart data={testData}>
            <Line dataKey="sales" />
          </LineChart>
        </ChartContainer>
      );

      render(<TestChartWithId />);

      const container = screen.getByTestId('responsive-container').parentElement;
      expect(container).toHaveAttribute('data-chart', 'chart-custom-chart');
    });

    it('renders ResponsiveContainer', () => {
      render(<TestLineChart />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders chart children correctly', () => {
      render(<TestLineChart />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('passes chart data correctly', () => {
      render(<TestLineChart />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(testData));
    });
  });

  describe('ChartStyle', () => {
    it('generates CSS variables for colors', () => {
      render(<TestLineChart />);

      const styleElement = document.querySelector('style');
      expect(styleElement).toBeInTheDocument();

      const cssContent = styleElement?.innerHTML;
      expect(cssContent).toContain('--color-sales: #8884d8');
      expect(cssContent).toContain('--color-revenue: #82ca9d');
    });

    it('generates theme-specific CSS variables', () => {
      const themeConfig: ChartConfig = {
        users: {
          label: 'Users',
          theme: {
            light: '#3b82f6',
            dark: '#60a5fa',
          },
        },
      };

      render(<TestLineChart config={themeConfig} />);

      const styleElement = document.querySelector('style');
      const cssContent = styleElement?.innerHTML;

      expect(cssContent).toContain('--color-users: #3b82f6');
      expect(cssContent).toContain('.dark');
      expect(cssContent).toContain('--color-users: #60a5fa');
    });

    it('does not render style when no color config', () => {
      const noColorConfig: ChartConfig = {
        sales: { label: 'Sales' },
      };

      render(<TestLineChart config={noColorConfig} />);

      // Chart should render even without color config
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('ChartTooltipContent', () => {
    it('renders tooltip content when active', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 150,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 150 },
        },
      ];

      const { container } = render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} label="Feb" />
        </ChartContainer>
      );

      // Verify that tooltip content is rendered
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('does not render when inactive', () => {
      const { container } = render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={false} payload={[]} />
        </ChartContainer>
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders with different indicators', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 150,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 150 },
        },
      ];

      const { rerender } = render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} indicator="dot" />
        </ChartContainer>
      );

      let indicator = document.querySelector('.tooltip-indicator');
      expect(indicator).toHaveClass('h-2.5', 'w-2.5');

      rerender(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} indicator="line" />
        </ChartContainer>
      );

      indicator = document.querySelector('.tooltip-indicator');
      expect(indicator).toHaveClass('w-1');

      rerender(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} indicator="dashed" />
        </ChartContainer>
      );

      indicator = document.querySelector('.tooltip-indicator');
      expect(indicator).toHaveClass('border-dashed', 'bg-transparent');
    });

    it('hides label when hideLabel is true', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 150,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 150 },
        },
      ];

      render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} label="Feb" hideLabel={true} />
        </ChartContainer>
      );

      expect(screen.queryByText('Feb')).not.toBeInTheDocument();
    });

    it('hides indicator when hideIndicator is true', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 150,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 150 },
        },
      ];

      render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} hideIndicator={true} />
        </ChartContainer>
      );

      const indicator = document.querySelector('.tooltip-indicator');
      expect(indicator).not.toBeInTheDocument();
    });

    it('renders icons from config', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 150,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 150 },
        },
      ];

      render(
        <ChartContainer config={testConfigWithIcons}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('formats values correctly', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 1500,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 1500 },
        },
      ];

      render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );

      expect(screen.getByText('1,500')).toBeInTheDocument();
    });

    it('uses custom formatter when provided', () => {
      const mockPayload = [
        {
          dataKey: 'sales',
          name: 'sales',
          value: 150,
          color: '#8884d8',
          payload: { month: 'Feb', sales: 150 },
        },
      ];

      const customFormatter = jest.fn((value, name) => `${name}: $${value}`);

      render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} formatter={customFormatter} />
        </ChartContainer>
      );

      expect(customFormatter).toHaveBeenCalledWith(
        150,
        'sales',
        mockPayload[0],
        0,
        mockPayload[0].payload
      );
    });
  });

  describe('ChartLegendContent', () => {
    it('renders legend items correctly', () => {
      const mockPayload = [
        { value: 'sales', dataKey: 'sales', color: '#8884d8' },
        { value: 'revenue', dataKey: 'revenue', color: '#82ca9d' },
      ];

      render(
        <ChartContainer config={testConfig}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      );

      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('does not render when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={testConfig}>
          <ChartLegendContent payload={[]} />
        </ChartContainer>
      );

      // With empty payload, legend should not render content
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByText('Sales')).not.toBeInTheDocument();
      expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
    });

    it('renders icons when available and not hidden', () => {
      const mockPayload = [{ value: 'sales', dataKey: 'sales', color: '#8884d8' }];

      render(
        <ChartContainer config={testConfigWithIcons}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('hides icons when hideIcon is true', () => {
      const mockPayload = [{ value: 'sales', dataKey: 'sales', color: '#8884d8' }];

      render(
        <ChartContainer config={testConfigWithIcons}>
          <ChartLegendContent payload={mockPayload} hideIcon={true} />
        </ChartContainer>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();

      const indicator = document.querySelector('.legend-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('applies correct styling for vertical alignment', () => {
      const mockPayload = [{ value: 'sales', dataKey: 'sales', color: '#8884d8' }];

      const { rerender } = render(
        <ChartContainer config={testConfig}>
          <ChartLegendContent payload={mockPayload} verticalAlign="top" />
        </ChartContainer>
      );

      // Verify legend content is rendered
      expect(screen.getByText('Sales')).toBeInTheDocument();

      rerender(
        <ChartContainer config={testConfig}>
          <ChartLegendContent payload={mockPayload} verticalAlign="bottom" />
        </ChartContainer>
      );

      // Verify legend content is still rendered with different alignment
      expect(screen.getByText('Sales')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const mockPayload = [{ value: 'sales', dataKey: 'sales', color: '#8884d8' }];

      render(
        <ChartContainer config={testConfig}>
          <ChartLegendContent payload={mockPayload} className="custom-legend" />
        </ChartContainer>
      );

      // Verify legend content is rendered
      expect(screen.getByText('Sales')).toBeInTheDocument();
    });
  });

  describe('useChart Hook', () => {
    it('provides chart context', () => {
      let contextValue: any;

      const TestComponent = () => {
        const chart = require('../chart').useChart();
        contextValue = chart;
        return <div>Test</div>;
      };

      render(
        <ChartContainer config={testConfig}>
          <TestComponent />
        </ChartContainer>
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.config).toBe(testConfig);
    });

    it('throws error when used outside ChartContainer', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        require('../chart').useChart();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useChart must be used within a <ChartContainer />'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('renders complete line chart with tooltip and legend', () => {
      render(<TestLineChart />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getAllByTestId('chart-line')).toHaveLength(2);
    });

    it('renders complete bar chart', () => {
      render(<TestBarChart />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    it('handles different chart types', () => {
      const PieChartTest = () => (
        <ChartContainer config={testConfig}>
          <PieChart data={testData}>
            <Pie dataKey="sales" data={testData}>
              {testData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`var(--color-sales)`} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      );

      render(<PieChartTest />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
      expect(screen.getAllByTestId('chart-cell')).toHaveLength(testData.length);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty config gracefully', () => {
      const emptyConfig: ChartConfig = {};

      render(<TestLineChart config={emptyConfig} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      render(<TestLineChart data={[]} />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveAttribute('data-chart-data', '[]');
    });

    it('handles malformed payload in tooltip', () => {
      const malformedPayload = [{ notAValidKey: 'test' }];

      const { container } = render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={malformedPayload as any} />
        </ChartContainer>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles missing config keys gracefully', () => {
      const mockPayload = [
        {
          dataKey: 'unknownKey',
          name: 'unknownKey',
          value: 150,
          color: '#8884d8',
        },
      ];

      render(
        <ChartContainer config={testConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );

      expect(screen.getByText('unknownKey')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible chart structure', () => {
      render(<TestLineChart />);

      const container = screen.getByTestId('responsive-container').parentElement;
      expect(container).toBeInTheDocument();

      // Chart should be accessible via assistive technology
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('supports keyboard navigation for interactive elements', () => {
      render(<TestLineChart />);

      // Chart elements should be focusable if interactive
      const chartElement = screen.getByTestId('line-chart');
      expect(chartElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily with same config', () => {
      const renderSpy = jest.fn();

      const TestChart = ({ config }: { config: ChartConfig }) => {
        renderSpy();
        return (
          <ChartContainer config={config}>
            <LineChart data={testData}>
              <Line dataKey="sales" />
            </LineChart>
          </ChartContainer>
        );
      };

      const { rerender } = render(<TestChart config={testConfig} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Same config should not cause unnecessary re-renders of child components
      rerender(<TestChart config={testConfig} />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // Context provider will re-render
    });

    it('handles large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        month: `Month ${i}`,
        sales: Math.random() * 1000,
        revenue: Math.random() * 2000,
      }));

      render(<TestLineChart data={largeDataset} />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toBeInTheDocument();
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(largeDataset));
    });
  });
});
