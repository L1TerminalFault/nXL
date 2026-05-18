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

// TODO: Add jemal here
export const ADMINS = ["user_3Dm9SXSar1mSiY6gVd1FJUHJ88j", "jemal"];

export const isAdmin = (userid?: string) => {
  if (!userid) return false;
  return ADMINS.includes(userid);
};

type CategorySummary = {
  name: string;
  total: number;
  count: number;
  average: number;
};

export function buildReasonSummary(
  data: TransactionParsedType[],
): CategorySummary[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const item of data) {
    const tx = item.transaction;

    const category = tx.reason?.trim() || "Uncategorized";

    const amount = Number(tx.amount.replace(/[^0-9.-]+/g, ""));

    if (Number.isNaN(amount))
      console.warn(`Invalid amount for transaction: ${tx.amount}`);

    const existing = map.get(category) || {
      total: 0,
      count: 0,
    };

    map.set(category, {
      total: existing.total + amount,
      count: existing.count + 1,
    });
  }

  return Array.from(map.entries()).map(([name, v]) => ({
    name,
    total: v.total,
    count: v.count,
    average: v.total / v.count,
  }));
}

export function buildCategorySummary(
  data: TransactionParsedType[],
): CategorySummary[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const item of data) {
    const tx = item.transaction;

    const category = tx.category?.trim() || "Uncategorized";

    const amount = Number(tx.amount.replace(/[^0-9.-]+/g, ""));

    if (Number.isNaN(amount))
      console.warn(`Invalid amount for transaction: ${tx.amount}`);

    const existing = map.get(category) || {
      total: 0,
      count: 0,
    };

    map.set(category, {
      total: existing.total + amount,
      count: existing.count + 1,
    });
  }

  return Array.from(map.entries()).map(([name, v]) => ({
    name,
    total: v.total,
    count: v.count,
    average: v.total / v.count,
  }));
}

export const categories = ["Home", "Self", "Transport", "Others"];
