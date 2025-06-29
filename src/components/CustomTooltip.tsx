import { TooltipProps } from 'recharts';
import './CustomTooltip.css'; // CSSファイルのインポート

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    stroke: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-xl border border-gray-700">
        <p className="text-lg font-bold text-white mb-3">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex justify-between items-center gap-4 text-gray-300"
            >
              <div className="flex items-center">
                <div
                  className="tooltip-color-indicator"
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('--indicator-color', entry.stroke);
                    }
                  }}
                />
                <span className="font-medium">{entry.name.split('(')[0]}</span>
              </div>
              <span className="font-bold text-base text-white">
                {entry.value ? `${entry.value.toFixed(1)}%` : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
