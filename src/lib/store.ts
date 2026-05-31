import { create } from "zustand";

import { toEthiopian } from "ethiopian-calendar-new";
import { TransactionParsedType } from "@/db/methods";

export type FilterOthersType = {
  trans: string;
  bank: string;
  category: string;
  users: string;
};

type User = {
    username: string;
    id: string;
    image: string;
};

export const useTransactionStore = create(
  (
    set,
  ): {
    data: TransactionParsedType[] | null;
    setData: (value: TransactionParsedType[] | null) => void;
    dataIn: TransactionParsedType[];
    setDataIn: (value: TransactionParsedType[]) => void;
    filterOthers: FilterOthersType;
    setFilterOthers: (value: FilterOthersType) => void;
    filterState: string[];
    setFilterState: (value: string[]) => void;
    total: number;
    setTotal: (value: number) => void;
    locked: boolean;
    setLocked: (value: boolean) => void;
    allUsers: User[];
    setAllUsers: (value: User[]) => void; 
  } => ({
    data: null,
    setData: (value: TransactionParsedType[] | null) =>
      set(() => ({ data: value })),
    dataIn: [] as TransactionParsedType[],

    setDataIn: (value: TransactionParsedType[]) =>
      set(() => ({
        dataIn: value
          .sort((a, b) => new Date(b.transaction.date).getTime() - new Date(a.transaction.date).getTime())
          .map((val) => ({
          ...val,
          transaction: {
            ...val.transaction,
            date: (!('parsed' in val.transaction) && (val.transaction.message?.length)) ? "" : !val.transaction?.date?.length ? "" : `${
              toEthiopian(
                Number(val.transaction.date.split("-")[0]),
                Number(val.transaction.date.split("-")[1]),
                Number(val.transaction.date.split("-")[2].split("T")[0]),
              ).year
            }-${
              toEthiopian(
                Number(val.transaction.date.split("-")[0]),
                Number(val.transaction.date.split("-")[1]),
                Number(val.transaction.date.split("-")[2].split("T")[0]),
              ).month
            }-${
              toEthiopian(
                Number(val.transaction.date.split("-")[0]),
                Number(val.transaction.date.split("-")[1]),
                Number(val.transaction.date.split("-")[2].split("T")[0]),
              ).day
            }`
              .split("-")
              .reverse()
              .join("-"),
          },
        })),
      })),

    filterOthers: { trans: "All", bank: "All", category: "All", users: "All" },
    setFilterOthers: (value: FilterOthersType) =>
      set(() => ({ filterOthers: value })),
    filterState: ["All"],
    setFilterState: (value: string[]) => set(() => ({ filterState: value })),
    total: 0,
    setTotal: (value: number) => set(() => ({ total: value })),
    locked: true,
    setLocked: () => set((prev) => ({ locked: !prev })),
    allUsers: [] as User[],
    setAllUsers: (value: User[]) =>
      set(() => ({ allUsers: value })),
  }),
);
