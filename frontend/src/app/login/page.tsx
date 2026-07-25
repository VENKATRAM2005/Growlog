"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import AuthShell from "../../components/shared/AuthShell"
import { getApiErrorMessage } from "../../lib/api-error"
import { setToken } from "../../lib/auth"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  async function handleLogin(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault()

    if (isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new URLSearchParams()
      formData.append("username", username)
      formData.append("password", password)

      const res = await api.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      setToken(res.data.access_token as string)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to sign in. Check your credentials and try again."
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in and get moving."
      subtitle="Drop back into your execution cockpit and keep your momentum visible."
      footerText="Need an account?"
      footerLinkLabel="Create one"
      footerHref="/register"
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        <Input
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
          autoComplete="username"
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
          autoComplete="current-password"
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-sm text-muted-foreground">
          First time here?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground"
          >
            Create an account
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  )
}