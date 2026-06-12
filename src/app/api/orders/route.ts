import { dbConnect, OrderObj } from "@/db/model";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const orders = await OrderObj.find().sort({ date: -1 });
    return Response.json({ status: "success", data: orders });
  } catch (error) {
    return Response.json({ status: "error", message: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newOrder = await OrderObj.create(body);
    return Response.json({ status: "success", data: newOrder });
  } catch (error) {
    return Response.json({ status: "error", message: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) return Response.json({ status: "error", message: "Missing id" }, { status: 400 });

    const updatedOrder = await OrderObj.findByIdAndUpdate(id, body, { new: true });
    return Response.json({ status: "success", data: updatedOrder });
  } catch (error) {
    return Response.json({ status: "error", message: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ status: "error", message: "Missing id" }, { status: 400 });

    await OrderObj.findByIdAndDelete(id);
    return Response.json({ status: "success" });
  } catch (error) {
    return Response.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
