export function getToken() {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage.getItem("token")
}

export function setToken(token: string) {
  window.localStorage.setItem("token", token)
}

export function clearToken() {
  window.localStorage.removeItem("token")
}
