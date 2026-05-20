import { dbConnect } from "@/db/model";
import { deleteTransaction } from "@/db/methods";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    if (!id || !id.length) return Response.json({ status: "error" });

    return Response.json({
      status: "success",
      data: await deleteTransaction(id),
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { status: "error", message: "An error occurred" },
      { status: 500 },
    );
  }
}
