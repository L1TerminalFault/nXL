"use client";

import { useState, useEffect, useCallback } from "react";

import Loader from "@/components/Loader";
import { TransactionType } from "@/db/methods";
import TransactionPalette from "@/components/TransactionPalette";
import { useTransactionStore } from "@/lib/store";

import TransactionPieChart from "@/components/PieChart";
import { buildCategoryTotals } from "@/lib/utils";

export default function Page() {
  const { data, setData } = useTransactionStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"transactions" | "summary">("transactions");

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

      console.log(parsedData);
      setData(parsedData);
    } catch {
      setError("Connect to internet, if issue persists let us know");
    } finally {
      setLoading(false);
    }
  }, [setData]);

  useEffect(() => {
    if (data.length) return (() => setLoading(false))();
    (() => fetchData())();
  }, [fetchData, data.length]);
  const pieData = buildCategoryTotals(data);

  return (
    <div className="p-10 pt-6 gap-8 h-full min-h-screen items-center justify-center/ w-full flex flex-col">
      <div className="pt-30/ py-9/ z-1 backdrop-blur-2xl w-full justify-center flex gap-10 items-center">
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
      {tab === "transactions" ? (
        <div className="flex w-full flex-1 gap-6 h-full justify-center items-center flex-col">
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
      ) : (
        <div className="text-gray-500 text-lg">
          <TransactionPieChart data={pieData} />
        </div>
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
// useEffect(() => {
//   (async () =>
//     await (
//       await fetch("/api/addTransaction", {
//         method: "POST",
//         body: JSON.stringify({
//           transaction:
//             "Dear Mr Kaleab your Account 1********5744 has been credited with ETB 3000.00. Your Current Balance is ETB 3620.07. Thank you for Banking with CBE! for Reciept https://apps.cbe.com.et:100/BranchReceipt/FT26129VVJGD&21195744",
//         }),
//       })
//     ).json())();
// }, []);
//
// const add = async () => {
//   await fetch("/api/addTransaction", {
//     method: "POST",
//     body: JSON.stringify({
//       text: " jslfjsdfjsdklfj sljfdslkjf https://mbreciept.cbe.com.et/FT26131F781G-21195744",
//     }),
//   });
// };
//
// const add = async () => {
//   const text = await extract(
//     "https://apps.cbe.com.et:100/BranchReceipt/FT26129VVJGD&21195744",
//   );
//   console.log(text);
// };
//
