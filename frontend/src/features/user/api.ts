import api from "../../api/client"
import { UserProfile } from "./types"

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await api.get("/user/me")
  return response.data
}
