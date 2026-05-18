import { clerkClient } from "@clerk/nextjs/server";
import { ADMINS } from "@/lib/utils";

export async function GET() {
  try {
    const clerk = await clerkClient();

    const users = await clerk.users.getUserList();

    return Response.json(
      users.data
        .filter((u) => !ADMINS.includes(u.id))
        .map((u) => ({
          id: u.id,
          username:
            u.username ||
            `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
            u.primaryEmailAddress?.emailAddress,
          image: u.imageUrl,
        })),
    );
  } catch (error) {
    console.error("CLERK ERROR:", error);

    return Response.json(
      {
        status: "error",
        error,
      },
      { status: 500 },
    );
  }
}
