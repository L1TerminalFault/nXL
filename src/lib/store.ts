import { create } from "zustand";

import { TransactionParsedType } from "@/db/methods";

export const useTransactionStore = create(
  (
    set,
  ): {
    data: TransactionParsedType[];
    setData: (value: TransactionParsedType[]) => void;
  } => ({
    data: [] as TransactionParsedType[],
    setData: (value: TransactionParsedType[]) => set(() => ({ data: value })),
  }),
);
