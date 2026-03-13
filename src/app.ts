import express from "express";
import userRoutes from "./routes/userRoutes";
import configRoutes from "./routes/configRoutes";
import { setupSwagger } from "./swagger";

const app = express();

app.use(express.json());

app.use("/api", configRoutes);
app.use("/api", userRoutes);

setupSwagger(app);
export default app;