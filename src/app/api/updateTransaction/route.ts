import { updateTransaction } from "@/db/methods";
import { dbConnect } from "@/db/model";

export async function POST(req: Request) {
  await dbConnect();

  const { transaction } = await req.json();

  await updateTransaction({
    _id: transaction._id,
    transaction: JSON.stringify(transaction),
    users: transaction.users,
  });

  return Response.json({ status: "success" });
}
