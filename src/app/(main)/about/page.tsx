"use client";

import { BsListNested } from "react-icons/bs";
import { FaCogs } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";

import { useTransactionStore } from "@/lib/store";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  // const { locked } = useTransactionStore();

  // useEffect(() => {
  //   if (locked) redirect("/");
  // });

  return (
    <div className="p-4 flex flex-col w-full h-full gap-6">
      <div className="px-10 py-20 gap-9 text-lg bg-theme-card backdrop-blur-2xl rounded-4xl flex items-center">
        <BsListNested className="shrink-0" size={50} />
        NxL helps you summarize your company expenses by automatically listening
        for the data from the app. You can view your expenses in a clear and
        organized way, making it easier to manage your finances.
      </div>
      <div className="bg-theme-card backdrop-blur-2xl gap-7 p-10 flex items-center rounded-3xl">
        <FaCogs className="shrink-0" size={50} />
        Sign Up or Login to get started
      </div>
      <div className="bg-theme-card gap-7 p-10 flex backdrop-blur-2xl items-center rounded-3xl">
        <LuInfo className="shrink-0" size={50} />
        Contact us for any problems
      </div>
    </div>
  );
}
