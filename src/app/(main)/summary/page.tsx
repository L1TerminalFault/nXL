"use client";

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
    setDataUsed(
      dataIn.filter((d: TransactionParsedType): boolean => {
        const tx = d.transaction;
  
        const owner = ACC_OWNER.toLowerCase();
        const receiver = tx.recieverAcc.trim().toLowerCase();
  
        // 🔥 NEW SYSTEM (preferred)
        if (tx.direction) {
          if (tx.direction === "TO") return true;
  
          return false;
        }
  
        // 🔙 OLD SYSTEM fallback (bidirectional fuzzy match)
        const isExpense =
          owner.includes(receiver) || receiver.includes(owner);
  
        // If owner is involved and it's likely "sent", exclude it
        return !isExpense;
      })
    );
  }, [locked, dataIn]);

  // useEffect(() => {
  //   // if (locked) redirect("/");
  //   (() =>
  //     setDataUsed(
  //       dataIn.filter(
  //         (d: TransactionParsedType) =>
  //           !d.transaction.recieverAcc
  //             .toLowerCase()
  //             .includes(ACC_OWNER.toLowerCase()) &&
  //           !ACC_OWNER.toLowerCase().includes(
  //             d.transaction.recieverAcc.toLowerCase(),
  //           ),
  //       ),
  //     ))();
  // }, [locked, dataIn]);

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
    <div
      id="summary-page"
      className="md:p-10 p-3 pt-6 gap-20 h-full min-h-screen items-center justify-center/ w-full flex flex-col"
    >
      <div className="text-theme-text/50">Expenses Summary</div>

      <div className="text-theme-text/50 text-lg flex flex-col gap-30 items-center justify-center h-full w-full">
        {!dataUsed.length ? (
          <div className="text-theme-text/50 w-full h-full flex items-center justify-center text-lg">
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
