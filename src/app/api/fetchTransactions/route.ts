import { auth } from "@clerk/nextjs/server";

import { getTransactions } from "@/db/methods";
import { dbConnect } from "@/db/model";
import { ADMINS } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { userId } = await auth();
    if (!userId) return Response.json({ status: "error" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const user = searchParams.get("user");
    if (!user || !user.length) return Response.json({ status: "error" });

    if (ADMINS.includes(userId))
      return Response.json({
        status: "success",
        data: await getTransactions(),
      });
    else
      return Response.json({
        status: "success",
        data: await getTransactions(user),
      });
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
