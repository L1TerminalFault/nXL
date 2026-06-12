"use client";

import { useEffect, useState } from "react";
import { useTransactionStore } from "@/lib/store";
import { ACC_OWNER, buildCategorySummary } from "@/lib/utils";
import SummaryTable from "@/components/SummaryTable";
import TransactionPieChart from "@/components/PieChart";
import { TransactionParsedType } from "@/db/methods";

export default function SummaryPopup({ onClose }: { onClose: () => void }) {
  const { locked, dataIn, filterState } = useTransactionStore();
  const [dataUsed, setDataUsed] = useState<TransactionParsedType[]>([]);

  useEffect(() => {
    setDataUsed(
      dataIn.filter((d: TransactionParsedType): boolean => {
        const tx = d.transaction;
  
        const owner = ACC_OWNER.toLowerCase();
        const receiver = tx.recieverAcc.trim().toLowerCase();
  
        if (tx.direction) {
          if (tx.direction === "TO") return true;
          return false;
        }
  
        const isExpense = owner.includes(receiver) || receiver.includes(owner);
        return !isExpense;
      })
    );
  }, [locked, dataIn]);

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
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white/4 backdrop-blur-2xl border border-theme-border rounded-4xl p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto scrollbar-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-theme-accent hover:bg-theme-card/80 rounded-full transition-colors text-theme-text/70 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="text-theme-text/50 text-center">Expenses Summary</div>

        <div className="text-theme-text/50 text-lg flex flex-col gap-10 items-center justify-center h-full w-full">
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
    </div>
  );
}
