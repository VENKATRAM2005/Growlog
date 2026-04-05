"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import AuthShell from "../../components/shared/AuthShell"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleRegister() {
    setError(null)
    setIsSubmitting(true)

    try {
      await api.post("/register", { username, password })
      router.push("/login")
    } catch (err: unknown) {
      const detail =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : "Registration failed. Try a different username."
      setError(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start a system you will actually want to use."
      subtitle="Set up your execution layer, build visible consistency, and turn work into proof."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerHref="/login"
    >
      <div className="space-y-4">
        <Input
          placeholder="Choose a username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
        />
        <Input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="h-12 w-full rounded-2xl" onClick={handleRegister} disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </AuthShell>
  )
}
