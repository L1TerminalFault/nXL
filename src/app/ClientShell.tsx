"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/lib/store";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { locked, setLocked } = useTransactionStore();

  // 🔐 LOCK DETECTION (global, route-independent)
  useEffect(() => {
    const handleLock = () => {
      if (document.hidden && !useTransactionStore.getState().locked) {
        setLocked(true);
      }
    };

    document.addEventListener("visibilitychange", handleLock);

    return () => {
      document.removeEventListener("visibilitychange", handleLock);
    };
  }, [setLocked]);

  // 🚪 ROUTE REDIRECTION BASED ON LOCK STATE
  useEffect(() => {
    if (locked) {
      router.replace("/");
    } else {
      router.replace("/home");
    }
  }, [locked, router]);

  return <>{children}</>;
}
