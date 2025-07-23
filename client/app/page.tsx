"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProgressSteps } from "@/components/progress-steps"
import { LoginStep } from "@/components/login-step"
import { CourseSelectionStep } from "@/components/course-selection-step"
import { AssignmentSelectionStep } from "@/components/assignment-selection-step"
import { AlertMessage } from "@/components/alert-message"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { AppState } from "@/types"

export default function MoodleAssistant() {
  const router = useRouter()
  
  const [appState, setAppState] = useState<AppState>({
    currentStep: 1,
    loading: false,
    error: "",
    success: "",
    credentials: { username: "", password: "" },
    courses: [],
    selectedCourses: [],
    checkJobId: "",
    checkProgress: 0,
    assignments: {},
    selectedAssignments: [],
    docJobId: "",
    docProgress: 0,
  })

  // Remove the problematic useEffect that was causing the redirect

  const updateState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }))
  }

  const resetApp = () => {
    setAppState({
      currentStep: 1,
      loading: false,
      error: "",
      success: "",
      credentials: { username: "", password: "" },
      courses: [],
      selectedCourses: [],
      checkJobId: "",
      checkProgress: 0,
      assignments: {},
      selectedAssignments: [],
      docJobId: "",
      docProgress: 0,
    })
  }

  const goToLanding = () => {
    router.push('/landing')
  }

  return (
    <div className="min-h-screen bg-black">
      <Header currentStep={appState.currentStep} onReset={resetApp} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back to Landing Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={goToLanding}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Landing
          </Button>
        </div>

        <ProgressSteps currentStep={appState.currentStep} />
        
        <div className="mt-8">
          <AlertMessage error={appState.error} success={appState.success} />
        </div>

        <div className="mt-8">
          {appState.currentStep === 1 && (
            <LoginStep appState={appState} updateState={updateState} />
          )}
          {appState.currentStep === 2 && (
            <CourseSelectionStep appState={appState} updateState={updateState} />
          )}
          {appState.currentStep === 3 && (
            <AssignmentSelectionStep appState={appState} updateState={updateState} />
          )}
        </div>
      </div>
    </div>
  )
}
