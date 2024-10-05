interface HokkaidoMapProps {
  selectedDistrict: number;
  onDistrictSelect: (district: number) => void;
}

export default function HokkaidoMap({
  selectedDistrict,
  onDistrictSelect,
}: HokkaidoMapProps) {
  const districts = [
    { id: 1, path: "M100,100 L150,100 L150,150 L100,150 Z", name: "第1区" },
    { id: 2, path: "M150,100 L200,100 L200,150 L150,150 Z", name: "第2区" },
    { id: 3, path: "M100,150 L150,150 L150,200 L100,200 Z", name: "第3区" },
    { id: 4, path: "M150,150 L200,150 L200,200 L150,200 Z", name: "第4区" },
    // Add more districts as needed
  ];

  return (
    <svg viewBox="0 0 300 300" className="w-full h-auto">
      {districts.map((district) => (
        <g key={district.id}>
          <path
            d={district.path}
            fill={selectedDistrict === district.id ? "#ff0000" : "#cccccc"}
            stroke="#ffffff"
            strokeWidth="2"
            onClick={() => onDistrictSelect(district.id)}
            className="cursor-pointer hover:fill-blue-300 transition-colors duration-200"
          />
          <text
            x={district.id % 2 === 1 ? 110 : 160}
            y={district.id <= 2 ? 135 : 185}
            textAnchor="middle"
            fill="#000000"
            fontSize="12"
          >
            {district.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
