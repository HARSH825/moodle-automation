"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AlertMessage } from "@/components/alert-message"
import { PageHeader } from "@/components/page-header"
import { 
  FileText, 
  BookOpen, 
  Loader2, 
  ExternalLink, 
  Paperclip, 
  AlertCircle,
  ArrowUpRight
} from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import type { Assignment, CourseAssignments, Credentials } from "@/types"

export default function AssignmentsPage() {
  const router = useRouter()
  const { generateDocuments } = useApi()
  
  const [assignments, setAssignments] = useState<Record<string, CourseAssignments>>({})
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([])
  const [credentials, setCredentials] = useState<Credentials>({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Load data from localStorage
    const storedAssignments = storage.get(STORAGE_KEYS.ASSIGNMENTS)
    const storedCredentials = storage.get(STORAGE_KEYS.CREDENTIALS)
    
    if (!storedAssignments || !storedCredentials) {
      router.push('/login')
      return
    }
    
    setAssignments(storedAssignments)
    setCredentials(storedCredentials)
  }, [router])

  const handleDocumentGeneration = async () => {
    if (selectedAssignments.length === 0) {
      setError("Please select at least one assignment")
      return
    }

    if (selectedAssignments.length > 5) {
      setError("Maximum 5 assignments allowed per request")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const data = await generateDocuments({
        username: credentials.username,
        selectedAssignments: selectedAssignments,
        userDetails: {},
      })
      
      if (data.success) {
        // Store the job details and selected assignments for the docs page
        storage.set(STORAGE_KEYS.SELECTED_ASSIGNMENTS, selectedAssignments)
        storage.set(STORAGE_KEYS.DOC_JOB, {
          jobId: data.jobId,
          startTime: new Date().toISOString(),
          totalAssignments: selectedAssignments.length
        })
        
        setSuccess("Document generation started! Redirecting...")
        setTimeout(() => router.push('/docs'), 1500)
      } else {
        setError(data.error || "Failed to start document generation")
        setLoading(false)
      }
    } catch (err) {
      setError("Network error occurred")
      setLoading(false)
    }
  }

  const handleAssignmentSelection = (courseId: string, index: number, assignment: Assignment, checked: boolean) => {
    const assignmentRef = { ...assignment, courseId, index }
    
    if (checked && selectedAssignments.length < 5) {
      setSelectedAssignments([...selectedAssignments, assignmentRef])
    } else if (!checked) {
      setSelectedAssignments(selectedAssignments.filter(
        (a) => !(a.courseId === courseId && a.index === index)
      ))
    }
  }

  const isAssignmentSelected = (courseId: string, index: number) => {
    return selectedAssignments.some((a) => a.courseId === courseId && a.index === index)
  }

  const isAssignmentDisabled = (courseId: string, index: number) => {
    return !isAssignmentSelected(courseId, index) && selectedAssignments.length >= 5
  }

  const getTotalAssignments = () => {
    return Object.values(assignments).reduce((total, course) => total + course.nonSubmittedCount, 0)
  }

  return (
    <div className="min-h-screen bg-black">
      <PageHeader 
        title="Assignment Management" 
        subtitle="Select assignments to generate documents"
        showBackButton
        backTo="/courses"
        backLabel="Back to Courses"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AlertMessage error={error} success={success} />
        
        <div className="mt-8 space-y-8">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Pending Assignments</h2>
                  <p className="text-blue-200 text-lg">
                    Found {getTotalAssignments()} pending assignments across {Object.keys(assignments).length} courses
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white">{getTotalAssignments()}</div>
                  <div className="text-blue-200">Assignments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Selection */}
          {Object.keys(assignments).length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-blue-400" />
                  Select Assignments
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Choose up to 5 assignments to generate documents for
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {Object.entries(assignments).map(([courseId, courseData]) => (
                  <div key={courseId} className="space-y-6">
                    {/* Course Header */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-700/50 to-blue-700/20 rounded-xl border border-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                          <BookOpen className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {courseData.courseTitle}
                          </h3>
                          <p className="text-sm text-gray-400">Course ID: {courseId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border border-orange-500/30 px-3 py-1">
                          {courseData.nonSubmittedCount} pending
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(courseData.courseUrl, "_blank")}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className="grid gap-4 pl-4">
                      {courseData.assignments.map((assignment, index) => (
                        <Card key={index} className={`transition-all duration-200 hover:shadow-lg border-2 ${
                          isAssignmentSelected(courseId, index)
                            ? 'border-blue-500 bg-blue-950/20 shadow-blue-500/10'
                            : isAssignmentDisabled(courseId, index)
                            ? 'border-gray-700 bg-gray-800/20 opacity-50'
                            : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Checkbox
                                checked={isAssignmentSelected(courseId, index)}
                                onCheckedChange={(checked) => 
                                  handleAssignmentSelection(courseId, index, assignment, !!checked)
                                }
                                disabled={isAssignmentDisabled(courseId, index)}
                                className="mt-1 border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              
                              <div className="flex-1 min-w-0 space-y-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-2">
                                    {assignment.title}
                                  </h4>
                                  <div className="flex items-center space-x-3">
                                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                      {assignment.type}
                                    </Badge>
                                    <Badge 
                                      variant={assignment.submissionStatus === 'Not submitted' ? 'destructive' : 'secondary'}
                                      className={`text-xs ${assignment.submissionStatus === 'Not submitted' 
                                        ? 'bg-red-600/20 text-red-300 border border-red-500/30' 
                                        : 'bg-gray-700/20 text-gray-300 border border-gray-600/30'
                                      }`}
                                    >
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {assignment.submissionStatus}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Related Files */}
                                {assignment.relatedFiles && assignment.relatedFiles.length > 0 && (
                                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center text-sm text-gray-300 mb-3">
                                      <Paperclip className="h-4 w-4 mr-2" />
                                      Related Files:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {assignment.relatedFiles.map((file, fileIndex) => (
                                        <Button
                                          key={fileIndex}
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(file.fileUrl, "_blank")}
                                          className="h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                          <FileText className="h-3 w-3 mr-1" />
                                          {file.fileName}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(assignment.assignmentUrl, "_blank")}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/20"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Assignment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {Object.entries(assignments).length > 1 && <Separator className="bg-gray-700" />}
                  </div>
                ))}

                {/* Selection Summary & Action */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-700 bg-gray-800/30 -mx-6 px-6 py-6 rounded-b-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="border-gray-600 text-gray-300 px-3 py-1">
                      {selectedAssignments.length}/5 assignments selected
                    </Badge>
                    <Progress value={(selectedAssignments.length / 5) * 100} className="w-32" />
                  </div>
                  
                  <Button 
                    onClick={handleDocumentGeneration}
                    disabled={loading || selectedAssignments.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 shadow-lg shadow-green-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Generation...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Documents
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
