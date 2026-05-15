import { updateTransaction } from "@/db/methods";
import { dbConnect } from "@/db/model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { transaction } = await req.json();

    await updateTransaction({
      _id: transaction._id,
      transaction: JSON.stringify(transaction.transaction),
      users: transaction.users,
    });

    // console.log(transaction);
    return Response.json({ status: "success" });
  } catch (error) {
    // console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
