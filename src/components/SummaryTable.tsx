"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

import { useTransactionStore } from "@/lib/store";
import {font as customFontBase64} from "@/lib/font";

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

  const handleExport = async () => {
    const pdf = new jsPDF();

    pdf.addFileToVFS("CustomFont.ttf", customFontBase64);

    // 3. Register it as a font name you can reference
    pdf.addFont("CustomFont.ttf", "CustomFont", "normal");

    // 4. Set it as the default font for the document
    pdf.setFont("CustomFont");

    // 5. Pass the font into autoTable styles
    autoTable(pdf, {
        html: "#export-summary-table",
        styles: {
            font: "CustomFont", // 👈 Ensures the table body uses the font
            fontStyle: "normal"
        },
        headStyles: {
            font: "CustomFont", // 👈 Ensures the table header uses the font
            fontStyle: "normal"
        }
    });

    // autoTable(pdf, {
    //         html: "#export-summary-table",
    // });
    // const element = document.getElementById("summary-page");
    // if (!element) return;

    // try {
    //   const canvas = await html2canvas(element, {
    //     scale: 2,
    //     useCORS: true,
    //     backgroundColor: "#000000",
    //     windowWidth: element.scrollWidth,
    //     windowHeight: element.scrollHeight,
    //   });
    //   const data = canvas.toDataURL("image/png");
    //   const pdf = new jsPDF("p", "mm", "a4");

    //   const pdfWidth = pdf.internal.pageSize.getWidth();
    //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    //   pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
       pdf.save(`summary-${Intl.DateTimeFormat("en-GB").format(Date.now())}.pdf`,);
    // } catch (err) {
    //   console.error(err);
    // }
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
      <table
        id="export-summary-table"
        className="w-full text-left border-collapse"
      >
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
