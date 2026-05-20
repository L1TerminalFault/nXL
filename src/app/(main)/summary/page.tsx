"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import { useTransactionStore } from "@/lib/store";
import { ACC_OWNER, buildCategorySummary } from "@/lib/utils";
import SummaryTable from "@/components/SummaryTable";
import TransactionPieChart from "@/components/PieChart";
import { TransactionParsedType } from "@/db/methods";

export default function Filter() {
  const { locked, dataIn, filterState } = useTransactionStore();
  const [dataUsed, setDataUsed] = useState<TransactionParsedType[]>([]);

  useEffect(() => {
    if (locked) redirect("/");
    (() =>
      setDataUsed(
        dataIn.filter((d) => !d.transaction.recieverAcc.includes(ACC_OWNER)),
      ))();
  }, [locked, dataIn]);

  // NOTE: Use this instead of data to have only the expenses - data.filter((d) => !d.transaction.recieverAcc.includes(ACC_OWNER)),
  // NOTE: Use this instead of data to have only the incomes - data.filter((d) => !d.transaction.payerAcc.includes(ACC_OWNER)),
  // NOTE: Use this for all transactions - data
  const pieData = buildCategorySummary(dataUsed).map((c) => ({
    name: c.name,
    value: c.total,
    total: c.total,
    count: c.count,
    average:
      filterState.length === 2 || filterState.length === 3
        ? c.total / 30
        : filterState.length === 4 ||
            (filterState.length === 5 &&
              filterState.at(filterState.length - 1) === "All")
          ? c.total / 7
          : filterState.length === 1
            ? c.total / 360
            : c.total,
  }));

  return (
    <div className="md:p-10 p-3 pt-6 gap-20 h-full min-h-screen items-center justify-center/ w-full flex flex-col">
      <div className="text-gray-500">Expenses Summary</div>

      <div className="text-gray-500 text-lg flex flex-col gap-30 items-center justify-center h-full w-full">
        {!dataUsed.length ? (
          <div className="text-gray-500 w-full h-full flex items-center justify-center text-lg">
            No transactions found.
          </div>
        ) : (
          <>
            <TransactionPieChart data={pieData} />
            <SummaryTable data={pieData} />
          </>
        )}
      </div>
    </div>
  );
}
