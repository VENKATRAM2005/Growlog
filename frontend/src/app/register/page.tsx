"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import api from "../../api/client"
import AuthShell from "../../components/shared/AuthShell"
import { getApiErrorMessage } from "../../lib/api-error"

export default function RegisterPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    console.log("REGISTER CLICKED")

    if (isSubmitting) {
      console.log("Already submitting")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      console.log("Sending request...")

      const response = await api.post("/register", {
        username: username.trim(),
        password,
      })

      console.log("SUCCESS", response.data)

      router.push("/login")
    } catch (err) {
      console.error("REGISTER ERROR", err)

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
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="h-12 rounded-2xl border-white/10 bg-background/55"
          minLength={3}
          required
        />

        <Input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="h-12 rounded-2xl border-white/10 bg-background/55"
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