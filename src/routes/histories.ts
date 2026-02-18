import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, histories } from "../db";
import { successResponse, errorResponse } from "@sudobility/starter_types";

const historiesRouter = new Hono();

// GET / - List all histories for user
historiesRouter.get("/", async (c) => {
  const userId = c.req.param("userId")!;
  const tokenUserId = c.get("userId");

  if (userId !== tokenUserId && !c.get("siteAdmin")) {
    return c.json(errorResponse("Not authorized"), 403);
  }

  const result = await db
    .select()
    .from(histories)
    .where(eq(histories.user_id, userId));

  const data = result.map((h) => ({
    id: h.id,
    user_id: h.user_id,
    datetime: h.datetime.toISOString(),
    value: Number(h.value),
    created_at: h.created_at?.toISOString() ?? null,
    updated_at: h.updated_at?.toISOString() ?? null,
  }));

  return c.json(successResponse(data));
});

// POST / - Create a history
historiesRouter.post("/", async (c) => {
  const userId = c.req.param("userId")!;
  const tokenUserId = c.get("userId");

  if (userId !== tokenUserId && !c.get("siteAdmin")) {
    return c.json(errorResponse("Not authorized"), 403);
  }

  const body = await c.req.json();
  const { datetime, value } = body;

  if (!datetime || value === undefined || value === null) {
    return c.json(errorResponse("datetime and value are required"), 400);
  }

  if (typeof value !== "number" || value <= 0) {
    return c.json(errorResponse("value must be a positive number"), 400);
  }

  const result = await db
    .insert(histories)
    .values({
      user_id: userId,
      datetime: new Date(datetime),
      value: String(value),
    })
    .returning();

  const h = result[0];
  return c.json(
    successResponse({
      id: h.id,
      user_id: h.user_id,
      datetime: h.datetime.toISOString(),
      value: Number(h.value),
      created_at: h.created_at?.toISOString() ?? null,
      updated_at: h.updated_at?.toISOString() ?? null,
    }),
    201
  );
});

// PUT /:historyId - Update a history
historiesRouter.put("/:historyId", async (c) => {
  const userId = c.req.param("userId")!;
  const historyId = c.req.param("historyId")!;
  const tokenUserId = c.get("userId");

  if (userId !== tokenUserId && !c.get("siteAdmin")) {
    return c.json(errorResponse("Not authorized"), 403);
  }

  const body = await c.req.json();
  const updates: Record<string, unknown> = {};

  if (body.datetime !== undefined) {
    updates.datetime = new Date(body.datetime);
  }
  if (body.value !== undefined) {
    if (typeof body.value !== "number" || body.value <= 0) {
      return c.json(errorResponse("value must be a positive number"), 400);
    }
    updates.value = String(body.value);
  }

  if (Object.keys(updates).length === 0) {
    return c.json(errorResponse("No fields to update"), 400);
  }

  updates.updated_at = new Date();

  const result = await db
    .update(histories)
    .set(updates)
    .where(and(eq(histories.id, historyId), eq(histories.user_id, userId)))
    .returning();

  if (result.length === 0) {
    return c.json(errorResponse("History not found"), 404);
  }

  const h = result[0];
  return c.json(
    successResponse({
      id: h.id,
      user_id: h.user_id,
      datetime: h.datetime.toISOString(),
      value: Number(h.value),
      created_at: h.created_at?.toISOString() ?? null,
      updated_at: h.updated_at?.toISOString() ?? null,
    })
  );
});

// DELETE /:historyId - Delete a history
historiesRouter.delete("/:historyId", async (c) => {
  const userId = c.req.param("userId")!;
  const historyId = c.req.param("historyId")!;
  const tokenUserId = c.get("userId");

  if (userId !== tokenUserId && !c.get("siteAdmin")) {
    return c.json(errorResponse("Not authorized"), 403);
  }

  const result = await db
    .delete(histories)
    .where(and(eq(histories.id, historyId), eq(histories.user_id, userId)))
    .returning();

  if (result.length === 0) {
    return c.json(errorResponse("History not found"), 404);
  }

  return c.json(successResponse(null));
});

export default historiesRouter;
