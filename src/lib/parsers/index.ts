import { parseCBE } from "./cbe";
import { parseTeleBirr } from "./telebirr";
import { ParsedTransaction } from "./types";

export async function parseTransaction(
  sms: string,
): Promise<ParsedTransaction> {
  const text = sms.trim();

  if (/cbe/i.test(text)) {
    return parseCBE(text);
  }

  if (
    /telebirr/i.test(text) ||
    /ethiotelecom/i.test(text) ||
    /telecom/i.test(text)
  ) {
    return parseTeleBirr(text);
  }

  return {
    payerAcc: "",
    payerAccNo: "",
    recieverAccNo: "",
    recieverAcc: "",
    reason: "",
    amount: "",
    date: new Date().toISOString(),
    bank: "",
    url: "",
    category: "",
    remaining: "",
    parsed: false,
    message: sms,
    // type: "UNKNOWN",
    // confidence: 0,
  };
}
