"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertMessage } from "@/components/alert-message"
import { PageHeader } from "@/components/page-header"
import { Notebook, Clock, Loader2, ArrowRight, CheckCircle } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import type { Course, Credentials } from "@/types"

export default function CoursesPage() {
  const router = useRouter()
  const { checkAssignments, getSubmissionJobStatus, getNonSubmittedAssignments } = useApi()
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [credentials, setCredentials] = useState<Credentials>({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false) 
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checkJobId, setCheckJobId] = useState("")
  const [checkProgress, setCheckProgress] = useState(0)

  useEffect(() => {
    // Load data from localStorage
    const storedCourses = storage.get(STORAGE_KEYS.COURSES)
    const storedCredentials = storage.get(STORAGE_KEYS.CREDENTIALS)
    
    if (!storedCourses || !storedCredentials) {
      router.push('/login')
      return
    }
    
    setCourses(storedCourses)
    setCredentials(storedCredentials)
  }, [router])

  //  job status
  useEffect(() => {
    if (!checkJobId || checkProgress >= 100) return

    const interval = setInterval(async () => {
      try {
        const data = await getSubmissionJobStatus(checkJobId)
        if (data.success) {
          setCheckProgress(data.job.progress || 0)
          if (data.job.status === "completed") {
            setCheckProgress(100)
            fetchAssignments()
          }
        }
      } catch (err) {
        console.error("Error checking job status:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [checkJobId, checkProgress])

  const fetchAssignments = async () => {
    try {
      const data = await getNonSubmittedAssignments(credentials.username)
      if (data.success) {
        storage.set(STORAGE_KEYS.ASSIGNMENTS, data.nonSubmittedAssignments)
        setSuccess(`Found assignments in ${data.coursesFound} courses! Redirecting...`)
        setTimeout(() => router.push('/assignments'), 1500)
      }
    } catch (err) {
      setError("Failed to fetch assignments")
    }
  }

  const handleAssignmentCheck = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course")
      return
    }

    setLoading(true)
    setButtonClicked(true) 
    setError("")
    setSuccess("")
    
    // scroll
    setTimeout(() => {
      progressRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }, 300)
    
    try {
      const data = await checkAssignments({
        username: credentials.username,
        selectedCourseIds: selectedCourses,
      })
      
      if (data.success) {
        setCheckJobId(data.jobId)
        setSuccess(`Checking assignments for ${data.selectedCourses} courses...`)
        setLoading(false)
      } else {
        setError(data.error || "Failed to start assignment check")
        setLoading(false)
        setButtonClicked(false) 
      }
    } catch (err) {
      setError("Network error occurred")
      setLoading(false)
      setButtonClicked(false)
    }
  }

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedCourses, courseId]
      : selectedCourses.filter((id) => id !== courseId)
    setSelectedCourses(newSelection)
  }

  const handleCardClick = (courseId: string) => {
    const isSelected = selectedCourses.includes(courseId)
    handleCourseSelection(courseId, !isSelected)
  }

  return (
    <div className="min-h-screen bg-black">
      <PageHeader 
        title="Course Selection" 
        subtitle="Choose courses to check for assignments"
        showBackButton
        backTo="/login"
        backLabel="Back to Login"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <AlertMessage error={error} success={success} />
        
        <div className="mt-6 space-y-6">
          {/* Course Selection Card */}
          <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-white flex items-center justify-center space-x-3">
                <Notebook className="h-6 w-6 text-blue-400" />
                <span>Select Your Courses</span>
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Choose courses to check for pending assignments
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {courses.map((course) => (
                  <Card 
                    key={course.id} 
                    className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-2 ${
                      selectedCourses.includes(course.id) 
                        ? 'border-blue-500 bg-blue-950/30 shadow-blue-500/10' 
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleCardClick(course.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) => handleCourseSelection(course.id, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white mb-2 leading-tight">
                            {course.title?.replace(/\n\s*/g, ' ').trim() || course.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs">
                            <Badge variant="secondary" className="bg-gray-700 text-gray-200 border-gray-600 px-2 py-1 text-xs">
                              ID: {course.id}
                            </Badge>
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
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
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-gray-600 text-gray-300 px-2 py-1 text-xs">
                    {selectedCourses.length} of {courses.length} courses selected
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleAssignmentCheck}
                  disabled={loading || selectedCourses.length === 0 || buttonClicked}
                  size="sm"
                  className=" cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 shadow-lg shadow-blue-500/25 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Checking...
                    </>
                  ) : buttonClicked ? (
                    "Processing..."
                  ) : (
                    <>
                      Check Assignments
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          {checkJobId && (
            <div ref={progressRef}>
              <Card className="bg-blue-950/20 border-blue-600/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {checkProgress >= 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {checkProgress >= 100 ? "Assignment Check Complete!" : "Checking assignments..."}
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Processing {selectedCourses.length} selected courses
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-blue-200">
                      <span>Progress</span>
                      <span>{checkProgress}%</span>
                    </div>
                    <Progress 
                      value={checkProgress} 
                      className="h-2 bg-gray-800"
                      style={{
                        '--progress-background': 'rgb(34 197 94)', 
                      } as React.CSSProperties}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
