import * as z from 'zod'

export async function getIPCVariation(): Promise<{ value: number; date: Date }> {
  const response = await fetch("https://api.argly.com.ar/api/ipc/")
  const data = await response.json()
  if (!data || !data.data) throw new Error("Invalid IPC data")

  const ipcSchema = z.object({
    indice_ipc: z.number(),
    mes: z.number(),
    nombre_mes: z.string(),
    anio: z.number(),
    fecha_publicacion: z.string(),
    fecha_proximo_informe: z.string()
  })
  const parsed = ipcSchema.safeParse(data.data)
  if (!parsed.success) throw new Error("Invalid IPC data")

  // Format date from "DD/MM/YYYY" to Date object
  const dateParts = parsed.data.fecha_publicacion.split('/')
  if (dateParts.length !== 3) throw new Error("Invalid date format in IPC data")
  const pubDate = new Date(parseInt(dateParts[2]), parsed.data.mes, parseInt(dateParts[0]))

  return { value: parsed.data.indice_ipc, date: pubDate }
}