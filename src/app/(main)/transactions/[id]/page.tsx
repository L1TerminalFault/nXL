"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { useTransactionStore } from "@/lib/store";
import Link from "next/link";
import { ACC_OWNER, categories } from "@/lib/utils";

export default function TransactionPage() {
  const { data } = useTransactionStore();
  const { id } = useParams();
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");

  const trans = data.find((t) => t._id === id?.toString());

  useEffect(() => {
    (() => {
      setReason(trans?.transaction.reason || "");
      setCategory(trans?.transaction.category || "");
    })();
  }, [trans]);

  if (!id)
    return (
      <div className="p-10 pt-20 flex h-full w-full text-5xl">
        No transaction found
      </div>
    );

  if (!trans)
    return (
      <div className="p-10 pt-20 flex h-full w-full text-5xl">
        No transaction found
      </div>
    );

  const accCredited =
    trans.transaction.recieverAcc === ACC_OWNER ||
    trans.transaction.recieverAcc.includes(ACC_OWNER);

  const otherAccount = accCredited
    ? {
        holder: trans.transaction.payerAcc,
        number: trans.transaction.payerAccNo,
      }
    : {
        holder: trans.transaction.recieverAcc,
        number: trans.transaction.recieverAccNo,
      };

  const update = async () => {
    const res = await fetch("/api/updateTransaction", {
      method: "POST",
      body: JSON.stringify({
        transaction: {
          _id: trans._id,
          transaction: {
            ...trans.transaction,
            reason,
            category,
          },
          users: allowedUsers,
        },
      }),
    });
  };

  return (
    <div className="p-10 pt-20 flex h-full w-full text-5xl">
      <div className="bg-white/5 w-full p-20 h-full flex rounded-4xl ">
        <div className="w-full h-full justify-between gap-40 flex flex-col">
          <div className="w-full flex justify-between">
            <div className="flex flex-col gap-5">
              <div className="text-gray-500 text-xl uppercase">
                {(accCredited ? "From " : "To ") +
                  otherAccount.holder +
                  "  **" +
                  otherAccount.number.split("*").slice(-1)[0]}
              </div>
              <div className="font-bold flex gap-2 text-3xl">
                {accCredited ? (
                  <div className="text-green-500">+ </div>
                ) : (
                  <div className="text-red-500">- </div>
                )}
                {trans.transaction.amount}
              </div>
              <div className="text-gray-400 text-xl">
                {new Date(trans.transaction.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={trans.transaction.url || ""}
                className="rounded-full p-3 px-5 text-xl bg-white/5 hover:bg-white/10 transition-colors"
                target="_blank"
              >
                View Receipt
              </Link>
            </div>
          </div>

          <div className="flex w-full flex-col gap-7">
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 uppercase/ text-sm">
                Enter reason
              </div>
              <input
                type="text"
                placeholder="Change reason"
                onChange={(e) => setReason(e.target.value)}
                value={reason}
                className="text-base outline-none bg-transparent border-b border-gray-500/50 focus:border-gray-500/80 transition-colors w-full py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-gray-500 uppercase/ text-sm">
                Choose a category
              </div>
              <div className="flex gap-3">
                {categories.map((each) => (
                  <div
                    onClick={() => setCategory(each)}
                    key={each}
                    className={`px-4 py-2 rounded-full text-lg cursor-pointer hover:bg-white/10 transition-colors ${each === category ? "bg-white/10" : ""}`}
                  >
                    {each}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-gray-500 uppercase/ text-sm">
                Allowed Users
              </div>
              <div className="flex gap-3">
                {["chala", "dula"].map((each) => (
                  <div
                    onClick={() => setCategory(each)}
                    key={each}
                    className={`px-4 py-2 rounded-full text-lg cursor-pointer hover:bg-white/10 transition-colors ${each === category ? "bg-white/10" : ""}`}
                  >
                    {each}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <div
                className="flex-col rounded-full text-2xl px-6 py-3 bg-white/30 hover:bg-white/20 transition-colors"
                onClick={update}
              >
                Update
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
