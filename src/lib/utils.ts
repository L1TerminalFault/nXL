import { extractText, getDocumentProxy } from "unpdf";
import { TransactionParsedType } from "@/db/methods";

export const VERSION_STRING = "1.0.0";
export const ACC_OWNER = "Mengesha Amere";

export async function extract(url: string) {
  const buffer = await fetch(url).then((res) => res.arrayBuffer());

  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const { text } = await extractText(pdf, {
    mergePages: true,
  });

  return text;
}

export function textBetween(text: string, startText: string, endText: string) {
  const start = text.indexOf(startText);

  if (start === -1) return null;

  const from = start + startText.length;

  const end = text.indexOf(endText, from);

  if (end === -1) {
    return text.slice(from).trim();
  }

  return text.slice(from, end).trim();
}

export function fromTextToEnd(text: string, startText: string) {
  const startIndex = text.indexOf(startText);

  if (startIndex === -1) return null;

  const from = startIndex + startText.length;

  return text.slice(from).trim();
}

const formatDate = (input: string) => {
  const date = new Date(input);

  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  }).format(date);

  return formatted;
  // console.log(formatted);
};

export async function fetchPDFData(url: string) {
  const text = await extract(url);

  const payerAcc = textBetween(text, "Payer", "Receiver");
  const payerAccNo = payerAcc ? fromTextToEnd(payerAcc, "Account") : "";
  const recieverAcc = textBetween(text, "Receiver", "Payment");
  const recieverAccNo = recieverAcc
    ? fromTextToEnd(recieverAcc, "Account")
    : "";
  const date = textBetween(text, "Payment Date & Time", "Reference");
  const reason = textBetween(
    text,
    "Reason / Type of service",
    "Transferred Amount",
  );
  const amount = textBetween(text, "Transferred Amount", "Commission");

  return {
    payerAcc,
    payerAccNo,
    recieverAcc,
    recieverAccNo,
    reason,
    amount,
    date: formatDate(date || ""),
  };
}

export function buildCategoryTotals(transactions: TransactionParsedType[]) {
  const map: Record<string, number> = {};

  for (const tx of transactions) {
    const category = tx.transaction.category || "Unknown";

    const amount = Number(tx.transaction.amount) || 0;

    map[category] = (map[category] || 0) + amount;
  }

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
  }));
}
