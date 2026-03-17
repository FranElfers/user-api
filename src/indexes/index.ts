import { CronJob } from 'cron';
import { getIPCVariation } from '../indexes/ipc';
import { upsertIndexValue } from '../queries/indexQueries';

/**
 * Fetches and saves all indexes to the database.
 */
async function fetchAndSaveIndexes(): Promise<void> {
  try {
    console.log('[INDEX] Fetching indexes...');

    // Fetch IPC (available index)
    const { value: ipcValue, date: ipcDate } = await getIPCVariation();
    await upsertIndexValue('IPC', ipcDate, ipcValue, 'cron');
    console.log(`[INDEX] IPC saved: ${ipcValue}`);

    // Future: add more indexes here as they become available
    // const { value: ripteValue, date: ripteDate } = await getRipteVariation();
    // await upsertIndexValue('RIPTE', ripteDate, ripteValue, 'cron');
  } catch (error) {
    console.error('[INDEX] Unexpected error:', error);
  }
}

/**
 * Starts a cron job that fetches all indexes every day at 8 AM Argentina time.
 * Executes immediately on startup and then at 8 AM daily.
 */
export async function startIndexCronJob(): Promise<CronJob> {
  // Execute immediately on startup
  await fetchAndSaveIndexes();

  const job = new CronJob(
    '0 8 * * *',
    fetchAndSaveIndexes,
    null,
    true,
    'America/Argentina/Buenos_Aires'
  );

  console.log('[CRON-INDEX] Index cron job started (8 AM Argentina)');
  return job;
}
