"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Loader2 } from "lucide-react"
import type { AppState } from "@/types"
import { useApi } from "@/hooks/use-api"

interface CourseSelectionStepProps {
  appState: AppState
  updateState: (updates: Partial<AppState>) => void
}

export function CourseSelectionStep({ appState, updateState }: CourseSelectionStepProps) {
  const { checkAssignments, getSubmissionJobStatus, getNonSubmittedAssignments } = useApi()

  // Polling for job status
  useEffect(() => {
    if (!appState.checkJobId || appState.checkProgress >= 100) return

    const interval = setInterval(async () => {
      try {
        const data = await getSubmissionJobStatus(appState.checkJobId)
        if (data.success) {
          updateState({ checkProgress: data.job.progress || 0 })
          if (data.job.status === "completed") {
            updateState({ checkProgress: 100 })
            fetchAssignments()
          }
        }
      } catch (err) {
        console.error("Error checking job status:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [appState.checkJobId, appState.checkProgress])

  const fetchAssignments = async () => {
    try {
      const data = await getNonSubmittedAssignments(appState.credentials.username)
      if (data.success) {
        updateState({
          assignments: data.nonSubmittedAssignments,
          currentStep: 3,
          success: `Found assignments in ${data.coursesFound} courses!`,
        })
      }
    } catch (err) {
      updateState({ error: "Failed to fetch assignments" })
    }
  }

  const handleAssignmentCheck = async () => {
    if (appState.selectedCourses.length === 0) {
      updateState({ error: "Please select at least one course" })
      return
    }

    updateState({ loading: true, error: "" })

    try {
      const data = await checkAssignments({
        username: appState.credentials.username,
        selectedCourseIds: appState.selectedCourses,
      })

      if (data.success) {
        updateState({
          checkJobId: data.jobId,
          success: `Checking assignments for ${data.selectedCourses} courses...`,
          loading: false,
        })
      } else {
        updateState({ error: data.error || "Failed to start assignment check", loading: false })
      }
    } catch (err) {
      updateState({ error: "Network error occurred", loading: false })
    }
  }

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    const newSelection = checked
      ? [...appState.selectedCourses, courseId]
      : appState.selectedCourses.filter((id) => id !== courseId)

    updateState({ selectedCourses: newSelection })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Select Courses</span>
          </CardTitle>
          <CardDescription>Choose courses to check for pending assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {appState.courses.map((course) => (
              <div key={course.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50">
                <Checkbox
                  id={course.id}
                  checked={appState.selectedCourses.includes(course.id)}
                  onCheckedChange={(checked) => handleCourseSelection(course.id, !!checked)}
                />
                <Label htmlFor={course.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{course.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {course.id}</div>
                </Label>
              </div>
            ))}
          </div>

          {appState.checkJobId && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Checking assignments...</span>
                <span className="text-sm text-muted-foreground">{appState.checkProgress}%</span>
              </div>
              <Progress value={appState.checkProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-between">
            <Badge variant="outline">{appState.selectedCourses.length} courses selected</Badge>
            <Button
              onClick={handleAssignmentCheck}
              disabled={appState.loading || appState.selectedCourses.length === 0}
            >
              {appState.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Check Assignments
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
