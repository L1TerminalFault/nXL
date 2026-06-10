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
      if (document.hidden || !document.hasFocus()) {
        setLocked(true);
      }
    };

    window.addEventListener("focus", handleLock);
    window.addEventListener("blur", handleLock);
    document.addEventListener("visibilitychange", handleLock);

    return () => {
      window.removeEventListener("focus", handleLock);
      window.removeEventListener("blur", handleLock);
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
