"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

import Loader from "@/components/Loader";
import { TransactionType } from "@/db/methods";
import TransactionPalette from "@/components/TransactionPalette";
import { useTransactionStore } from "@/lib/store";
import TransactionPieChart from "@/components/PieChart";
import {
  ACC_OWNER,
  buildCategorySummary,
  buildReasonSummary,
} from "@/lib/utils";
import SummaryTable from "@/components/SummaryTable";
import ReasonTable from "@/components/ReasonTable";

export default function Page() {
  const { data, setData } = useTransactionStore();
  const [graphData, setGraphData] = useState("All");
  const [dataIn, setDataIn] = useState(data);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [tab, setTab] = useState<"transactions" | "summary">("transactions");

  const fetchData = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const fetched = (await (
        await fetch("/api/fetchTransactions?user=" + user?.id)
      ).json()) as {
        status: string;
        data: TransactionType[];
      };

      const parsedData = fetched.data.map(({ _id, transaction, users }) => ({
        _id,
        users,
        transaction: JSON.parse(transaction),
      }));

      // console.log(parsedData);
      setData(parsedData);
    } catch {
      setError("Connect to internet, if issue persists let us know");
    } finally {
      setLoading(false);
    }
  }, [setData, user]);

  useEffect(() => {
    if (data.length) return (() => setLoading(false))();
    (() => fetchData())();
  }, [fetchData, data.length, user]);

  // NOTE: Use this instead of data to have only the expenses - data.filter((d) => !d.transaction.recieverAcc.includes(ACC_OWNER)),
  // NOTE: Use this instead of data to have only the incomes - data.filter((d) => !d.transaction.payerAcc.includes(ACC_OWNER)),
  // NOTE: Use this for all transactions - data
  const pieData = buildCategorySummary(dataIn).map((c) => ({
    name: c.name,
    value: c.total,
    total: c.total,
    count: c.count,
    average: c.average,
  }));

  const reasonData = buildReasonSummary(dataIn).map((c) => ({
    name: c.name,
    value: c.total,
    total: c.total,
    count: c.count,
    average: c.average,
  }));

  return (
    <div className="md:p-10 p-3 pt-6 gap-8 h-full min-h-screen items-center justify-center/ w-full flex flex-col">
      <div className="pt-30/ py-9/ z-1 backdrop-blur-2xl w-full justify-center flex gap-10 items-center">
        <div
          onClick={() => setTab("transactions")}
          className={`px-4 py-2 rounded-2xl hover:bg-white/5 text-lg transition-colors ${tab === "transactions" ? "bg-white/5" : ""}`}
        >
          Transactions
        </div>
        <div
          onClick={() => {
            setTab("summary");
            setTimeout(() => document.getElementById("init")?.click(), 500);
          }}
          className={`px-4 py-2 rounded-2xl hover:bg-white/5 text-lg transition-colors ${tab === "summary" ? "bg-white/5" : ""}`}
        >
          Summary
        </div>
      </div>

      {/* <div onClick={add}>Add</div> */}
      {tab === "transactions" ? (
        <div className="flex w-full flex-1 gap-6 h-full /justify-center items-center flex-col">
          {loading ? (
            <div className="flex flex-col w-full h-full items-center justify-center gap-4">
              <Loader />
            </div>
          ) : error.length ? (
            <div className="text-red-500 text-lg">{error}</div>
          ) : !data.length ? (
            <div className="text-gray-500 w-full h-full flex items-center justify-center text-lg">
              No transactions found.
            </div>
          ) : (
            <div className="flex flex-col w-full h-full items-center gap-4">
              {data.map((transaction) => (
                <TransactionPalette key={transaction._id} data={transaction} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-lg flex flex-col gap-10 items-center justify-center h-full w-full">
          <div className="w-full flex gap-4 text-xs">
            <div
              id="init"
              onClick={() => {
                setDataIn(data);
                setGraphData("All");
              }}
              className={`${graphData === "All" ? "bg-white/5 text-white" : ""} rounded-2xl hover:bg-white/5 transition-colors px-4 py-2`}
            >
              All
            </div>
            <div
              onClick={() => {
                setDataIn(
                  data.filter(
                    (d) => !d.transaction.recieverAcc.includes(ACC_OWNER),
                  ),
                );
                setGraphData("Expenses");
              }}
              className={`${graphData === "Expenses" ? "bg-white/5 text-white" : ""} rounded-2xl hover:bg-white/5 transition-colors px-4 py-2`}
            >
              Expenses
            </div>
            <div
              onClick={() => {
                setDataIn(
                  data.filter(
                    (d) => !d.transaction.payerAcc.includes(ACC_OWNER),
                  ),
                );
                setGraphData("Incomes");
              }}
              className={`${graphData === "Incomes" ? "bg-white/5 text-white" : ""} rounded-2xl hover:bg-white/5 transition-colors px-4 py-2`}
            >
              Incomes
            </div>
          </div>

          <TransactionPieChart data={pieData} />
          <SummaryTable data={pieData} />
          <ReasonTable data={reasonData} />
        </div>
      )}
    </div>
  );
}
