import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { initDatabase } from "./db";
import routes from "./routes";
import { successResponse } from "@sudobility/starter_types";
import { getEnv } from "./lib/env-helper";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
  return c.json(
    successResponse({
      name: "Starter API",
      version: "1.0.0",
      status: "healthy",
    })
  );
});

app.get("/health", (c) => {
  return c.json(successResponse({ status: "healthy" }));
});

app.route("/api/v1", routes);

const port = parseInt(getEnv("PORT", "8022")!);

initDatabase()
  .then(() => {
    console.log(`Starter API running on http://localhost:${port}`);
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

export default {
  port,
  fetch: app.fetch,
};

export { app };
