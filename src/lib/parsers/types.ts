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

  parsed: boolean;
  message: string;

  // type: string;
  // confidence: number;
}
