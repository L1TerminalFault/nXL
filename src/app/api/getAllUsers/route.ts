import { clerkClient } from "@clerk/nextjs/server";

import { isAdmin } from "@/lib/utils";

export async function GET() {
  try {
    const clerk = await clerkClient();

    const users = await clerk.users.getUserList();

    const filteredUsers = users.data.filter((user) => !isAdmin(user.id));

    return Response.json(
      filteredUsers.map((u) => ({
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
