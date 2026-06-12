"use client";

import { useState, useEffect } from "react";
import { TransactionParsedType, Direction } from "@/db/methods";
import { categories } from "@/lib/utils";
import { toGregorian, toEthiopian } from "ethiopian-calendar-new";
import { useTransactionStore } from "@/lib/store";

interface AddTransactionPopupProps {
  onClose: () => void;
  inline?: boolean;
  onSuccess?: () => void;
  id?: string;
}

export default function AddTransactionPopup({
  onClose,
  inline,
  onSuccess,
  id,
}: AddTransactionPopupProps) {
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<Direction>("TO");
  const [accountInput, setAccountInput] = useState("");
  const [deleteBtn, setDeleteBtn] = useState("Delete");
  const { setData } = useTransactionStore();

  const [formData, setFormData] = useState({
    reason: "",
    amount: "",
    date: "",
    bank: "",
    remaining: "",
    url: "",
    category: "",
  });

  const banks = ["CBE", "TeleBirr"];

  useEffect(() => {
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const delete_ = async () => {
    setDeleteBtn("Deleting...");
    try {
      await fetch(`/api/deleteTransaction?id=${id}`);
    } catch (err) {
      console.log("Error deleting transaction" + err);
    } finally {
      setDeleteBtn("Deleted");
      const tId = setTimeout(() => {
        setDeleteBtn("Delete");
        clearTimeout(tId);
      }, 2000);
      setData(null);
    }
  };

  const setCategory = (cat: string) => {
    setFormData({ ...formData, category: cat });
  };

  const handleAdd = async () => {
    if (
      !accountInput ||
      !formData.amount ||
      !formData.date ||
      !direction ||
      !formData.bank
    ) {
      alert("Please fill all required fields: Account Name, Amount, and Date.");
      return;
    }

    setLoading(true);

    let dateIso = formData.date;
    try {
      const [yearStr, monthStr, dayStr] = formData.date.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const day = parseInt(dayStr);

      if (!year || !month || !day) throw new Error("Invalid date parts");

      const dateObj = new Date(year, month - 1, day);
      dateIso = dateObj.toISOString();
    } catch (err) {
      alert("Please enter the date in a valid format: YYYY-MM-DD");
      setLoading(false);
      return;
    }

    const payerAcc = direction === "TO" ? "Jemal" : accountInput;
    const recieverAcc = direction === "TO" ? accountInput : "Jemal";

    const payload: TransactionParsedType["transaction"] = {
      payerAcc,
      payerAccNo: "",
      recieverAcc,
      recieverAccNo: "",
      reason: formData.reason,
      amount: formData.amount,
      date: dateIso,
      bank: formData.bank,
      remaining: formData.remaining,
      url: formData.url,
      category: formData.category,

      direction,
      parsed: true,
      message: "",
    };

    try {
      await fetch("/api/addTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div
      onClick={(e) => {
        if (!inline) e.stopPropagation();
      }}
      className={`w-full max-w-5xl bg-white/4 backdrop-blur-2xl border border-theme-border ${inline ? "rounded-2xl p-4 md:p-6" : "rounded-4xl p-6 max-h-[90vh] overflow-y-auto scrollbar-hidden"} flex flex-col gap-6`}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-theme-text/50 pl-3">Add Transaction</h2>
        <button
          onClick={onClose}
          className="p-3 bg-theme-card hover:bg-theme-card/80 rounded-full transition-colors text-theme-text/70 hover:text-white"
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
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <label className="text-xs text-theme-text/50 pl-1">
            Transaction Direction & Account{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex bg-theme-card border-0 border-theme-border rounded-full overflow-hidden">
            <button
              onClick={() => setDirection("FROM")}
              className={`flex-1 py-2 text-sm transition-colors ${direction === "FROM" ? "bg-theme-accent/50 text-white" : "text-theme-text/70 hover:text-white"}`}
            >
              FROM
            </button>
            <button
              onClick={() => setDirection("TO")}
              className={`flex-1 py-2 text-sm transition-colors border-l border-theme-border ${direction === "TO" ? "bg-theme-accent/50 text-white" : "text-theme-text/70 hover:text-white"}`}
            >
              TO
            </button>
          </div>
          <input
            type="text"
            value={accountInput}
            onChange={(e) => setAccountInput(e.target.value)}
            className="bg-theme-card border-0 border-theme-border rounded-full px-4 py-2 text-white outline-none focus:border-theme-border transition-colors w-full mt-2"
            placeholder={`Enter ${direction === "TO" ? "Receiver's" : "Payer's"} Account Name`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData)
            .filter((k) => k !== "category" && k !== "bank")
            .map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-theme-text/50 pl-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1") === "url"
                    ? "Reciept Link"
                    : key.replace(/([A-Z])/g, " $1") === "date"
                      ? "Date In Gregorian"
                      : key.replace(/([A-Z])/g, " $1")}{" "}
                  {["amount", "date"].includes(key) && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type={key === "date" ? "date" : ["amount", "remaining"].includes(key) ? "number" : "text"}
                  step={["amount", "remaining"].includes(key) ? "any" : undefined}
                  name={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="bg-theme-card border-0 border-theme-border rounded-full px-4 py-2 text-white outline-none focus:border-theme-border transition-colors"
                  placeholder={
                    key === "date"
                      ? "MM-DD-YYYY"
                      : key === "url"
                        ? "Reciept Link"
                        : key
                            .replace(/([A-Z])/g, " $1")
                            .trim()[0]
                            .toUpperCase() +
                          key
                            .replace(/([A-Z])/g, " $1")
                            .trim()
                            .slice(1)
                  }
                />
              </div>
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-theme-text/50 pl-1">
            Bank <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {banks.map((b) => (
              <button
                key={b}
                onClick={() => setFormData({ ...formData, bank: b })}
                className={`px-4 py-1.5 rounded-full hover:bg-theme-card/80 text-xs transition-colors border-0 ${formData.bank === b ? "bg-theme-accent/50 border-theme-border text-white" : "bg-theme-card border-theme-border text-theme-text/70 hover:border-theme-border hover:text-theme-text/80"}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-theme-text/50 pl-1">Category </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full hover:bg-theme-card/80 text-xs transition-colors border-0 ${formData.category === cat ? "bg-theme-accent/50 border-theme-border text-white" : "bg-theme-card border-theme-border text-theme-text/70 hover:border-theme-border hover:text-theme-text/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 gap-3 flex w-full justify-end">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex py-3 px-7 bg-theme-accent/50 text-white hover:bg-theme-card rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>

        {inline ? (
          <button
            onClick={delete_}
            disabled={loading}
            className="flex py-3 px-7 bg-red-500/60 hover:bg-red-500/90 text-white rounded-full transition-colors disabled:opacity-50"
          >
            {deleteBtn}
          </button>
        ) : null}
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      {content}
    </div>
  );
}
