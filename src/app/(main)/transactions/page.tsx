"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { VscRefresh as Refresh } from "react-icons/vsc";
import { IoAdd as FaAdd } from "react-icons/io5";
import { BsFilter as Filter } from "react-icons/bs";
import { FaTableList as Table } from "react-icons/fa6";
import { TbLayoutList as UI } from "react-icons/tb";

import Loader from "@/components/Loader";
import type { TransactionType } from "@/db/methods";
import TransactionPalette from "@/components/TransactionPalette";
import { useTransactionStore } from "@/lib/store";
import { ACC_OWNER, isAdmin, formatEthiopianDate } from "@/lib/utils";
import Link from "next/link";
import FilterPopup from "@/components/FilterPopup";
import AddTransactionPopup from "@/components/AddTransactionPopup";
import SummaryPopup from "@/components/SummaryPopup";
import { font as customFontBase64 } from "@/lib/font";
import { RiFileList2Line as Sum } from "react-icons/ri";
// import { getMockTransactions } from "@/lib/testData";

export default function Page() {
  const {
    data,
    setData,
    dataIn,
    setDataIn,
    total,
    setTotal,
    setAllUsers,
    setFilterOthers,
    setFilterState,
    setCustomTo,
    setCustomFrom,
  } = useTransactionStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [filterPopUp, setFilterPopUp] = useState(false);
  const [addPopup, setAddPopup] = useState(false);
  const [summaryPopup, setSummaryPopup] = useState(false);
  const [listType, setListType] = useState<string>("ui");
  const [showRemaining, setShowRemaining] = useState([false, false]);

  const fetchUsers = async () => {
    try {
      const res = await (await fetch("/api/getAllUsers")).json();
      setAllUsers(res);
      //console.log("the response " + res);
    } catch (err) {
      console.log("Error fetching users: " + err);
    } finally {
    }
  };

  useEffect(() => {
    let total_ = 0;

    const data_ = dataIn
      .filter((d) => "parsed" in d.transaction ? d.transaction.parsed : !d.transaction.message?.length)
      .forEach(({ transaction }) => {
        let amountStr = transaction.amount;
        if (amountStr.includes(" ")) {
          amountStr = amountStr.split(" ")[1];
        }
        const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));

        const owner = ACC_OWNER.toLowerCase();
        const receiver = transaction.recieverAcc.trim().toLowerCase();

        const isCredited =
          transaction.direction
            ? transaction.direction === "FROM"
            : owner.includes(receiver);

        if (isCredited) total_ += amount;
        else total_ -= amount;
        // const accCredited = ACC_OWNER.toLowerCase().includes(
        //   transaction.recieverAcc.trim().toLowerCase(),
        // );

        // if (accCredited) total_ += parseFloat(transaction.amount.split(" ")[1]);
        // else total_ -= parseFloat(transaction.amount.split(" ")[1]);
      });

    setTotal(total_);
  }, [dataIn]);

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

      setData(parsedData);
      setDataIn(parsedData);
      fetchUsers();
      // console.log(
      //   parsedData.find((each) => (!each.transaction.date ? each : null)),
      // );
    } catch (error) {
      setError("Connect to internet, if issue persists let us know");
      console.log("Error ", error);
    } finally {
      setFilterOthers({
        trans: "All",
        bank: "All",
        category: "All",
        users: "All",
      });
      setFilterState(["All"]);
      setCustomTo("");
      setCustomFrom("");
      setLoading(false);
    }
  }, [setData, user, setDataIn]);

  const handleExport = () => {
    const pdf = new jsPDF();

    pdf.addFileToVFS("CustomFont.ttf", customFontBase64);

    // 3. Register it as a font name you can reference
    pdf.addFont("CustomFont.ttf", "CustomFont", "normal");

    // 4. Set it as the default font for the document
    pdf.setFont("CustomFont");

    // 5. Pass the font into autoTable styles
    autoTable(pdf, {
      html: "#exportable-table",
      styles: {
        font: "CustomFont", // 👈 Ensures the table body uses the font
        fontStyle: "normal",
      },
      headStyles: {
        font: "CustomFont", // 👈 Ensures the table header uses the font
        fontStyle: "normal",
      },
    });

    // autoTable(pdf, {
    //   html: "#exportable-table",
    // });

    pdf.save(`table-${Intl.DateTimeFormat("en-GB").format(Date.now())}`);
  };

  useEffect(() => {
    if (!data) (() => fetchData())();
    else return (() => setLoading(false))();
  }, [fetchData, data, user]);

  return (
    <div className="md:p-10 p-3 pt-6 gap-8 h-full min-h-screen items-center justify-center/ w-full flex flex-col">
      {filterPopUp && <FilterPopup onClose={() => setFilterPopUp(false)} />}
      {addPopup && (
        <AddTransactionPopup
          onClose={() => setAddPopup(false)}
          onSuccess={() => setData(null)}
        />
      )}
      { summaryPopup && <SummaryPopup onClose={() => setSummaryPopup(false)} /> }
	      { /* <div
        onClick={() => setSummaryPopup(true)}
        className="fixed bottom-32 right-10 p-4 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl cursor-pointer z-50 text-white transition-colors"
      >
        <Sum className="size-6" />
      </div> */ }

     <div className="flex flex-col w-full gap-9">
      <div className="z-10 px-3 w-full justify-between flex gap-10 items-center">
        <div className="text-2xl font-bold">Transactions</div>

        <div className="flex gap-4">
          <div
            onClick={() => setFilterPopUp(true)}
            className={`p-3 rounded-full bg-theme-accent/50 backdrop-blur-2xl hover:bg-theme-accent size-full transition-colors cursor-pointer`}
          >
            <Filter className="size-5" />
          </div>
          <div
            onClick={fetchData}
            className={`p-3 rounded-full bg-theme-accent/50 backdrop-blur-2xl hover:bg-theme-accent size-full transition-colors cursor-pointer`}
          >
            <Refresh className="size-5" />
          </div>
          {isAdmin(user?.id) ? (
            <div
              onClick={() => setAddPopup(true)}
              className={`px-6/ p-3 rounded-full bg-theme-accent/50 backdrop-blur-2xl hover:bg-theme-accent text-lg transition-colors cursor-pointer`}
            >
              <FaAdd className="size-5" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="z-1 px-3 w-full justify-between flex gap-10 items-center">
        <div className="flex gap-4">
          <div
            onClick={() => setListType("ui")}
            className={`${listType === "ui" ? "shadow-lg bg-theme-accent/90 font-bold  scale-105" : "bg-theme-card"} p-3 rounded-full backdrop-blur-2xl hover:bg-theme-accent size-full transition-colors cursor-pointer`}
          >
            <UI className="size-5" />
          </div>
          <div
            onClick={() => setListType("table")}
            className={`${listType === "table" ? "shadow-lg bg-theme-accent/90 font-bold  scale-105" : "bg-theme-card"} p-3 rounded-full backdrop-blur-2xl hover:bg-theme-accent size-full transition-colors cursor-pointer`}
          >
            <Table className="size-5" />
          </div>
        </div>

          <div
        onClick={() => setSummaryPopup(true)}
            className={`px-6/ p-3 rounded-full bg-theme-accent/50 hover:bg-theme-accent backdrop-blur-2xl text-lg transition-all cursor-pointer`}
          >
            <Sum className="size-5" />
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
          <div className="text-theme-text/50 w-full h-full flex items-center justify-center text-lg">
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
            <div className="w-full flex justify-end pb-2 pr-4">
              <div
                onClick={handleExport}
                className="rounded-full backdrop-blur-2xl bg-theme-accent/40 backdrop-blur-2xl hover:backdrop-blur-2xl hover:bg-theme-card text-sm text-white px-5 py-3 transition-colors"
              >
                Export
              </div>
            </div>
            <table
              id="exportable-table"
              className="w-max min-w-full text-left border-collapse backdrop-blur-2xl"
            >
              <thead>
                <tr className="text-theme-text/70 border-b-5 border-theme-border">
                  <th className="p-3">From
                  {" " + formatEthiopianDate(dataIn[dataIn.length - 1].transaction.date)}</th>
                  <th className="p-3">To
                  {" " + formatEthiopianDate(dataIn[0].transaction.date)}</th>
                </tr>
              </thead>
              <thead>
                <tr className="text-theme-text/70 border-b border-theme-border">
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
                {/* dataIn
                  .filter((d) =>
                    "parsed" in d.transaction
                      ? d.transaction.parsed
                      : !d.transaction?.message?.length,
                  )
                  .map((rowData) => {
                    const row = rowData.transaction;
                    const toOrFrom = ACC_OWNER.toLowerCase().includes(
                      row.recieverAcc.toLowerCase(),
                    ) ? (
                      <div className="flex text-center items-center">
                        <span className="text-xs text-center text-theme-text/50">
                          FROM{" "}
                        </span>
                        <span className="capitalize">{row.payerAcc}</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-theme-text/50">TO </span>
                        <span className="capitalize">{row.recieverAcc}</span>
                      </>
                    );

                    return (
                      <tr
                        key={Math.random()}
                        className="border-b border-theme-border/50 hover:bg-theme-accent"
                      >
                        <td className="p-3">{row.date}</td>
                        <td className="p-3">{toOrFrom}</td>
                        <td className="p-3">{row.reason}</td>
                        <td className="p-3">{row.amount}</td>
                        <td className="p-3">{row.category}</td>
                        <td className="p-3">{row.bank}</td>
                        <td className="w-35">
                          {row.url ? (
                            <Link
                              target="_blank"
                              href={row.url}
                              className="px-5 py-2 bg-theme-accent rounded-full"
                            >
                              View Reciept
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  }) */}

                {dataIn
                  .filter((d) =>
                    "parsed" in d.transaction
                      ? d.transaction.parsed
                      : !d.transaction?.message?.length,
                  )
                  .map((rowData, idx) => {
                    const row = rowData.transaction;

                    // ✅ NEW: prefer direction field if available
                    const direction =
                      row.direction ??
                      (ACC_OWNER.toLowerCase().includes(
                        row.recieverAcc.toLowerCase(),
                      )
                        ? "FROM"
                        : "TO");

                    const toOrFrom =
                      direction === "FROM" ? (
                        <div className="flex text-center items-center">
                          <span className="text-xs text-center text-theme-text/50">
                            FROM{" "}
                          </span>
                          <span className="capitalize">{" " + row.payerAcc}</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs text-theme-text/50">TO </span>
                          <span className="capitalize">{row.recieverAcc}</span>
                        </>
                      );

                    return (
                      <tr
                        key={Math.random()} // better than Math.random()
                        className={`${idx % 2 ? "" : "bg-theme-accent/5"} border-b border-theme-border/50 /hover:bg-theme-accent`}
                      >
                        <td className="p-3">{formatEthiopianDate(row.date)}</td>
                        <td className="p-3">{toOrFrom}</td>
                        <td className="p-3">{row.reason}</td>
                        <td className="p-3">{"ETB " + (Number(row.amount) || 0).toLocaleString()}</td>
                        <td className="p-3">{row.category}</td>
                        <td className="p-3">{row.bank}</td>
                        <td className="w-35">
                          {row.url ? (
                            <Link
                              target="_blank"
                              href={row.url}
                              className="px-5 py-2 bg-theme-accent rounded-full"
                            >
                              View Receipt
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}

                <tr className="border-b border-theme-border/50 hover:bg-theme-accent font-bold">
                  <td className="p-3">Net</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="p-3">ETB {total.toLocaleString()}</td>
                  <td className="p-3"></td>
                  <td className="p-3"></td>
                  <td className="w-35"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
