import { ParsedTransaction } from "./types";

export function parseTeleBirr(sms: string): ParsedTransaction {
  const clean = sms.replace(/\s+/g, " ").trim();


  const amount = clean.match(/ETB\s*([\d,.]+)/i)?.[0] || "";

  const balance = clean.match(/balance is\s*ETB\s*([\d,.]+)/i)?.[1] || "";

  const parsed = !!amount;

  let reason = "";
  const reasonMatch =
    clean.match(/for\s+(.*?)\s+(?:made for|on|purchase made)/i) ||
    clean.match(/paid ETB [\d,.]+\s+for\s+(.*?)\s+on/i);
  reason = reasonMatch ? reasonMatch[1].trim() : "";
  
  const balanceMatch = clean.match(
    /current (?:E-Money Account\s*)?balance is\s*ETB\s*([\d,.]+)/i,
  );
  
  const remaining = balanceMatch ? balanceMatch[1].replace(/,/g, "") : "";

  const userMatch = clean.match(/Dear\s+([A-Za-z]+)(?:,|\s|Y|$)/i);
  const user = userMatch ? userMatch[1].trim() : "Unknown";

  let payerAcc = "";
  let recieverAcc = "";
  let type = "paid";
  
  if (/you have received/i.test(clean)) {
    type = "received";
  } else if (
    /you have transferred/i.test(clean) ||
    /you have paid/i.test(clean)
  ) {
    type = "paid";
  }
  
  if (type === "paid") {
    payerAcc = user;
    recieverAcc = "Unknown";
  } else if (type === "received") {
    recieverAcc = user;
    payerAcc = "Unknown";
  }


  const match = clean.match(/https?:\/\/[^\s]+/);
  
  const url = match?.[0] || "";

  return {
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
    remaining: balance,

    parsed,
    message: sms,

    // type: parsed ? "TELEBIRR_TRANSACTION" : "UNKNOWN",

    // confidence: parsed ? 0.8 : 0,
  };
}
