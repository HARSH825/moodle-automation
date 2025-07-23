"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Loader2, ArrowRight, CheckCircle } from "lucide-react"
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

    updateState({ loading: true, error: "", success: "" })

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

  // Handle clicking on the entire card
  const handleCardClick = (courseId: string) => {
    const isSelected = appState.selectedCourses.includes(courseId)
    handleCourseSelection(courseId, !isSelected)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Selection Card */}
      <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span>Select Your Courses</span>
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Choose courses to check for pending assignments
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {appState.courses.map((course) => (
              <Card 
                key={course.id} 
                className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-2 ${
                  appState.selectedCourses.includes(course.id) 
                    ? 'border-blue-500 bg-blue-950/30 shadow-blue-500/10' 
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
                onClick={() => handleCardClick(course.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={appState.selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) => handleCourseSelection(course.id, !!checked)}
                      onClick={(e) => e.stopPropagation()} // Prevent double-click when clicking checkbox
                      className="mt-1 border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                        {course.title?.replace(/\n\s*/g, ' ').trim() || course.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge variant="secondary" className="bg-gray-700 text-gray-200 border-gray-600 px-3 py-1">
                          ID: {course.id}
                        </Badge>
                        <div className="flex items-center text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          Active Course
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selection Summary & Action */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-gray-600 text-gray-300 px-3 py-1">
                {appState.selectedCourses.length} of {appState.courses.length} courses selected
              </Badge>
            </div>
            
            <Button 
              onClick={handleAssignmentCheck}
              disabled={appState.loading || appState.selectedCourses.length === 0}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 shadow-lg shadow-blue-500/25"
            >
              {appState.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Check Assignments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {appState.checkJobId && (
        <Card className="bg-blue-950/20 border-blue-600/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              {appState.checkProgress >= 100 ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {appState.checkProgress >= 100 ? "Assignment Check Complete!" : "Checking assignments..."}
                </h3>
                <p className="text-blue-200">
                  Processing {appState.selectedCourses.length} selected courses
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-blue-200">
                <span>Progress</span>
                <span>{appState.checkProgress}%</span>
              </div>
              <Progress value={appState.checkProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
