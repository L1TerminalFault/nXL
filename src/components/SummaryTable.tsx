type Props = {
  data: {
    name: string;
    total: number;
    count: number;
    average: number;
  }[];
};

export default function SummaryTable({ data }: Props) {
  return (
    <div className="w-full text-xs overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-white/10">
            <th className="p-3">Category</th>
            <th className="p-3">Total (ETB)</th>
            <th className="p-3">Transactions</th>
            <th className="p-3">Average</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={row.name}
              className="border-b border-white/5 hover:bg-white/5"
            >
              <td className="p-3">{row.name}</td>
              <td className="p-3">{row.total.toFixed(2)}</td>
              <td className="p-3">{row.count}</td>
              <td className="p-3">{row.average.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
