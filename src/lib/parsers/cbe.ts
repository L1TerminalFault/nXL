import { PDFParse } from "pdf-parse";
import { ParsedTransaction } from "./types";

function empty(sms: string): ParsedTransaction {
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

function normalize(text: string) {
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function receiptUrl(text: string) {
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];

  return (
    urls.find(
      (u) =>
        u.includes("reciept.cbe.com.et") || u.includes("apps.cbe.com.et"),
    ) || ""
  );
}

async function parsePdfReceipt(url: string) {
  try {
    const res = await fetch(url);

    const type = res.headers.get("content-type") || "";

    if (!type.includes("pdf")) {
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    const pdf = new PDFParse(buffer);

    return (await pdf.getText()).text;
  } catch {
    return null;
  }
}

// async function fetchCBETransactionData(
//   receiptUrl: string
// ) {
//   try {
//     if (!receiptUrl.includes("apps.cbe.com.et")) {
//       return null;
//     }
// 
//     const id = new URL(receiptUrl)
//       .searchParams
//       .get("id");
// 
//     if (!id) {
//       return null;
//     }
// 
//     const tid =
//       id.slice(0, 12) +
//       "-" +
//       id.slice(12);
// 
//     const data = await (
//       await fetch(
//         `https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${tid}`,
//         {
//           headers: {
//             "User-Agent":
//               "Mozilla/5.0",
//             "X-App-ID":
//               "d1292e42-7400-49de-a2d3-9731caa4c819",
//             "X-App-Version":
//               "0a01980b-9859-1369-8198-59f403820000",
//           },
//         }
//       )
//     ).json();
// 
//     if (
//       !data ||
//       data.status > 200
//     ) {
//       return null;
//     }
// 
//     return data;
//   } catch {
//     return null;
//   }
// }

export async function parseCBE(sms: string): Promise<ParsedTransaction> {
  const text = normalize(sms);

  const result = empty(sms);

  result.bank = "CBE";
  result.url = receiptUrl(text);

  // const apiData = null;
  //   result.url
  //     ? await fetchCBETransactionData(
  //         result.url
  //       )
  //     : null;
  
  //  console.log(apiData)

  // if (apiData) {
  // 
  //   result.payerAcc =
  //     apiData.debitAccountHolder || "";
  // 
  //   result.payerAccNo =
  //     apiData.debitAccountNo || "";
  // 
  //   result.recieverAcc =
  //     apiData.creditAccountHolder || "";
  // 
  //   result.recieverAccNo =
  //     apiData.creditAccountNo || "";
  // 
  //   result.reason =
  //     apiData.paymentDetails?.[0] || "";
  // 
  //   result.amount =
  //     apiData.debitCurrency &&
  //     apiData.debitAmount
  //       ? `${apiData.debitCurrency} ${apiData.debitAmount}`
  //       : apiData.debitCurrency &&
  //           apiData.amountDebited
  //         ? `${apiData.debitCurrency} ${apiData.amountDebited}`
  //         : "";
  // 
  //   result.date =
  //     apiData.dateTimes?.[0] ||
  //     new Date().toISOString();
  // 
  //   // result.type = "CBE_API";
  // 
  //   result.parsed =
  //     !!result.amount;
  // 
  //   // result.confidence = 0.98;
  // 
  //   if (result.parsed) return result;
  // }

  const balance =
    text.match(/Current Balance is\s*ETB\s*([\d,.]+)/i)?.[1] ||
    text.match(/current balance is\s*ETB\s*([\d,.]+)/i)?.[1];

  result.remaining = balance || "";

  if (/successfully transferred/i.test(text)) {
    result.amount =
      text.match(/successfully transferred\s+(ETB\s*[\d,.]+)/i)?.[1] || "";

    result.payerAcc =
      text.match(/Dear\s+(.*?)\s+You have successfully transferred/i)?.[1] ||
      "";

    result.payerAccNo = text.match(/from account\s+([*\d]+)/i)?.[1] || "";

    result.recieverAccNo = text.match(/to account\s+([*\d]+)/i)?.[1] || "";

    result.recieverAcc = text.match(/\((.*?)\)/)?.[1] || "";

    // result.type = "TRANSFER_V2";
  } else if (/transfered\s+ETB/i.test(text)) {
    result.amount = text.match(/transfered\s+(ETB\s*[\d,.]+)/i)?.[1] || "";

    result.recieverAcc = text.match(/to\s+(.*?)\s+on/i)?.[1] || "";

    result.payerAccNo = text.match(/from your account\s+([*\d]+)/i)?.[1] || "";

    // result.type = "TRANSFER_V1";
  } else if (/has been debited with ETB/i.test(text)) {
    result.amount = text.match(/debited with\s+(ETB\s*[\d,.]+)/i)?.[1] || "";

    result.payerAcc = text.match(/Dear\s+(.*?)\s+your Account/i)?.[1] || "";

    result.payerAccNo = text.match(/Account\s+([*\d]+)/i)?.[1] || "";

    result.recieverAcc = "CASH";

    // result.type = "DEBIT";
  }

  if (!result.amount && result.url) {
    const pdfText = await parsePdfReceipt(result.url);

    if (pdfText) {
      result.amount =
        pdfText.match(/Amount\s*:?\s*(ETB\s*[\d,.]+)/i)?.[1] || "";

      result.payerAcc =
        pdfText.match(/Debit Account Holder\s*:?\s*(.*)/i)?.[1] || "";

      result.recieverAcc =
        pdfText.match(/Credit Account Holder\s*:?\s*(.*)/i)?.[1] || "";

      // result.type = "PDF_RECEIPT";
    }
  }

  result.parsed = !!result.bank && !!result.amount;

  // result.confidence = result.parsed ? 0.75 : 0;

  if (!result.parsed) {
    return empty(sms);
  }

  result.message = sms;

  return result;
}
