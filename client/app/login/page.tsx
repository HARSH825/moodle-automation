"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertMessage } from "@/components/alert-message"
import { PageHeader } from "@/components/page-header"
import { User, Lock, Loader2, Shield } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { storage, STORAGE_KEYS } from "@/lib/storage"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApi()
  
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const data = await login(credentials)
      if (data.success) {
        storage.set(STORAGE_KEYS.COURSES, data.courses)
        storage.set(STORAGE_KEYS.CREDENTIALS, credentials)  //browser storage
        
        setSuccess("Login successful! Redirecting to course selection...")
        setTimeout(() => router.push('/courses'), 1500)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <PageHeader 
        title="Moodle Login" 
        subtitle="Connect to your Moodle account"
        showBackButton
        backTo="/"
        backLabel="Back to Home"
      />
      
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                SPIT 
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Enter your Moodle credentials to access your courses and assignments
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <AlertMessage error={error} success={success} />
              
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
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
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
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      required
                      className="pl-10 h-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="cursor-pointer w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting to Moodle...
                    </>
                  ) : (
                    "Login & Access Courses"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Your credentials are securely encrypted and <p className="font-bold text-white">never stored</p></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
