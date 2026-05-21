import { addTransaction } from "@/db/methods";
import { dbConnect } from "@/db/model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const raw = await req.text();
    const cleanText = raw.replace(/[^\x20-\x7E]/g, " ");
    const { transaction } = JSON.parse(cleanText);

    const match = transaction.match(/https?:\/\/[^\s]+/);

    let url = match?.[0];
    let tid = "";
    let payerAcc = "";
    let payerAccNo = "";
    let recieverAccNo = "";
    let recieverAcc = "";
    let reason = "";
    let amount = "";
    let date = "";
    let bank = "";
    let remaining = "";
    const category = "";

    if (transaction.includes("CBE")) {
      bank = "CBE";

      const balanceMatch = transaction.match(
        /Current Balance is\s+(ETB\s*[\d,.]+)/i,
      )[1];
      remaining = balanceMatch;

      if (transaction.includes("https://shorturl.at")) {
        const debitMatch = transaction.match(
          /debited with\s+(ETB\s*[\d,.]+)/i,
        )[1];

        const payer = transaction.match(/dear\s+(.*?)\s+your/i)[1];

        url = "";
        amount = debitMatch;
        recieverAcc = "CASH";
        payerAcc = payer;
        date = new Date(Date.now()).toISOString();
      } else {
        if (url.includes("apps.cbe.com.et")) {
          const id = new URL(url).searchParams.get("id");
          if (!id || !id.length) {
            const id = url.split("/").pop()?.replace("&", "-");
            tid = id || "";
          } else tid = id.slice(0, 12) + "-" + id.slice(12);

          url = `https://mbreciept.cbe.com.et/${tid}`;
        } else {
          const id = url.split("/").pop();
          tid = id || "";
        }

        if (tid) {
          const data = await (
            await fetch(
              `https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${tid}`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0",
                  "X-App-ID": "d1292e42-7400-49de-a2d3-9731caa4c819",
                  "X-App-Version": "0a01980b-9859-1369-8198-59f403820000",
                },
              },
            )
          ).json();

          if (data?.status === 400)
            return Response.json(
              { status: "error", message: "Invalid transaction url" },
              { status: 400 },
            );
          else {
            payerAcc = data?.debitAccountHolder;
            payerAccNo = data?.debitAccountNo;
            recieverAcc = data?.creditAccountHolder;
            recieverAccNo = data?.creditAccountNo;
            reason = data?.paymentDetails?.[0] || "";
            amount = data?.debitCurrency + " " + data?.debitAmount;
            date = data?.dateTimes?.[0] || "";
          }
        }
      }
    } else if (
      transaction.includes("telebirr") &&
      transaction.includes("telecom")
    ) {
      bank = "TeleBirr";

      const clean = transaction.replace(/\s+/g, " ").trim();
      const user = (clean.match(/Dear\s+([A-Za-z]+)/i) || [])[1] || "";

      let type = null;

      if (/you have received/i.test(clean)) {
        type = "received";
      } else if (
        /you have transferred/i.test(clean) ||
        /you have paid/i.test(clean)
      ) {
        type = "paid";
      } else {
        type = "unknown";
      }

      if (type === "paid") {
        payerAcc = user;
        recieverAcc = "";
      } else if (type === "received") {
        recieverAcc = user;
        payerAcc = "";
      }

      amount =
        (clean.match(/ETB\s*([\d,.]+)/i) || [])[1].replace(/,/g, "") || "";

      const dateMatch =
        clean.match(/on\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) ||
        clean.match(/on\s+(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/);

      if (dateMatch) {
        const raw = dateMatch[1];

        if (raw.includes("/")) {
          const [d, m, yAndTime] = raw.split("/");
          const [year, time] = yAndTime.split(" ");
          date = new Date(`${year}-${m}-${d}T${time}`).toISOString();
        } else {
          date = new Date(raw.replace(" ", "T")).toISOString();
        }
      }

      reason =
        (clean.match(/for (.*?) (made for|on)/i) ||
          clean.match(/paid ETB [\d,.]+ for (.*?) on/i))?.[1].trim() || "";

      const balance = (clean.match(
        /current (?:E-Money Account\s*)?balance is ETB\s*([\d,.]+)/i,
      ) || [])[1];

      remaining = balance.replace(/,/g, "") || "";

      // const tx =
      //   (clean.match(/transaction number is\s*([A-Z0-9]+)/i) ||
      //     clean.match(/transaction number\s*([A-Z0-9]+)/i) ||
      //     [])[1] || null;

      // const balanceMatch = transaction.match(
      //   /current balance is ETB ([\d.]+)/i,
      // )[1];
      // const dateMatch = transaction.match(
      //   /on (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
      // );
      // const [day, month, year] = dateMatch.split("/");
      // const date_ = new Date(year, month - 1, day);
      // const isoDate = date_.toISOString();
      //
      // if (true) payerAcc = "";
      // else recieverAcc = "";
      //
      // remaining = balanceMatch;
      // date = isoDate;
      // bank = "TeleBirr";
      // amount = "";
      // reason = "";
    }

    const dataRefactored = {
      payerAcc,
      payerAccNo,
      recieverAccNo,
      recieverAcc,
      reason,
      amount,
      date,
      bank,
      url,
      category,
      remaining,
    };
    console.log(dataRefactored);

    await addTransaction(JSON.stringify(dataRefactored));

    return Response.json({ status: "success" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
