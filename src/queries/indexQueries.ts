import { Index, IIndex } from "../models/indexes";

/** Normalizes any date to the 1st of its month (UTC) to ensure consistent keys */
function toMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

/**
 * Inserts or updates the value for a given index+month.
 * Uses the compound unique index { index, date } as the filter key.
 */
export async function upsertIndexValue(
  indexName: string,
  date: Date,
  value: number,
  source: string
): Promise<IIndex> {
  const monthStart = toMonthStart(date);
  const result = await Index.findOneAndUpdate(
    { index: indexName, date: monthStart },
    { value, source },
    { upsert: true, new: true, runValidators: true }
  ).lean();
  return result!;
}

/**
 * Returns the document for a specific index and month, or null if not found.
 */
export async function getIndexByMonth(
  indexName: string,
  date: Date
): Promise<IIndex | null> {
  return Index.findOne({ index: indexName, date: toMonthStart(date) }).lean();
}

/**
 * Returns all monthly values for an index within [from, to] (inclusive, month-granularity),
 * sorted chronologically.
 */
export async function getIndexRange(
  indexName: string,
  from: Date,
  to: Date
): Promise<IIndex[]> {
  return Index.find({
    index: indexName,
    date: { $gte: toMonthStart(from), $lte: toMonthStart(to) }
  })
    .sort({ date: 1 })
    .lean();
}

/**
 * Returns the last N months of data for an index, sorted from most to least recent.
 */
export async function getLastNMonths(
  indexName: string,
  n: number
): Promise<IIndex[]> {
  return Index.find({ index: indexName })
    .sort({ date: -1 })
    .limit(n)
    .lean();
}

/**
 * Returns all indexes grouped by name, sorted by index name and date.
 */
export async function getAllIndexes(): Promise<{ [key: string]: IIndex[] }> {
  const all = await Index.find().sort({ index: 1, date: 1 }).lean();
  const grouped: { [key: string]: IIndex[] } = {};
  for (const doc of all) {
    if (!grouped[doc.index]) {
      grouped[doc.index] = [];
    }
    grouped[doc.index].push(doc);
  }
  return grouped;
}
