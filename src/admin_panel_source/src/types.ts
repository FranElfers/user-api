export interface User {
  _id: string
  name: string
  cuit: string
  email: string
  status: string
  isAdmin: boolean
  config: Record<string, unknown>
}

export interface Index {
  name: string;
  date: string;
  value: number;
}

export interface IndexRaw {
  name: string;
  variations: {
    date: string;
    value: number;
  }[];
}

export interface SyncRecord {
  id: string
  table: string
  clientId: number
  deviceId: string
  userId: string
  updatedAt: number
  serverReceivedAt: string
  data: Record<string, unknown>
}

export type SortDirection = "asc" | "desc"
