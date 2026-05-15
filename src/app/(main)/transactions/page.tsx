"use client";

import { useState, useEffect, useCallback } from "react";

import Loader from "@/components/Loader";
import { TransactionType } from "@/db/methods";
import TransactionPalette from "@/components/TransactionPalette";
import { useTransactionStore } from "@/lib/store";

export default function Page() {
  const { data, setData } = useTransactionStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"transactions" | "summary">("transactions");

  // const add = async () => {
  //   await fetch("/api/addTransaction", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       text: " jslfjsdfjsdklfj sljfdslkjf https://mbreciept.cbe.com.et/FT26131F781G-21195744",
  //     }),
  //   });
  // };
  //
  const fetchData = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const fetched = (await (
        await fetch("/api/fetchTransactions")
      ).json()) as {
        status: string;
        data: TransactionType[];
      };

      const parsedData = fetched.data.map(({ _id, transaction, users }) => ({
        _id,
        users,
        transaction: JSON.parse(transaction),
      }));

      setData(parsedData);
    } catch {
      setError("Connect to internet, if issue persists let us know");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (() => fetchData())();
  }, [fetchData]);

  return (
    <div className="p-10 pt-25 gap-10 h-full items-center justify-center w-full flex flex-col">
      <div className="absolute top-10 py-5 z-0 backdrop-blur-2xl w-full justify-center flex gap-10 items-center">
        <div
          onClick={() => setTab("transactions")}
          className={`px-4 py-2 rounded-2xl hover:bg-white/5 text-lg transition-colors ${tab === "transactions" ? "bg-white/5" : ""}`}
        >
          Transactions
        </div>
        <div
          onClick={() => setTab("summary")}
          className={`px-4 py-2 rounded-2xl hover:bg-white/5 text-lg transition-colors ${tab === "summary" ? "bg-white/5" : ""}`}
        >
          Summary
        </div>
      </div>

      {/* <div onClick={add}>Add</div> */}
      {loading ? (
        <Loader />
      ) : error.length ? (
        <div className="text-red-500 text-lg">{error}</div>
      ) : !data.length ? (
        <div className="text-gray-500 text-lg">No transactions found.</div>
      ) : (
        data.map((transaction) => (
          <TransactionPalette key={transaction._id} data={transaction} />
        ))
      )}
    </div>
  );
}

// const [text, setText] = useState(Object);
//
// const handleFile = async (e: any) => {
//   const file = e.target.files[0];
//
//   const pdfjsLib = await import("pdfjs-dist");
//
//   // ✅ IMPORTANT: set worker locally (fixes your error)
//   pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//     "pdfjs-dist/build/pdf.worker.min.mjs",
//     import.meta.url,
//   ).toString();
//
//   const pdf = await pdfjsLib.getDocument({
//     data: await file.arrayBuffer(),
//   }).promise;
//
//   const page = await pdf.getPage(1);
//   const content = await page.getTextContent();
//
//   const text = content.items.map((i: any) => i.str).join(" ");
//
//   setText(text);
//   const res = await (await fetch("/api/getTransactionData")).json();
//   setText(res);
// };
