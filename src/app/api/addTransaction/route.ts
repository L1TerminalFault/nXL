import { addTransaction, TransactionType } from "@/db/methods";
import { dbConnect } from "@/db/model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { transaction } = await req.json();

    const match = transaction.match(/https?:\/\/[^\s]+/);

    const link: string = match?.[0];
    if (!link) return;
    // const tid = link.split("/").slice(-1)[0];
    const tid = link.split("/").pop();

    const data = (await (
      await fetch(
        `https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${tid}`,
        // "https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/FT26131F781G-21195744",
        // "https://mb.cbe.com.et/api/v1/transactions/public/transaction-detail/FT26133Y5Q7P-21195744",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "X-App-ID": "d1292e42-7400-49de-a2d3-9731caa4c819",
            "X-App-Version": "0a01980b-9859-1369-8198-59f403820000",
          },
        },
      )
    ).json()) as TransactionType;

    await addTransaction(JSON.stringify({ ...data, url: link }));

    return Response.json({ status: "success" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
