"use client";

import { useState } from "react";
import { TransactionParsedType } from "@/db/methods";

interface AddTransactionPopupProps {
  onClose: () => void;
}

export default function AddTransactionPopup({ onClose }: AddTransactionPopupProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionParsedType["transaction"]>({
    payerAcc: "",
    payerAccNo: "",
    recieverAcc: "",
    recieverAccNo: "",
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

  const handleAdd = async () => {
    setLoading(true);
    try {
      await fetch("/api/addTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 pl-1 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={key}
                value={(formData as any)[key]}
                onChange={handleChange}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30 transition-colors"
                placeholder={key.replace(/([A-Z])/g, " $1").trim()}
              />
            </div>
          ))}
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
