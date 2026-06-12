"use client";

import { redirect } from "next/navigation";

import { useTransactionStore } from "@/lib/store";
import { SubmitEventHandler, useEffect, useState } from "react";
import { VscEye as Eye, VscEyeClosed as EyeOff } from "react-icons/vsc";

export default function Home() {
  const { locked, setLocked } = useTransactionStore();
  const [input, setInput] = useState("");
  const [input_, setInput_] = useState("");
  const [error, setError] = useState("");
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("Setup Password");
  const [firstTime, setFirstTime] = useState<boolean | null>(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const passwd = localStorage.getItem("__n-xl_password__");

    if (!passwd || !passwd.length) {
      (() => setFirstTime(true))();
    } else {
      (() => {
        setPass(passwd);
        setFirstTime(false);
      })();
      document.getElementById("inputPass")?.focus();
    }
  }, []);

  const handleSumbmit = () => {
    if (input === pass) setLocked(false);
    else setError("Incorrect password");
  };

  const handleUpdate = () => {
    if (input === pass) {
      localStorage.removeItem("__n-xl_password__");
      setTitle("Change Password");
      setFirstTime(true);
    } else setError("Incorrect password");
  };

  const handleSetup = () => {
    if (input === input_) {
      localStorage.setItem("__n-xl_password__", input);
      setLocked(false);
    } else setError("Passwords don't match");
  };

  const submit = (f: React.FormEvent<HTMLFormElement>) => {
    f.preventDefault();
    if (input === pass) setLocked(false);
    else setError("Incorrect password");
  };

  const submitSetup1 = (f: React.FormEvent<HTMLFormElement>) => {
    f.preventDefault();
    document.getElementById("in")?.focus();
  };

  const submitSetup2 = (f: React.FormEvent<HTMLFormElement>) => {
    f.preventDefault();
    if (input === input_) {
      localStorage.setItem("__n-xl_password__", input);
      setLocked(false);
    } else setError("Passwords don't match");
  };

  return (
    <div className="w-svw h-svh flex items-center justify-center">
      <div className="border-2 max-w-full rounded-3xl p-5 gap-5 flex-col backdrop-blur-2xl border-gray-500/70 shadow-l shadow-black/60 flex items-center justify-center">
        {firstTime === false ? (
          <div className="flex w-full gap-5 flex-col">
            <div className="text-theme-text/70 w-full px-3.5 text-xs">Locked</div>
            <form
              onSubmit={submit}
              className="flex flex-col w-full gap-5 items-center"
            >
              <div className="flex gap-5 items-center justify-start">
                <input
                  id="inputPass"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter Password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="outline-none flex-1 rounded-3xl p-5 border /border-transparent overflow-hidden appearance-none focus-within:border-gray-500/70 border-gray-500/55"
                />

                <div
                  onClick={() => setShowPass((prev) => !prev)}
                  className={`p-3 rounded-full bg-theme-accent hover:bg-theme-card/80 size-full transition-colors cursor-pointer`}
                >
                  {showPass ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </div>
              </div>

              <div className="text-red-500 text-xs w-full px-3.5">{error}</div>

              <div className="flex w-full justify-end">
                <div
                  role="button"
                  onClick={handleSumbmit}
                  className="px-5 py-2 rounded-full bg-theme-accent hover:bg-theme-card/80 transition-colors"
                >
                  Unlock
                </div>
              </div>
            </form>

            <div className="flex w-full justify-end">
              <div
                role="button"
                onClick={handleUpdate}
                className="px-5 py-2 rounded-full bg-theme-accent hover:bg-theme-card/80 transition-colors"
              >
                Change
              </div>
            </div>
          </div>
        ) : firstTime === true ? (
          <>
            <div className="text-theme-text/50 w-full px-3.5 text-xs">{title}</div>
            <form
              onSubmit={submitSetup1}
              className="flex text-xl gap-5 items-center"
            >
              <input
                type="text"
                placeholder="New Password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="outline-none rounded-3xl p-5 border border-transparent  overflow-hidden appearance-none focus-within:border-gray-800/40"
              />
            </form>
            <form
              onSubmit={submitSetup2}
              className="flex text-xl gap-5 items-center"
            >
              <input
                id="in"
                type="text"
                placeholder="Confirm Password"
                value={input_}
                onChange={(e) => setInput_(e.target.value)}
                className="outline-none rounded-3xl p-5 border border-transparent  overflow-hidden appearance-none focus-within:border-gray-800/40"
              />
            </form>
            <div className="text-red-500 text-xs w-full px-3.5">{error}</div>
            <div className="flex w-full justify-end">
              <div
                role="button"
                onClick={handleSetup}
                className="px-5 py-2 rounded-full bg-theme-accent hover:bg-theme-card/80 transition-colors"
              >
                Done
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
