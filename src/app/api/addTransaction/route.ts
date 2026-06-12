import { addTransaction, TransactionType } from "@/db/methods";
import { dbConnect } from "@/db/model";
import { parseTransaction } from "@/lib/parsers";

export async function POST(req: Request) {
  await dbConnect();
  const raw = await req.text();

  let parsedObj: TransactionType | null | string = null;
  let transaction = "";
  let isJson = false;

  try {
    const cleanText = raw
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      .replace(/\\([^\/"\\bfnrtu])/g, "$1");

    parsedObj = JSON.parse(cleanText);
    isJson = true;
  } catch {
    isJson = false;
  }

  if (isJson) {
    // Manual transaction
    // Checking if parsedObj exists, is an object, and casting it to access dynamic fields safely
    if (parsedObj && typeof parsedObj === "object" && !("transaction" in parsedObj)) {
      const target = parsedObj as any; 

      if (typeof target.amount === "string") {
        target.amount = target.amount.replace(/[^0-9.-]+/g, "");
      }
      if (typeof target.remaining === "string") {
        target.remaining = target.remaining.replace(/[^0-9.-]+/g, "");
      }
      
      await addTransaction(JSON.stringify(target));
      console.log("Adding manual transaction: ", target);

      return Response.json({
        status: "success",
      });
    }

    transaction =
      typeof parsedObj === "object" && parsedObj !== null && "transaction" in parsedObj
        ? (parsedObj as any).transaction || ""
        : "";
  } else {
    transaction = raw;
  }

  const parsed = await parseTransaction(transaction);
  if (parsed && typeof parsed === "object") {
    const parsedTarget = parsed as any;
    if (typeof parsedTarget.amount === "string") {
      parsedTarget.amount = parsedTarget.amount.replace(/[^0-9.-]+/g, "").replace(/\D$/, "");
    }
    if (typeof parsedTarget.remaining === "string") {
      parsedTarget.remaining = parsedTarget.remaining.replace(/[^0-9.-]+/g, "").replace(/\D$/, "");
    }
  }
  
  console.log("Parsed result: ", parsed);
  await addTransaction(JSON.stringify(parsed));
  return Response.json({
    status: "success",
  });
}
