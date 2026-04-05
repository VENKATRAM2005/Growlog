export interface Task {
  id: number
  title: string
  status: "pending" | "completed"
  created_at: string
  completed_at?: string
}