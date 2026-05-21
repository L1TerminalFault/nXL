"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useTransactionStore } from "@/lib/store";

type Props = {
  data: {
    name: string;
    total: number;
    count: number;
    average: number;
  }[];
};

export default function SummaryTable({ data }: Props) {
  const { filterState } = useTransactionStore();

  let allTotal = 0;
  let allNum = 0;

  data.forEach((row) => {
    allTotal += row.total;
    allNum += row.count;
  });

  const handleExport = () => {
    const pdf = new jsPDF();

    autoTable(pdf, {
      html: "#exportable",
    });

    pdf.save(`table-${Intl.DateTimeFormat("en-GB").format(Date.now())}`);
  };

  return (
    <div className="w-full flex flex-col gap-5 text-xs overflow-x-auto">
      <div className="w-full flex justify-end pr-4">
        <div
          onClick={handleExport}
          className="rounded-full bg-white/5 hover:bg-white/10 text-sm text-white px-5 py-3 transition-colors"
        >
          Export
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-white/10">
            <th className="p-3">Category</th>
            <th className="p-3">Total (ETB)</th>
            <th className="p-3">Transactions</th>
            <th className="p-3">Daily</th>
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
          <tr className="font-bold">
            <td className="p-3">Total</td>
            <td className="p-3">{allTotal.toFixed(2)}</td>
            <td className="p-3">{allNum}</td>
            <td className="p-3">
              {filterState.length === 2 || filterState.length === 3
                ? (allTotal / 30).toFixed(2)
                : filterState.length === 4 ||
                    (filterState.length === 5 &&
                      filterState.at(filterState.length - 1) === "All")
                  ? (allTotal / 7).toFixed(2)
                  : filterState.length === 1
                    ? (allTotal / 360).toFixed(2)
                    : allTotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
