import { create } from "zustand";

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
  email: string;
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
    customFrom: string;
    setCustomFrom: (value: string) => void;
    customTo: string;
    setCustomTo: (value: string) => void;
    locked: boolean;
    total: number;
    setTotal: (value: number) => void;
    setLocked: (value: boolean) => void;
    allUsers: User[];
    setAllUsers: (value: User[]) => void;
    orders: any[];
    setOrders: (value: any[]) => void;
  } => ({
    data: null,
    orders: [],
    setOrders: (value: any[]) => set(() => ({ orders: value })),
    setData: (value: TransactionParsedType[] | null) =>
      set(() => ({ data: value })),
    dataIn: [] as TransactionParsedType[],

    setDataIn: (value: TransactionParsedType[]) =>
      set(() => ({
        dataIn: value
          .sort(
            (a, b) =>
              new Date(b.transaction.date).getTime() -
              new Date(a.transaction.date).getTime(),
          ).map(each => ({
		  ...each,
		  transaction: {
			  ...each.transaction,
			  date: each.transaction.date?.toLocaleString() || Date.now().toLocaleString(),
			  amount: each.transaction.amount.replace(/[^0-9.-]+/g, "").replace(/\D$/, ""),
			  remaining: each.transaction.remaining.replace(/[^0-9.-]+/g, "").replace(/\D$/, ""),
		  }
	  })),
      })),

    filterOthers: { trans: "All", bank: "All", category: "All", users: "All" },
    setFilterOthers: (value: FilterOthersType) =>
      set(() => ({ filterOthers: value })),
    filterState: ["All"],
    setFilterState: (value: string[]) => set(() => ({ filterState: value })),
    customFrom: "",
    customTo: "",
    setCustomFrom: (value: string) => set(() => ({ customFrom: value })),
    setCustomTo: (value: string) => set(() => ({ customTo: value })),
    locked: true,
    total: 0,
    setTotal: (value: number) => set(() => ({ total: value })),
    setLocked: (value: boolean) => set(() => ({ locked: value })),
    allUsers: [] as User[],
    setAllUsers: (value: User[]) => set(() => ({ allUsers: value })),
  }),
);
