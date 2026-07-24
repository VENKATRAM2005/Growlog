type ErrorShape = {
  response?: {
    data?: {
      detail?: string
      error?: {
        message?: string
      }
    }
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) {
    return fallback
  }

  const candidate = error as ErrorShape
  const detail = candidate.response?.data?.detail
  if (typeof detail === "string" && detail.trim()) {
    return detail
  }

  const message = candidate.response?.data?.error?.message
  if (typeof message === "string" && message.trim()) {
    return message
  }

  return fallback
}
