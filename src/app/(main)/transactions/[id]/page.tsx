"use client";

import { useState, useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

import { useTransactionStore } from "@/lib/store";
import Link from "next/link";
import { ACC_OWNER, categories, isAdmin } from "@/lib/utils";

export default function TransactionPage() {
  const { data, setData } = useTransactionStore();
  const { id } = useParams();
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateBtn, setUpdateBtn] = useState("Update");
  const { user } = useUser();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [allUsers, setAllUsers] = useState<
    { username: string; id: string; image: string }[]
  >([]);

  const trans = data.find((t) => t._id === id?.toString());

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await (await fetch("/api/getAllUsers")).json();
      setAllUsers(res);
      console.log("the response " + res);
    } catch (err) {
      console.log("Error fetching users: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) (() => setIsAdminUser(isAdmin(user.id) || false))();
  }, [user]);

  useEffect(() => {
    (() => {
      setReason(trans?.transaction.reason || "");
      setCategory(trans?.transaction.category || "");
      setAllowedUsers(trans?.users || []);
      fetchUsers();
    })();
  }, [trans, user]);

  if (!id) return redirect("/transactions");

  if (!trans) return redirect("/transactions");

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
    setUpdateBtn("Updating...");
    try {
      await fetch("/api/updateTransaction", {
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

      setData([]);
    } catch (err) {
      console.log("Error updating transaction" + err);
    } finally {
      setUpdateBtn("Updated");
      const tId = setTimeout(() => {
        setUpdateBtn("Update");
        clearTimeout(tId);
      }, 2000);
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
                className="rounded-full p-3 px-5 md:text-xl text-nowrap text-sm bg-white/5 hover:bg-white/10 transition-colors"
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
                disabled={!isAdminUser}
                className="text-base outline-none bg-transparent border-b border-gray-500/50 focus:border-gray-500/80 transition-colors w-full py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-gray-500 uppercase/ text-sm">
                Choose a category
              </div>
              <div className="flex md:gap-3 gap-2">
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

            {loading ? null : (
              <>
                <div
                  className={`flex flex-col gap-2 ${isAdminUser ? "" : "hidden"}`}
                >
                  <div className="text-gray-500 uppercase/ text-sm">
                    Allow Users{" "}
                    <i className="text-xs text-gray-600">
                      Highlighted users are allowed
                    </i>
                  </div>
                  <div className="flex flex-col gap-3 itecems-start">
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
                              <div className="">{each.username}</div>
                              {allowedUsers.includes(each.id) ? (
                                <i className="text-gray-400 text-[8px]">
                                  Allowed
                                </i>
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
