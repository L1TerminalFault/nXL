"use client";

import { useState } from "react";
import { TransactionParsedType } from "@/db/methods";
import { categories } from "@/lib/utils";
import { toGregorian } from "ethiopian-calendar-new";

interface AddTransactionPopupProps {
  onClose: () => void;
}

export default function AddTransactionPopup({ onClose }: AddTransactionPopupProps) {
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<"TO" | "FROM">("TO");
  const [accountInput, setAccountInput] = useState("");
  
  const [formData, setFormData] = useState({
    reason: "",
    amount: "",
    date: "",
    bank: "",
    remaining: "",
    url: "",
    category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setCategory = (cat: string) => {
    setFormData({ ...formData, category: cat });
  };

  const handleAdd = async () => {
    if (!accountInput || !formData.amount || !formData.date || !formData.category || !direction || !formData.reason) {
      alert("Please fill all required fields: Account Name, Amount, Reason, Date, and Category.");
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

      const gcDate = toGregorian(year, month, day);
      const dateObj = new Date(gcDate.year, gcDate.month - 1, gcDate.day);
      dateIso = dateObj.toISOString();
    } catch (err) {
      alert("Please enter the date in a valid Ethiopian format: YYYY-MM-DD");
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
    };

    try {
      await fetch("/api/addTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white/4 backdrop-blur-2xl border border-white/10 rounded-4xl p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto scrollbar-hidden"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg text-gray-500 pl-3">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
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

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
             <label className="text-xs text-gray-500 pl-1">Transaction Direction & Account <span className="text-red-500">*</span></label>
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setDirection("FROM")}
                className={`flex-1 py-2 text-sm transition-colors ${direction === "FROM" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}
              >
                FROM
              </button>
              <button
                onClick={() => setDirection("TO")}
                className={`flex-1 py-2 text-sm transition-colors border-l border-white/10 ${direction === "TO" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"}`}
              >
                TO
              </button>
            </div>
            <input
              type="text"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30 transition-colors w-full mt-2"
              placeholder={`Enter ${direction === "TO" ? "Receiver's" : "Payer's"} Account Name`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData).filter(k => k !== "category").map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 pl-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1")} {['reason', 'amount', 'date'].includes(key) && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={key === 'date' ? 'date' : 'text'}
                  name={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30 transition-colors"
                  placeholder={key === 'date' ? "YYYY-MM-DD (Ethiopian Calendar)" : key.replace(/([A-Z])/g, " $1").trim()}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 pl-1">Category <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${formData.category === cat ? "bg-white/20 border-white/30 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex w-full justify-end">
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex py-3 px-7 bg-white/10 text-white hover:bg-white/15 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
