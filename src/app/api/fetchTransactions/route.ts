import { getTransactions } from "@/db/methods";
import { dbConnect } from "@/db/model";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const user = searchParams.get("user");

  if (!user || !user.length)
    return Response.json({ status: "success", data: await getTransactions() });
  else
    return Response.json({
      status: "success",
      data: await getTransactions(user),
    });
}
