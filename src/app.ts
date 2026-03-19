import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/userRoutes";
import configRoutes from "./routes/configRoutes";
import indexRoutes from './routes/indexRoutes';
import syncRoutes from './routes/syncRoutes';
import { setupSwagger } from "./swagger";

const app = express();

app.use(express.json({ limit: "20mb" }));

app.use("/api", configRoutes);
app.use("/api", userRoutes);
app.use("/api", indexRoutes);
app.use("/api", syncRoutes);

setupSwagger(app);

app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large" });
  }
  console.error("[global error handler]", err);
  res.status(err.status ?? 500).json({ message: err.message ?? "Internal server error" });
});

export default app;