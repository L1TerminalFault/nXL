"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

import { useTransactionStore } from "@/lib/store";
import Link from "next/link";
import { ACC_OWNER, categories, isAdmin } from "@/lib/utils";

export default function TransactionPage() {
  const router = useRouter();
  const { data, dataIn, setData, allUsers } = useTransactionStore();
  const { id } = useParams();
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  // const [error, setError] = useState("");
  //const [loading, setLoading] = useState(true);
  const [updateBtn, setUpdateBtn] = useState("Update");
  const [deleteBtn, setDeleteBtn] = useState("Delete");
  const { user } = useUser();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  //const [allUsers, setAllUsers] = useState< { username: string; id: string; image: string }[] >([]);

  const trans = dataIn.find((t) => t._id === id?.toString());

  //const fetchUsers = async () => {
  //  setLoading(true);
  //  try {
  //    const res = await (await fetch("/api/getAllUsers")).json();
  //    setAllUsers(res);
  //    //console.log("the response " + res);
  //  } catch (err) {
  //    console.log("Error fetching users: " + err);
  //  } finally {
  //    setLoading(false);
  //  }
  //};

  useEffect(() => {
    if (user) (() => setIsAdminUser(isAdmin(user.id) || false))();
  }, [user]);

  useEffect(() => {
    (() => {
      setReason(trans?.transaction.reason || "");
      setCategory(trans?.transaction.category || "");
      setAllowedUsers(trans?.users || []);
      //fetchUsers();
    })();
  }, [trans, user]);

  if (!id) return router.replace("/transactions");

  if (!trans) return router.replace("/transactions");

  const resolveDirection = (tx: any): "TO" | "FROM" => {
    return (
      tx.direction ??
      (ACC_OWNER.toLowerCase().includes(tx.recieverAcc.trim().toLowerCase())
        ? "FROM"
        : "TO")
    );
  };

  const accCredited =
    resolveDirection(trans.transaction) === "FROM";

  // const accCredited = ACC_OWNER.toLowerCase().includes(
  //   trans.transaction.recieverAcc.trim().toLowerCase(),
  // );

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
    setUpdateBtn("Updating...");
    const date = data?.find((d) => d._id === trans._id)?.transaction.date;
    try {
      await fetch("/api/updateTransaction", {
        method: "POST",
        body: JSON.stringify({
          transaction: {
            _id: trans._id,
            transaction: {
              ...trans.transaction,
              date,
              reason,
              category,
              url: url || trans.transaction.url,
            },
            users: allowedUsers,
          },
        }),
      });
    } catch (err) {
      console.log("Error updating transaction" + err);
    } finally {
      setUpdateBtn("Updated");
      const tId = setTimeout(() => {
        setUpdateBtn("Update");
        clearTimeout(tId);
      }, 2000);
      setData(null);
      router.push("/transactions?id=");
    }
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
      router.replace("/transactions?id=");
    }
  };

  return (
    <div className="md:p-10 p-5 md:pt-20 flex h-full w-full text-5xl">
      <div className="bg-white/5 w-full md:p-20 p-5 h-full flex rounded-4xl ">
        <div className="w-full h-full justify-between md:gap-40 gap-10 flex flex-col">
          <div className="w-full flex justify-between">
            <div className="flex flex-col gap-5">
              <div className="text-gray-500 text-sm md:text-xl uppercase">
                {(accCredited ? "From " : "To ") +
                  otherAccount.holder +
                  "  **" +
                  otherAccount.number.split("*").slice(-1)[0]}
              </div>
              <div className="font-bold flex gap-2 md:text-3xl text-2xl">
                {accCredited ? (
                  <div className="text-green-500">+ </div>
                ) : (
                  <div className="text-red-500">- </div>
                )}
                {trans.transaction.amount}
              </div>
              <div className="text-gray-400 md:text-xl text-sm">
                {trans.transaction.date}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {trans.transaction.url.length ? (
                <Link
                  href={trans.transaction.url || ""}
                  className="rounded-full p-3 px-5 md:text-xl text-nowrap text-sm bg-white/5 hover:bg-white/10 transition-colors"
                  target="_blank"
                >
                  View Receipt
                </Link>
              ) : isAdmin(user?.id) ? (
                <input
                  type="text"
                  placeholder="Paste Reciept Link"
                  value={url || ""}
                  onChange={(e) => setUrl(e.target.value)}
                  className="outline-none text-xs rounded-full p-3 px-5 border-gray-700/60 focus:border-gray-700 hover:border-gray-700 border"
                />
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-7">
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 uppercase/ text-sm">
                {isAdminUser ? "Enter reason" : "Reason"}
              </div>
              <input
                type="text"
                placeholder="Change reason"
                onChange={(e) => setReason(e.target.value)}
                value={reason}
                disabled={!isAdminUser}
                className="text-base outline-none bg-transparent border-b border-gray-500/50 focus:border-gray-500/80 transition-colors w-full py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-gray-500 uppercase/ text-sm">
                {isAdminUser ? "Choose a category" : "Category"}
              </div>
              <div className="flex flex-wrap md:gap-3 gap-2">
                {categories.map((each) => (
                  <div
                    onClick={() => setCategory(each)}
                    key={each}
                    className={`px-4 py-2 rounded-full border border-white/8 md:text-lg text-xs flex items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-colors ${each === category ? "bg-white/10" : ""}`}
                  >
                    {each}
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`flex flex-col gap-2 ${isAdminUser ? "" : "hidden"}`}
            >
              <div className="text-gray-500 uppercase/ text-sm">
                Allow Users{" "}
                <i className="text-xs text-gray-600">
                  Highlighted users are allowed
                </i>
              </div>
              <div className="flex flex-col gap-3 items-start">
                {allUsers.length
                  ? allUsers
                      // {/* .filter((u) => u.id !== user?.id) */}
                      .map((each) => (
                        <div
                          onClick={() =>
                            setAllowedUsers((prev) =>
                              prev.includes(each.id)
                                ? prev.filter((id) => id !== each.id)
                                : [...prev, each.id],
                            )
                          }
                          key={each.id}
                          className={`px-4 py-2 rounded-full border border-white/8 md:text-lg text-xs flex items-center justify-start gap-3 w-max text-center cursor-pointer hover:bg-white/10 transition-colors ${allowedUsers.includes(each.id) ? "bg-white/10" : ""}`}
                        >
                          <Image
                            alt=""
                            src={each.image}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <div className="flex flex-col items-start gap-0.75">
                            <div>{each.username}</div>
                            <div className="text-[10px] opacity-50">
                              {each.email}
                            </div>
                          </div>
                          {allowedUsers.includes(each.id) ? (
                            <i className="text-gray-400 text-[8px]">Allowed</i>
                          ) : (
                            <i className="text-gray-500 text-[8px]">
                              Not allowed
                            </i>
                          )}
                        </div>
                      ))
                  : null}
              </div>
            </div>

            <div
              className={`flex gap-3 justify-end ${isAdminUser ? "" : "hidden"}`}
            >
              <div
                className="flex-col rounded-full md:text-2xl text-lg px-6 py-3 bg-white/30 hover:bg-white/20 transition-colors"
                onClick={update}
              >
                {updateBtn}
              </div>
              <div
                className="flex-col rounded-full md:text-2xl text-lg px-6 py-3 bg-red-500/60 hover:bg-red-500/90 transition-colors"
                onClick={delete_}
              >
                {deleteBtn}
              </div>
            </div>
          </div>

	  
      {trans.transaction.message?.length ? <div className="bg-white/5 gap-3 text-xs w-full md:p-20 p-5 flex flex-col rounded-4xl ">

              <div className="text-gray-500 text-sm md:text-xl">
	      Original Message
	      </div>
	      <div className="wrap-break-word">
	      {trans.transaction.message}
	      </div>

      </div> : null}

        </div>
      </div>
    </div>
  );
}
