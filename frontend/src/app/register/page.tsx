"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import AuthShell from "../../components/shared/AuthShell"
import { getApiErrorMessage } from "../../lib/api-error"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  async function handleRegister(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault()

    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      await api.post("/register", {
        username: username.trim(),
        password,
      })

      router.push("/login")
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Registration failed. Try a different username."
        )
      )
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
      <form className="space-y-4" onSubmit={handleRegister}>
        <Input
          placeholder="Choose a username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
          autoComplete="username"
          minLength={3}
          required
        />

        <Input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
          autoComplete="new-password"
          minLength={8}
          required
        />

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl"
          disabled={
            isSubmitting ||
            username.trim().length < 3 ||
            password.length < 8
          }
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}