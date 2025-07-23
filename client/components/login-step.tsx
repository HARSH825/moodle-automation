"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, Loader2 } from "lucide-react"
import type { AppState } from "@/types"
import { useApi } from "@/hooks/use-api"

interface LoginStepProps {
  appState: AppState
  updateState: (updates: Partial<AppState>) => void
}

export function LoginStep({ appState, updateState }: LoginStepProps) {
  const { login } = useApi()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    updateState({ loading: true, error: "" })

    try {
      const data = await login(appState.credentials)
      if (data.success) {
        updateState({
          courses: data.courses,
          currentStep: 2,
          success: "Login successful! Select courses to check assignments.",
          loading: false,
        })
      } else {
        updateState({ error: data.error || "Login failed", loading: false })
      }
    } catch (err) {
      updateState({ error: "Network error occurred", loading: false })
    }
  }

  const handleInputChange = (field: "username" | "password", value: string) => {
    updateState({
      credentials: { ...appState.credentials, [field]: value },
    })
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <User className="w-5 h-5" />
            <span>Login to Moodle</span>
          </CardTitle>
          <CardDescription>Enter your credentials to access your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={appState.credentials.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={appState.credentials.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={appState.loading || !appState.credentials.username || !appState.credentials.password}
            >
              {appState.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login & Fetch Courses"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
