import type { Direction } from "@/db/methods";

export interface ParsedTransaction {
  payerAcc: string;
  payerAccNo: string;
  recieverAccNo: string;
  recieverAcc: string;
  reason: string;
  amount: string;
  date: string;
  bank: string;
  url: string;
  category: string;
  remaining: string;

  direction: Direction;
  parsed: boolean;
  message: string;

  // type: string;
  // confidence: number;
}
