import express from "express";
import userRoutes from "./routes/userRoutes";
import configRoutes from "./routes/configRoutes";
import indexRoutes from './routes/indexRoutes';
import { setupSwagger } from "./swagger";

const app = express();

app.use(express.json());

app.use("/api", configRoutes);
app.use("/api", userRoutes);
app.use("/api", indexRoutes);

setupSwagger(app);
export default app;