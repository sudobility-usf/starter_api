import { Hono } from "hono";
import { firebaseAuthMiddleware } from "../middleware/firebaseAuth";
import usersRouter from "./users";
import historiesRouter from "./histories";
import historiesTotalRouter from "./historiesTotal";

const routes = new Hono();

// Public routes (no auth required)
routes.route("/histories", historiesTotalRouter);

// Auth-required routes
const authRoutes = new Hono();
authRoutes.use("*", firebaseAuthMiddleware);
authRoutes.route("/users/:userId", usersRouter);
authRoutes.route("/users/:userId/histories", historiesRouter);
routes.route("/", authRoutes);

export default routes;
