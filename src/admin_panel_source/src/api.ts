import { SERVER_HOST } from './constants';

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, string | number>
): Promise<{ data?: T; error?: string; status?: number }> {
  const token = localStorage.getItem("admin_token")
  if (!token) {
    return { error: "No token", status: 401 }
  }

  let url = endpoint
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, String(value))
    }
  }

  try {
    const response = await fetch(SERVER_HOST + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("admin_token")
      return { error: "Unauthorized", status: response.status }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.message || `Error: ${response.status}`, status: response.status }
    }

    const data = await response.json()
    return { data }
  } catch {
    return { error: "Network error" }
  }
}
