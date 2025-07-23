"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, Loader2, Shield } from "lucide-react"
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
    updateState({ loading: true, error: "", success: "" })

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
      <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Login to Moodle
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Enter your credentials to access your courses and assignments
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300 font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={appState.credentials.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                  className="pl-10 h-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={appState.credentials.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="pl-10 h-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={appState.loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25"
            >
              {appState.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Moodle...
                </>
              ) : (
                "Login & Fetch Courses"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Your credentials are securely encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
