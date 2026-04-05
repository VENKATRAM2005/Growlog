import api from "../../api/client"
import { Task } from "./types"

export async function getPendingTasks(): Promise<Task[]> {
  const res = await api.get("/tasks/pending")
  return res.data
}

export async function getCompletedTasks(): Promise<Task[]> {
  const res = await api.get("/tasks/completed")
  return res.data
}

export async function createTasks(input: string) {
  const res = await api.post("/tasks/create", { input_text: input })

  return res.data
}

export async function completeTask(taskId: number) {
  const res = await api.put(`/tasks/complete/${taskId}`)
  return res.data
}
