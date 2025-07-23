"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProgressSteps } from "@/components/progress-steps"
import { LoginStep } from "@/components/login-step"
import { CourseSelectionStep } from "@/components/course-selection-step"
import { AssignmentSelectionStep } from "@/components/assignment-selection-step"
import { AlertMessage } from "@/components/alert-message"
import type { AppState } from "@/types"

export default function MoodleAssistant() {
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

  return (
    <div className="min-h-screen bg-background">
      <Header currentStep={appState.currentStep} onReset={resetApp} />

      <div className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={appState.currentStep} />

        <AlertMessage error={appState.error} success={appState.success} />

        {appState.currentStep === 1 && <LoginStep appState={appState} updateState={updateState} />}

        {appState.currentStep === 2 && <CourseSelectionStep appState={appState} updateState={updateState} />}

        {appState.currentStep === 3 && <AssignmentSelectionStep appState={appState} updateState={updateState} />}
      </div>
    </div>
  )
}
