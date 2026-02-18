import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db, histories } from "../db";
import { successResponse } from "@sudobility/starter_types";

const historiesTotalRouter = new Hono();

// GET /total - Get total of all history values (public)
historiesTotalRouter.get("/total", async (c) => {
  const result = await db
    .select({
      total: sql<string>`COALESCE(SUM(${histories.value}), 0)`,
    })
    .from(histories);

  const total = Number(result[0].total);
  return c.json(successResponse({ total }));
});

export default historiesTotalRouter;
