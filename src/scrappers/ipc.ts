
interface Response {
  indice_ipc: number,
  mes: number,
  nombre_mes: string,
  anio: number,
  fecha_publicacion: string,
  fecha_proximo_informe: string
}

export async function getIPCVariation(): Promise<number | null> {
  const response = await fetch("https://api.argly.com.ar/api/ipc/");
  const data = await response.json();
  if (!data || !data.data || typeof data.data.indice_ipc !== "number") {
    throw new Error("Invalid IPC data");
  }

  return data.data.indice_ipc;
}