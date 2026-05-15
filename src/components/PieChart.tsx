import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PieData = {
  name: string;
  value: number;
};

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
];

export default function TransactionPieChart({ data }: { data: PieData[] }) {
  return (
    <div className="w-full h-[50%] max-md:text-xs">
      <ResponsiveContainer width={"100%"} height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            //{/* innerRadius={20} */}
            paddingAngle={0}
            label={({ name, percent }) =>
              `${name} (${((percent || 0) * 100).toFixed(0)}%)`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => {
              const num = Number(value ?? 0);

              return [`ETB ${num.toFixed(2)}`, "Amount"];
            }}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
