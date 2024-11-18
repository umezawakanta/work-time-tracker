import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// サンプルデータ
const data = [
  {
    date: '2021',
    自民: 20,
    立憲: 8,
    国民: 2,
    公明: 5,
    共産: 3,
    維新: 4,
    社民: 1,
    れ新: 2,
    つく: 0.5,
    参政: 1
  },
  // ... 他の年のデータ
];

const PoliticalChart = () => {
  return (
    <div className="w-full h-[600px] bg-black p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="date"
            stroke="#fff"
            tick={{ fill: '#fff' }}
          />
          <YAxis
            stroke="#fff"
            tick={{ fill: '#fff' }}
            domain={[0, 20]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#333',
              border: '1px solid #666',
              color: '#fff'
            }}
          />
          <Legend
            wrapperStyle={{
              color: '#fff'
            }}
          />
          <Line type="monotone" dataKey="自民" stroke="#00ff00" dot={false} />
          <Line type="monotone" dataKey="立憲" stroke="#0088ff" dot={false} />
          <Line type="monotone" dataKey="国民" stroke="#ffff00" dot={false} />
          <Line type="monotone" dataKey="公明" stroke="#ff69b4" dot={false} />
          <Line type="monotone" dataKey="共産" stroke="#ff0000" dot={false} />
          <Line type="monotone" dataKey="維新" stroke="#ff8c00" dot={false} />
          <Line type="monotone" dataKey="社民" stroke="#4b0082" dot={false} />
          <Line type="monotone" dataKey="れ新" stroke="#800080" dot={false} />
          <Line type="monotone" dataKey="つく" stroke="#ffd700" dot={false} />
          <Line type="monotone" dataKey="参政" stroke="#8b4513" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PoliticalChart;