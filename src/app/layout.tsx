"use client"

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "nXl",
    template: "%s | nXl",
  },
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locked, setLocked } = useTransactionStore();

  useEffect(() => {
    if (!locked) redirect("/home");
    else redirect("/");

    window.addEventListener("focus", () => {
      if (document.hidden || !document.hasFocus()) {
        setLocked(true);
      }
    });
    window.addEventListener("blur", () => {
      if (document.hidden || !document.hasFocus()) {
        setLocked(true);
      }
    });
    window.addEventListener("visibilitychange", () => {
      if (document.hidden || !document.hasFocus()) {
        setLocked(true);
      }
    });
  }, [locked]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
