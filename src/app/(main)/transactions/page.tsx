"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

import Loader from "@/components/Loader";
import type { TransactionParsedType, TransactionType } from "@/db/methods";
import TransactionPalette from "@/components/TransactionPalette";
import { useTransactionStore } from "@/lib/store";
import { ACC_OWNER } from "@/lib/utils";
import Link from "next/link";
import FilterPopup from "@/components/FilterPopup";
// import { getMockTransactions } from "@/lib/testData";

export default function Page() {
  const { data, setData, dataIn, setDataIn, filterState } =
    useTransactionStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [filterPopUp, setFilterPopUp] = useState(false);
  const [listType, setListType] = useState<string>("ui");

  const fetchData = useCallback(async () => {
    // setLoading(false);
    // setDataIn(getMockTransactions());
    // return setData(getMockTransactions());
    //
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
      setDataIn(parsedData);
    } catch {
      setError("Connect to internet, if issue persists let us know");
    } finally {
      setLoading(false);
    }
  }, [setData, user, setDataIn]);

  useEffect(() => {
    if (!data) (() => fetchData())();
    else if (data.length) return (() => setLoading(false))();
  }, [fetchData, data, user]);

  return (
    <div className="md:p-10 p-3 pt-6 gap-8 h-full min-h-screen items-center justify-center/ w-full flex flex-col">
      {filterPopUp && <FilterPopup onClose={() => setFilterPopUp(false)} />}
      <div className="z-1 px-3 backdrop-blur-2xl w-full justify-between flex gap-10 items-center">
        <div className="flex gap-4">
          <div
            onClick={() => setListType("ui")}
            className={`${listType === "ui" ? "bg-white/15" : ""} px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-lg transition-colors`}
          >
            UI
          </div>
          <div
            onClick={() => setListType("table")}
            className={`${listType === "ui" ? "" : "bg-white/15"} px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-lg transition-colors`}
          >
            Table
          </div>
        </div>

        <div
          onClick={() => setFilterPopUp(true)}
          className={`px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-lg transition-colors`}
        >
          Filter
        </div>
      </div>

      <div className="flex flex-col w-full gap-3">
        <div className="flex w-full justify-between px-4  items-center">
          <div className="text-gray-500">CBE Balance</div>
          <div className="">
            {dataIn.find((dat) => dat.transaction.bank === "CBE")?.transaction
              ?.remaining || ""}
          </div>
        </div>

        <div className="flex w-full justify-between px-4  items-center">
          <div className="text-gray-500">TeleBirr Balance</div>
          <div className="">
            {dataIn.find((dat) => dat.transaction.bank === "TeleBirr")
              ?.transaction?.remaining || ""}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 gap-6 h-full items-center flex-col">
        {loading ? (
          <div className="flex flex-col w-full h-full items-center justify-center gap-4">
            <Loader />
          </div>
        ) : error.length ? (
          <div className="text-red-500 text-lg">{error}</div>
        ) : !dataIn ? null : !dataIn.length ? (
          <div className="text-gray-500 w-full h-full flex items-center justify-center text-lg">
            No transactions found.
          </div>
        ) : listType === "ui" ? (
          <div className="flex flex-col w-full h-full items-center gap-4">
            {dataIn.map((transaction) => (
              <TransactionPalette key={transaction._id} data={transaction} />
            ))}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-max min-w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="p-3">Date</th>
                  <th className="p-3">Transaction</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Bank</th>
                  <th className="p-3">Reciept</th>
                </tr>
              </thead>

              <tbody>
                {dataIn.map((rowData) => {
                  const row = rowData.transaction;
                  const toOrFrom = row.recieverAcc.includes(ACC_OWNER) ? (
                    <div className="flex text-center items-center">
                      <span className="text-xs text-center text-gray-500">
                        FROM{" "}
                      </span>
                      <span className="capitalize">{row.payerAcc}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500">TO </span>
                      <span className="capitalize">{row.recieverAcc}</span>
                    </>
                  );

                  return (
                    <tr
                      key={row.url}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">{toOrFrom}</td>
                      <td className="p-3">{row.reason}</td>
                      <td className="p-3">{row.amount}</td>
                      <td className="p-3">{row.category}</td>
                      <td className="p-3">{row.bank}</td>
                      <td className="w-35">
                        <Link
                          target="_blank"
                          href={row.url}
                          className="px-5 py-2 bg-white/5 rounded-full"
                        >
                          View Reciept
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
