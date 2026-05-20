"use client";

import { useState } from "react";

import { useTransactionStore, FilterOthersType } from "@/lib/store";
import { ACC_OWNER } from "@/lib/utils";

interface FilterPopupProps {
  onClose: () => void;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKS = ["1st", "2nd", "3rd", "4th"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function FilterPopup({ onClose }: FilterPopupProps) {
  const {
    data,
    setDataIn,
    filterState,
    setFilterState,
    filterOthers,
    setFilterOthers,
  } = useTransactionStore();
  const [localState, setLocalState] = useState<string[]>(
    filterState.length ? filterState : ["All"],
  );

  const [localOtherFilters, setLocalOtherFilters] =
    useState<FilterOthersType>(filterOthers);

  const handleSelect = (level: number, value: string) => {
    const newState = [...localState].slice(0, level); // Drop everything after this level
    newState[level] = value;
    setLocalState(newState);
  };

  const isSelected = (level: number, value: string) =>
    localState[level] === value;

  const btnClass = (selected: boolean) =>
    `px-5 py-2 flex-grow sm:flex-grow-0 rounded-full text-sm transition-colors ${
      selected
        ? "bg-white text-black"
        : "bg-white/5 text-gray-300 hover:bg-white/10"
    }`;

  const applyFilter = () => {
    if (!data) return;

    let filtered = [...data];

    // Logics regarding By Bank and By Transaction are left as empty placeholders according to user.
    // They are meant to be added later by the user so we do not attempt filtering based on them.
    if (localOtherFilters.bank !== "All") {
      filtered = filtered.filter(
        (d) => d.transaction.bank === localOtherFilters.bank,
      );
    }

    if (localOtherFilters.trans !== "All") {
      if (localOtherFilters.trans === "Expense") {
        filtered = filtered.filter((d) =>
          d.transaction.payerAcc
            .toLowerCase()
            .includes(ACC_OWNER.toLowerCase()),
        );
      } else
        filtered = filtered.filter((d) =>
          d.transaction.recieverAcc
            .toLowerCase()
            .includes(ACC_OWNER.toLowerCase()),
        );
    }

    const t0 = localState[0];
    if (t0 === "Monthly") {
      const t1 = localState[1];
      if (t1 === "Relative") {
        const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter(
          (row) => new Date(row.transaction.date).getTime() >= oneMonthAgo,
        );
      } else if (t1 && MONTHS.includes(t1)) {
        const mIndex = MONTHS.indexOf(t1);
        filtered = filtered.filter(
          (row) => new Date(row.transaction.date).getMonth() === mIndex,
        );

        const t2 = localState[2];
        if (t2 === "Weekly") {
          const t3 = localState[3];
          if (t3 === "Relative") {
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            filtered = filtered.filter(
              (row) => new Date(row.transaction.date).getTime() >= oneWeekAgo,
            );
          } else if (t3 && WEEKS.includes(t3)) {
            const wIndex = WEEKS.indexOf(t3);
            const startDay = wIndex * 7 + 1;
            const endDay = startDay + 6;

            filtered = filtered.filter((row) => {
              const day = new Date(row.transaction.date).getDate();
              return day >= startDay && day <= endDay;
            });

            const t4 = localState[4];
            if (t4 && DAYS.includes(t4)) {
              // 0=Sun, 1=Mon, ... 6=Sat
              const targetDay = t4 === "Sun" ? 0 : DAYS.indexOf(t4) + 1;
              filtered = filtered.filter(
                (row) => new Date(row.transaction.date).getDay() === targetDay,
              );
            }
          }
        }
      }
    }

    setFilterState(localState);
    setFilterOthers(localOtherFilters);
    setDataIn(filtered);
    onClose();
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
          <h2 className="text-lg text-gray-500 pl-3">Filter</h2>
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

        <div className="flex flex-col gap-3">
          <div className="text-gray-500 pl-1 tracking-wider text-xs">
            By Bank
          </div>
          <div className="flex flex-wrap gap-3">
            {/* The user will implement logic for these, we just place the buttons */}
            <button
              onClick={() =>
                setLocalOtherFilters((prev) => ({ ...prev, bank: "All" }))
              }
              className={btnClass(localOtherFilters.bank === "All")}
            >
              All
            </button>
            <button
              onClick={() =>
                setLocalOtherFilters((prev) => ({ ...prev, bank: "CBE" }))
              }
              className={btnClass(localOtherFilters.bank === "CBE")}
            >
              CBE
            </button>
            <button
              onClick={() =>
                setLocalOtherFilters((prev) => ({ ...prev, bank: "TeleBirr" }))
              }
              className={btnClass(localOtherFilters.bank === "TeleBirr")}
            >
              TeleBirr
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-gray-500 pl-1 tracking-wider text-xs">
            By Transaction
          </div>
          <div className="flex flex-wrap gap-3">
            {/* The user will implement logic for these, we just place the buttons */}
            <button
              onClick={() =>
                setLocalOtherFilters((prev) => ({ ...prev, trans: "All" }))
              }
              className={btnClass(localOtherFilters.trans === "All")}
            >
              All
            </button>
            <button
              onClick={() =>
                setLocalOtherFilters((prev) => ({ ...prev, trans: "Expense" }))
              }
              className={btnClass(localOtherFilters.trans === "Expense")}
            >
              Expense
            </button>
            <button
              onClick={() =>
                setLocalOtherFilters((prev) => ({ ...prev, trans: "Income" }))
              }
              className={btnClass(localOtherFilters.trans === "Income")}
            >
              Income
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-gray-500 pl-1 tracking-wider text-xs">
            By Time
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              {["All", "Monthly"].map((v) => (
                <button
                  key={v}
                  onClick={() => handleSelect(0, v)}
                  className={btnClass(isSelected(0, v))}
                >
                  {v}
                </button>
              ))}
            </div>

            {localState[0] === "Monthly" && (
              <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                {["Relative", ...MONTHS].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleSelect(1, v)}
                    className={btnClass(isSelected(1, v))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {localState[0] === "Monthly" &&
              MONTHS.includes(localState[1] || "") && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {["All", "Weekly"].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleSelect(2, v)}
                      className={btnClass(isSelected(2, v))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}

            {localState[0] === "Monthly" &&
              MONTHS.includes(localState[1] || "") &&
              localState[2] === "Weekly" && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {["Relative", ...WEEKS].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleSelect(3, v)}
                      className={btnClass(isSelected(3, v))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}

            {/* Level 4: DAYS */}
            {localState[0] === "Monthly" &&
              MONTHS.includes(localState[1] || "") &&
              localState[2] === "Weekly" &&
              WEEKS.includes(localState[3] || "") && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {["All", ...DAYS].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleSelect(4, v)}
                      className={btnClass(isSelected(4, v))}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="mt-4 flex w-full gap-4 justify-end">
          <button
            onClick={applyFilter}
            className="flex py-3 px-7 bg-white/10 text-white hover:bg-white/15 rounded-full transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
