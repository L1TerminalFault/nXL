import { addTransaction } from "@/db/methods";
import { dbConnect } from "@/db/model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { transaction } = await req.json();

    const match = transaction.match(/https?:\/\/[^\s]+/);

    let link: string = match?.[0];
    let tid: string;

    if (!link)
      return Response.json(
        { status: "error", message: "No link found in the transaction" },
        { status: 400 },
      );

    if (link.includes("apps.cbe.com.et")) {
      const id = new URL(link).searchParams.get("id");
      if (!id || !id.length) {
        const id = link.split("/").pop()?.replace("&", "-");
        if (!id)
          return Response.json(
            { status: "error", message: "No id found in the link" },
            { status: 400 },
          );
        tid = id;
      } else tid = id.slice(0, 12) + "-" + id.slice(12);

      link = `https://mbreciept.cbe.com.et/${tid}`;
    } else {
      const id = link.split("/").pop();
      if (!id)
        return Response.json(
          { status: "error", message: "No id found in the link" },
          { status: 400 },
        );
      tid = id;
    }

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
        { status: "error", message: "Invalid transaction link" },
        { status: 400 },
      );

    const dataRefactored = {
      payerAcc: data?.debitAccountHolder,
      payerAccNo: data?.debitAccountNo,
      recieverAccNo: data?.creditAccountNo,
      recieverAcc: data?.creditAccountHolder,
      reason: data?.paymentDetails?.[0] || "",
      amount: data?.debitCurrency + " " + data?.debitAmount,
      date: data?.dateTimes?.[0] || "",
    };

    await addTransaction(
      JSON.stringify({ ...dataRefactored, url: link, category: "" }),
    );

    return Response.json({ status: "success" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
