"use client";

import { SignInButton, UserButton, Show } from "@clerk/nextjs";
import { IoMdSettings as Setting } from "react-icons/io";
import Link from "next/link";

import { VERSION_STRING } from "@/lib/utils";

export default function TitleBar() {
  return (
    <div className="z-90">
      <div className="w-full z-20 shadow-lg shadow-black/30 flex items-center justify-between fixed top-0 p-2 px-5 text-xl //border-b-gray-700/30 //border //border-transparent backdrop-blur-lg transition-all bg-transparent">
        <div className="flex items-center h-12 w-full justify-between">
          <div>
            ZMW{" "}
            <span className="text-xs text-theme-text/50">
              by nXL v{VERSION_STRING}
            </span>
          </div>

          <div className="flex text-nowrap items-center w-max gap-3">
          <Link
            href="/settings"
            className={`p-3 rounded-full //bg-theme-accent hover:bg-theme-card size-full transition-colors cursor-pointer`}
          >
            <Setting className="size-5" />
          </Link>

            <Show when="signed-in">
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonOuterIdentifier: {
                      color: "gray",
                    },
                  },
                }}
              />
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <div className="flex text-base text-nowrap rounded-full p-1 m-2 px-4 bg-theme-accent hover:bg-theme-card/80 transition-colors">
                  <div>Sign In</div>
                </div>
              </SignInButton>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
