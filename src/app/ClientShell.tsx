"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/lib/store";
import { useThemeStore } from "@/lib/theme";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { locked, setLocked } = useTransactionStore();
  const { currentTheme } = useThemeStore();

  // 🔐 LOCK DETECTION (global, route-independent)
  useEffect(() => {
    const handleLock = () => {
      if (document.hidden && !useTransactionStore.getState().locked) {
        const tid = setTimeout(() => {
		if (document.hidden && !useTransactionStore.getState().locked) setLocked(true);
		clearTimeout(tid);
	}, 30000);
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

  return (
    <>
      <style suppressHydrationWarning>{`
        :root {
          --bg: ${currentTheme.bg};
          --fg: ${currentTheme.fg};
          --cardBg: ${currentTheme.cardBg};
          --accent: ${currentTheme.accent};
          --borderCol: ${currentTheme.borderCol};
        }
        
        body {
           ${currentTheme.bgImage 
              ? `background-image: url('${currentTheme.bgImage}');
                 background-size: cover;
                 background-position: center;
                 background-repeat: no-repeat;
                 background-attachment: fixed;` 
              : `background-color: var(--bg);`
            }
           color: var(--fg);
        }
      `}</style>
      {children}
    </>
  );
}
