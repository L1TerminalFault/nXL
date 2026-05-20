import { create } from "zustand";

import { toEthiopian } from "ethiopian-calendar-new";
import { TransactionParsedType } from "@/db/methods";

export type FilterOthersType = {
  trans: string;
  bank: string;
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
    locked: boolean;
    setLocked: (value: boolean) => void;
  } => ({
    data: null,
    setData: (value: TransactionParsedType[] | null) =>
      set(() => ({ data: value })),
    dataIn: [] as TransactionParsedType[],

    setDataIn: (value: TransactionParsedType[]) =>
      set(() => ({
        dataIn: value.map((val) => ({
          ...val,
          transaction: {
            ...val.transaction,
            date: `${
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

    filterOthers: { trans: "All", bank: "All" },
    setFilterOthers: (value: FilterOthersType) =>
      set(() => ({ filterOthers: value })),
    filterState: ["All"],
    setFilterState: (value: string[]) => set(() => ({ filterState: value })),
    locked: false,
    setLocked: () => set((prev) => ({ locked: !prev })),
  }),
);
