"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { useTransactionStore } from "@/lib/store";
import Link from "next/link";
import { ACC_OWNER } from "@/lib/utils";

export default function TransactionPage() {
  const { data } = useTransactionStore();
  const { id } = useParams();

  useEffect(() => {}, []);

  if (!id)
    return (
      <div className="p-10 pt-20 flex h-full w-full text-5xl">
        No transaction found
      </div>
    );

  const trans = data.find((t) =>
    t.transaction.url.includes(id.toString() || ""),
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

  const allowedUsers = trans.users;

  return (
    <div className="p-10 pt-20 flex h-full w-full text-5xl">
      <div className="bg-white/5 w-full p-20 h-full flex rounded-4xl ">
        <div className="w-full h-full flex flex-col">
          <div className="w-full flex justify-between">
            <div className="flex flex-col gap-5">
              <div className="text-gray-500 text-xl uppercase">
                {" "}
                {otherAccount.holder +
                  " **" +
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
              {/* <div className="text-gray-500 text-lg"> */}
              {/*   To:{" "} */}
              {/*   {creditAccountHolder + */}
              {/*     " **" + */}
              {/*     creditAccountNo.split("*").slice(-1)[0]} */}
              {/* </div> */}
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

          <div className=""></div>
        </div>
      </div>
    </div>
  );
}
