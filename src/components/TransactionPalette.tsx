import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import { TransactionParsedType } from "@/db/methods";
import { ACC_OWNER, isAdmin } from "@/lib/utils";
import AddTransactionPopup from "./AddTransactionPopup";

export default function TransactionPalette({
  data,
}: {
  data: TransactionParsedType;
}) {
  const { user } = useUser();
  const _id = data._id;
  const transaction = data.transaction;
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  if (
    ("parsed" in transaction && !transaction.parsed) ||
    (!("parsed" in transaction) &&
      transaction.message &&
      transaction.message.length > 0)
  ) {
    if (expanded) {
      return (
        <div className="flex backdrop-blur-2xl flex-col w-full bg-theme-card p-4 rounded-3xl gap-4">
          <div className="text-theme-text/80 wrap-break-word text-sm p-4 bg-theme-card/80 rounded-2xl whitespace-pre-wrap font-mono">
            {transaction.message}
          </div>
          <AddTransactionPopup
            inline
            id={_id || ""}
            onClose={() => setExpanded(false)}
            onSuccess={() => {
              fetch(`/api/deleteTransaction?id=${_id}`).then(() => {
                setExpanded(false);
                window.location.reload();
              });
            }}
          />
        </div>
      );
    }

    return (
      <div
        onClick={() => (isAdmin(user?.id) ? setExpanded(true) : null)}
        className="flex w-full bg-red-500/10 backdrop-blur-2xl border border-red-500/20 md:p-5 p-4 rounded-3xl hover:bg-red-500/20 transition-colors cursor-pointer"
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="text-red-400 font-semibold text-sm md:text-base">
            This message couldn&apos;t be parsed. Click to add manually.
          </div>
          <div className="text-theme-text/70 text-xs md:text-sm line-clamp-2">
            {transaction.message}
          </div>
        </div>
      </div>
    );
  }

  const resolveDirection = (tx: any): "TO" | "FROM" => {
    return (
      tx.direction ??
      (ACC_OWNER.toLowerCase().includes(tx.recieverAcc.trim().toLowerCase())
        ? "FROM"
        : "TO")
    );
  };

  const accCredited =
    resolveDirection(transaction) === "FROM";

  // const accCredited = ACC_OWNER.toLowerCase().includes(
  //   transaction.recieverAcc.trim().toLowerCase(),
  // );

  const otherAccount = accCredited
    ? {
        holder: transaction.payerAcc,
        number: transaction.payerAccNo,
      }
    : {
        holder: transaction.recieverAcc,
        number: transaction.recieverAccNo,
      };

  return (
    <div
      onClick={() => {
        router.push("/transactions/" + _id);
      }}
      className="flex w-full bg-theme-card backdrop-blur-2xl py-5 px-6 rounded-3xl hover:bg-theme-card/80 transition-colors cursor-pointer"
    >
      <div className="flex flex-col w-full /items-center gap-4">
        <div className="flex gap-3 justify-between w-full flex-row items-center">
          <div className="flex flex-col w-full/ gap-2.5">
            <div className="text-theme-text/70 uppercase md:text-base text-xs">
              {(accCredited ? "From " : "To ") +
                  otherAccount.holder +
                  "  **" +
                  otherAccount.number.split("*").slice(-1)[0]}
            </div>

            <div className={`${accCredited ? "text-blue-400" : "text-red-400"} px-4 py-2 rounded-full bg-theme-card font-bold flex gap-2 text-2xl`}>
              {"ETB " + (Number(transaction.amount)).toLocaleString()}
            </div>
          </div>

          {transaction.url ? (
            <Link
              onClick={(e) => e.stopPropagation()}
              href={transaction.url || ""}
              target="_blank"
              className={`${!transaction.url ? "hidden" : ""} px-4 py-2 bg-theme-accent/40 hover:bg-theme-card/80 text-white md:text-base text-xs text-nowrap rounded-full transition-colors`}
            >
              View Receipt
            </Link>
          ) : null}
        </div>

        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="md:text-lg text-[10px] text-theme-text/60">
              {"" + transaction.reason}
            </div>
            <div className="md:text-lg text-[10px] text-theme-text/60">
              {"" +
                (transaction.category.length
                  ? transaction.category
                  : "")}
            </div>
          </div>
          <div className="text-theme-text/60 text-[10px] md:text-sm">
            {new Date(transaction.date).toDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
