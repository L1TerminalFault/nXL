"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

import { useTransactionStore } from "@/lib/store";
import { font as customFontBase64 } from "@/lib/font";
import { formatEthiopianDate } from "@/lib/utils";

type Props = {
  data: {
    name: string;
    total: number;
    count: number;
    average: number;
  }[];
};

export default function SummaryTable({ data }: Props) {
  const { filterState, customFrom, customTo, dataIn } = useTransactionStore();

  let allTotal = 0;
  let allNum = 0;

  data.forEach((row) => {
    allTotal += row.total;
    allNum += row.count;
  });

  const perDay = (amount: number) => Number(filterState.length === 2 || filterState.length === 3
                ? (amount / 30).toFixed(2)
                : filterState.length === 4 ||
                    (filterState.length === 5 &&
                      filterState.at(filterState.length - 1) === "All")
                  ? (amount / 7).toFixed(2)
                  : filterState.length === 1 && filterState[0] === "All"
                    ? (amount / 360).toFixed(2)
                    : (
                        amount /
                        (Math.floor(
                          (new Date(customTo || Date.now()).getTime() -
                            new Date(customFrom || Date.now()).getTime()) /
                            86400000,
                        ) + 1 || 1)
                      ).toFixed(2)).toLocaleString()
  

  const handleExport = async () => {
    const pdf = new jsPDF({ orientation: "landscape" });

    pdf.addFileToVFS("CustomFont.ttf", customFontBase64);
    pdf.addFont("CustomFont.ttf", "CustomFont", "normal");
    pdf.setFont("CustomFont");

    autoTable(pdf, {
      html: "#export-summary-table",
      styles: {
        font: "CustomFont",
        fontStyle: "normal",
        fontSize: 9,
      },
      headStyles: {
        font: "CustomFont",
        fontStyle: "normal",
      },
      tableWidth: "auto",
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
    pdf.save(`summary-${Intl.DateTimeFormat("en-GB").format(Date.now())}.pdf`);
    // } catch (err) {
    //   console.error(err);
    // }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-xs overflow-x-auto">
      <div className="w-full flex justify-end pr-4">
        <div
          onClick={handleExport}
          className="rounded-full bg-theme-accent hover:bg-theme-card/80 text-sm text-white px-5 py-3 transition-colors"
        >
          Export
        </div>
      </div>
      <table
        id="export-summary-table"
        className="w-full text-left border-collapse backdrop-blur-2xl"
      >
      <thead>
	<tr className="text-theme-text/70 border-b-5 border-theme-border">
	  <th className="p-3">From
	  {" " + formatEthiopianDate(customFrom.length ? customFrom : dataIn[dataIn.length -1].transaction.date)}</th>
	  <th className="p-3">To
	  {" " + formatEthiopianDate(customTo.length ? customTo : dataIn[0].transaction.date)}</th>
	  <th>{" "}</th>
	  <th>{" "}</th>
	</tr>
      </thead>
        <thead>
          <tr className="text-theme-text/70 border-b border-theme-border">
            <th className="p-3">Category</th>
            <th className="p-3">Total</th>
            <th className="p-3">Transactions</th>
            <th className="p-3">Daily</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.name}
              className={`${idx % 2 ? "" : "bg-theme-accent/5"} border-b border-theme-border/50 hover:bg-theme-accent`}
            >
              <td className="p-3">{row.name}</td>
              <td className="p-3">{"ETB " + Number(row.total.toFixed(2)).toLocaleString()}</td>
              <td className="p-3">{row.count}</td>
              <td className="p-3">{"ETB " + perDay(row.total)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="p-3">Total</td>
            <td className="p-3">{"ETB " + Number(allTotal.toFixed(2)).toLocaleString()}</td>
            <td className="p-3">{allNum}</td>
            <td className="p-3">
              {"ETB " + perDay(allTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
