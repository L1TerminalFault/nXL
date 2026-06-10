// import { ParsedTransaction } from "./types";
//
// export function parseTeleBirr(sms: string): ParsedTransaction {
//   const clean = sms.replace(/\s+/g, " ").trim();
//
//
//   const amount = clean.match(/ETB\s*([\d,.]+)/i)?.[0] || "";
//
//   const balance = clean.match(/balance is\s*ETB\s*([\d,.]+)/i)?.[1] || "";
//
//   const parsed = !!amount;
//
//   let reason = "";
//   const reasonMatch =
//     clean.match(/for\s+(.*?)\s+(?:made for|on|purchase made)/i) ||
//     clean.match(/paid ETB [\d,.]+\s+for\s+(.*?)\s+on/i);
//   reason = reasonMatch ? reasonMatch[1].trim() : "";
//
//   const balanceMatch = clean.match(
//     /current (?:E-Money Account\s*)?balance is\s*ETB\s*([\d,.]+)/i,
//   );
//
//   const remaining = balanceMatch ? balanceMatch[1].replace(/,/g, "") : "";
//
//   const userMatch = clean.match(/Dear\s+([A-Za-z]+)(?:,|\s|Y|$)/i);
//   const user = userMatch ? userMatch[1].trim() : "Unknown";
//
//   let payerAcc = "";
//   let recieverAcc = "";
//   let type = "paid";
//
//   if (/you have received/i.test(clean)) {
//     type = "received";
//   } else if (
//     /you have transferred/i.test(clean) ||
//     /you have paid/i.test(clean)
//   ) {
//     type = "paid";
//   }
//
//   if (type === "paid") {
//     payerAcc = user;
//     recieverAcc = "Unknown";
//   } else if (type === "received") {
//     recieverAcc = user;
//     payerAcc = "Unknown";
//   }
//
//
//   const match = clean.match(/https?:\/\/[^\s]+/);
//
//   const url = match?.[0] || "";
//
//   return {
//     payerAcc,
//     payerAccNo: "",
//     recieverAccNo: "",
//     recieverAcc,
//     reason,
//     amount,
//     date: new Date().toISOString(),
//     bank: parsed ? "TeleBirr" : "",
//     url,
//     category: "",
//     remaining: balance,
//
//     parsed,
//     message: sms,
//
//     // type: parsed ? "TELEBIRR_TRANSACTION" : "UNKNOWN",
//
//     // confidence: parsed ? 0.8 : 0,
//   };
// }

import { ParsedTransaction } from "./types";

function inferDirection(text: string): "TO" | "FROM" | "" {
  const lower = text.toLowerCase();

  if (lower.includes("received") || lower.includes("credit")) {
    return "FROM";
  }

  if (
    lower.includes("transfer") ||
    lower.includes("paid") ||
    lower.includes("debit")
  ) {
    return "TO";
  }

  return "";
}

function fallback(clean: string, sms: string): ParsedTransaction {
  const amounts = [...clean.matchAll(/ETB\s*([\d,.]+)/gi)].map((m) => m[1]);

  const direction = inferDirection(clean);

  return {
    payerAcc: "",
    payerAccNo: "",
    recieverAccNo: "",
    recieverAcc: "",
    reason: "",

    amount: amounts[0] || "",

    date: new Date().toISOString(),

    bank: amounts.length ? "TeleBirr" : "",

    url: clean.match(/https?:\/\/[^\s]+/)?.[0] || "",

    category: "",

    remaining: amounts[amounts.length - 1] || "",

    direction,

    parsed: amounts.length > 0,

    message: sms,
  };
}

export function parseTeleBirr(sms: string): ParsedTransaction {
  const clean = sms.replace(/\s+/g, " ").trim();

  const amount = clean.match(/ETB\s*([\d,.]+)/i)?.[0] || "";

  const balanceMatch = clean.match(
    /current (?:E-Money Account\s*)?balance is\s*ETB\s*([\d,.]+)/i,
  );

  const remaining = balanceMatch?.[1]?.replace(/,/g, "") || "";

  const parsed = !!amount;

  let reason = "";

  const reasonMatch =
    clean.match(/for\s+(.*?)\s+(?:made for|on|purchase made)/i) ||
    clean.match(/paid ETB [\d,.]+\s+for\s+(.*?)\s+on/i);

  reason = reasonMatch?.[1]?.trim() || "";

  const userMatch = clean.match(/Dear\s+([A-Za-z]+)(?:,|\s|Y|$)/i);

  const user = userMatch?.[1]?.trim() || "Unknown";

  const direction = inferDirection(clean);

  let payerAcc = "";
  let recieverAcc = "";

  if (direction === "TO") {
    payerAcc = user;
    recieverAcc = "Unknown";
  } else if (direction === "FROM") {
    recieverAcc = user;
    payerAcc = "Unknown";
  }

  const url = clean.match(/https?:\/\/[^\s]+/)?.[0] || "";

  const result: ParsedTransaction = {
    payerAcc,
    payerAccNo: "",
    recieverAccNo: "",
    recieverAcc,

    reason,

    amount,

    date: new Date().toISOString(),

    bank: parsed ? "TeleBirr" : "",

    url,

    category: "",

    remaining,

    direction,

    parsed,

    message: sms,
  };

  if (!result.parsed) {
    const fb = fallback(clean, sms);

    if (fb.parsed) {
      return fb;
    }
  }

  return result;
}
