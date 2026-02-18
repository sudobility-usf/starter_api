import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, users } from "../db";
import { successResponse, errorResponse } from "@sudobility/starter_types";

const usersRouter = new Hono();

// GET /:userId - Get user info
usersRouter.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const tokenUserId = c.get("userId");

  if (userId !== tokenUserId && !c.get("siteAdmin")) {
    return c.json(errorResponse("Not authorized to view this user"), 403);
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.firebase_uid, userId));

  if (result.length === 0) {
    return c.json(errorResponse("User not found"), 404);
  }

  const user = result[0];
  return c.json(
    successResponse({
      firebase_uid: user.firebase_uid,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at?.toISOString() ?? null,
      updated_at: user.updated_at?.toISOString() ?? null,
    })
  );
});

export default usersRouter;
