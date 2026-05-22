import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TransactionParsedType } from "@/db/methods";
import { ACC_OWNER } from "@/lib/utils";
import AddTransactionPopup from "./AddTransactionPopup";

export default function TransactionPalette({
  data,
}: {
  data: TransactionParsedType;
}) {
  const _id = data._id;
  const transaction = data.transaction;
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  if (transaction.message && transaction.message.length > 0) {
    if (expanded) {
      return (
        <div className="flex flex-col w-full bg-white/5 p-4 rounded-3xl gap-4">
          <div className="text-gray-300 text-sm p-4 bg-white/10 rounded-2xl whitespace-pre-wrap font-mono">
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
        onClick={() => setExpanded(true)}
        className="flex w-full bg-red-500/10 border border-red-500/20 md:p-5 p-4 rounded-3xl hover:bg-red-500/20 transition-colors cursor-pointer"
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="text-red-400 font-semibold text-sm md:text-base">
            This message couldn't be parsed. Click to add manually.
          </div>
          <div className="text-gray-400 text-xs md:text-sm line-clamp-2">
             {transaction.message}
          </div>
        </div>
      </div>
    );
  }

  const accCredited = ACC_OWNER.toLowerCase().includes(
    transaction.recieverAcc.trim().toLowerCase(),
  );

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
      className="flex w-full bg-white/5 md:p-5 p-4 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer"
    >
      <div className="flex flex-col w-full /items-center gap-5">
        <div className="flex gap-3 justify-between w-full flex-row items-center">
          <div className="flex flex-col w-full/ gap-3">
            <div className="text-gray-400/90 uppercase md:text-base text-xs">
              {(accCredited ? "From " : "To ") +
                otherAccount.holder +
                "  **" +
                otherAccount.number.split("*").slice(-1)[0]}
            </div>

            <div className="font-bold flex gap-2 text-2xl">
              {accCredited ? (
                <div className="text-green-500">+ </div>
              ) : (
                <div className="text-red-500">- </div>
              )}
              {transaction.amount}
            </div>
          </div>

	  {transaction.url ? <Link
            onClick={(e) => e.stopPropagation()}
            href={transaction.url || ""}
            target="_blank"
            className={`${!transaction.url ? "hidden" : ""} px-4 py-2 bg-white/5 hover:bg-white/10 text-white md:text-base text-xs text-nowrap rounded-full transition-colors`}
          >
            View Receipt
          </Link> : null}
        </div>

        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="md:text-lg text-xs text-gray-400">
              {"Reason: " + transaction.reason}
            </div>
            <div className="md:text-lg text-xs text-gray-400">
              {"Category: " +
                (transaction.category.length ? transaction.category : "None")}
            </div>
          </div>
          <div className="text-gray-400 text-xs md:text-sm">
            {transaction.date}
          </div>
        </div>
      </div>
    </div>
  );
}
