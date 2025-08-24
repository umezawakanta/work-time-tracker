interface District {
  id: number;
  name: string;
}

interface HokkaidoMapProps {
  districts: District[];
  selectedDistrict: number;
  onDistrictSelect: (district: number) => void;
}

export default function HokkaidoMap({
  districts,
  selectedDistrict,
  onDistrictSelect,
}: HokkaidoMapProps) {
  const maxDistrict = Math.max(...districts.map((d) => d.id));
  const columns = Math.ceil(Math.sqrt(maxDistrict));
  const rows = Math.ceil(maxDistrict / columns);

  const cellWidth = 100;
  const cellHeight = 100;
  const padding = 10;

  const viewBoxWidth = columns * (cellWidth + padding) + padding;
  const viewBoxHeight = rows * (cellHeight + padding) + padding;

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto">
      {districts.map((district) => {
        const col = (district.id - 1) % columns;
        const row = Math.floor((district.id - 1) / columns);
        const x = padding + col * (cellWidth + padding);
        const y = padding + row * (cellHeight + padding);

        return (
          <g key={district.id}>
            <rect
              x={x}
              y={y}
              width={cellWidth}
              height={cellHeight}
              fill={selectedDistrict === district.id ? '#ff0000' : '#cccccc'}
              stroke="#ffffff"
              strokeWidth="2"
              onClick={() => onDistrictSelect(district.id)}
              className="cursor-pointer hover:fill-blue-300 transition-colors duration-200"
            />
            <text
              x={x + cellWidth / 2}
              y={y + cellHeight / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000000"
              fontSize="12"
            >
              {district.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
