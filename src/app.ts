import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes";
import configRoutes from "./routes/configRoutes";
import indexRoutes from './routes/indexRoutes';
import syncRoutes from './routes/syncRoutes';
import { setupSwagger } from "./swagger";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "20mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
});

app.use("/api", configRoutes);
app.use("/api", userRoutes);
app.use("/api", indexRoutes);
app.use("/api", syncRoutes);

setupSwagger(app);

const adminPanelPath = path.join(__dirname, "admin_panel");
app.use("/admin", express.static(adminPanelPath));
app.get("/admin", (_req, res) => res.sendFile(path.join(adminPanelPath, "index.html")));

app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large" });
  }
  console.error("[global error handler]", err);
  res.status(err.status ?? 500).json({ message: err.message ?? "Internal server error" });
});

export default app;