type Props = {
  data: {
    name: string;
    total: number;
    count: number;
    average: number;
  }[];
};

export default function ReasonTable({ data }: Props) {
  return (
    <div className="w-full text-xs overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-theme-text/70 border-b border-theme-border">
            <th className="p-3">Reason</th>
            <th className="p-3">Total (ETB)</th>
            <th className="p-3">Transactions</th>
            <th className="p-3">Average</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={row.name}
              className="border-b border-theme-border/50 hover:bg-theme-accent"
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
