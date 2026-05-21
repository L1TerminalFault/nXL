"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {useEffect} from "react";
import {redirect} from "next/navigation";

import TitleBar from "@/components/TitleBar";
import NavBar from "@/components/NavBar";
import { useTransactionStore } from "@/lib/store";

export default function MainLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
	const {locked, setLocked} = useTransactionStore();
	useEffect(() => {
		if (locked) redirect("/");
	}, [locked]);

  return (
    <ClerkProvider
      afterSignOutUrl="/home"
      appearance={{
        theme: dark,
      }}
    >
      <TitleBar />
      <div className="min-h-screen -z-90 flex w-full bg-gray-900/10">
        <div className="py-18 h-full pb-24 flex-1 flex w-full">{children}</div>
      </div>
      <NavBar />
    </ClerkProvider>
  );
}
