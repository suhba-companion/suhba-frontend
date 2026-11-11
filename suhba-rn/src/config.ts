/**
 * `import.meta.env.VITE_API_BASE_URL` appears in five files on the web. Here it is read
 * once, so moving the backend is a one-line change.
 */
export const API_ORIGIN = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export const API_BASE = `${API_ORIGIN}/api/v1`

