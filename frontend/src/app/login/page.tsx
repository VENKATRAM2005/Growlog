"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "../../api/client"
import AuthShell from "../../components/shared/AuthShell"
import { setToken } from "../../lib/auth"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new URLSearchParams()
      formData.append("username", username)
      formData.append("password", password)

      const res = await api.post("/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      setToken(res.data.access_token as string)
      router.push("/dashboard")
    } catch (err: unknown) {
      const detail =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : "Unable to sign in. Check your credentials and try again."
      setError(detail)
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
      <div className="space-y-4">
        <Input
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-2xl border-white/10 bg-background/55"
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="h-12 w-full rounded-2xl" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-sm text-muted-foreground">
          First time here? You can also <Link href="/register" className="font-medium text-foreground">create an account</Link>.
        </p>
      </div>
    </AuthShell>
  )
}
