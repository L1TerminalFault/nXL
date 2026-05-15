import Link from "next/link";
import { useRouter } from "next/navigation";

import { TransactionParsedType } from "@/db/methods";
import { ACC_OWNER } from "@/lib/utils";

export default function TransactionPalette({
  data,
}: {
  data: TransactionParsedType;
}) {
  const _id = data._id;
  const transaction = data.transaction;
  const router = useRouter();

  const accCredited =
    transaction.recieverAcc === ACC_OWNER ||
    transaction.recieverAcc.includes(ACC_OWNER);

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

          <Link
            onClick={(e) => e.stopPropagation()}
            href={transaction.url || ""}
            target="_blank"
            className={`${!transaction.url ? "hidden" : ""} px-4 py-2 bg-white/5 hover:bg-white/10 text-white md:text-base text-xs text-nowrap rounded-full transition-colors`}
          >
            View Receipt
          </Link>
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
            {/* {transaction.dateTimes[0]} */}
            {new Date(transaction.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
