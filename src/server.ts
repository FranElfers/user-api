import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/database";
import { startIndexCronJob } from '@leaderty/index-variations';
import { upsertIndexValue } from './queries/indexQueries';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  startIndexCronJob(async (i) => {
    await upsertIndexValue(i.index, i.date, i.value, 'cron')
  }, 8, process.env.ENVIRONMENT === 'prod')

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();