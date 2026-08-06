"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "../components/theme/ThemeProvider"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
  {/* <CommandPalette /> */}
  {children}
</QueryClientProvider>
    </ThemeProvider>
  )
}
