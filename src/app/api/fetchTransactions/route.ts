import { auth } from "@clerk/nextjs/server";

import { getTransactions } from "@/db/methods";
import { dbConnect, OrderObj } from "@/db/model";
import { isAdmin } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) return Response.json({ status: "error" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const user = searchParams.get("user");
    if (!user || !user.length || !userId)
      return Response.json({ status: "error" });

    const ordersPromise = OrderObj.find().sort({ date: -1 });

    if (isAdmin(userId)) {
      const [transactions, orders] = await Promise.all([
        getTransactions(),
        ordersPromise,
      ]);
      return Response.json({
        status: "success",
        data: transactions,
        orders,
      });
    } else {
      const [transactions, orders] = await Promise.all([
        getTransactions(user),
        ordersPromise,
      ]);
      return Response.json({
        status: "success",
        data: transactions,
        orders,
      });
    }
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
