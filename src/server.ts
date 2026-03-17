import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/database";
import { startIndexCronJob } from './indexes';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  startIndexCronJob()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}



start();