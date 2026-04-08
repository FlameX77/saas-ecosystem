export function success<T>(data: T, status: number = 200) {
  return Response.json({ data, success: true }, { status })
}

export function error(message: string, status: number = 400, code?: string) {
  return Response.json({ error: message, code, success: false }, { status })
}
