import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env.ts";
import { healthRouter } from "./routes/health.ts";

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use("/api/v1", healthRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error", err);
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
      ? err.status
      : 500;
  const message =
    typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
      ? err.message
      : "Internal Server Error";
  res.status(status).json({ error: message });
});

app.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});
