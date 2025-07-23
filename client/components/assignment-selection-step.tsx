"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  BookOpen, 
  Download, 
  Loader2, 
  ExternalLink, 
  Paperclip, 
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from "lucide-react"
import type { AppState, Assignment } from "@/types"
import { useApi } from "@/hooks/use-api"

interface AssignmentSelectionStepProps {
  appState: AppState
  updateState: (updates: Partial<AppState>) => void
}

export function AssignmentSelectionStep({ appState, updateState }: AssignmentSelectionStepProps) {
  const { generateDocuments, getDocumentJobStatus } = useApi()

  // Polling for document generation status
  useEffect(() => {
    if (!appState.docJobId || appState.docProgress >= 100) return

    const interval = setInterval(async () => {
      try {
        const data = await getDocumentJobStatus(appState.docJobId)
        if (data.success) {
          updateState({ docProgress: data.job.progress || 0 })
          if (data.job.status === "completed") {
            updateState({
              docProgress: 100,
              success: "Documents generated successfully!",
              loading: false,
              generatedFiles: data.job.result?.generatedFiles || [],
            })
          }
        }
      } catch (err) {
        console.error("Error checking document job status:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [appState.docJobId, appState.docProgress])

  const handleDocumentGeneration = async () => {
    if (appState.selectedAssignments.length === 0) {
      updateState({ error: "Please select at least one assignment" })
      return
    }

    if (appState.selectedAssignments.length > 5) {
      updateState({ error: "Maximum 5 assignments allowed per request" })
      return
    }

    updateState({ loading: true, error: "", success: "" })

    try {
      const data = await generateDocuments({
        username: appState.credentials.username,
        selectedAssignments: appState.selectedAssignments,
        userDetails: {},
      })

      if (data.success) {
        updateState({
          docJobId: data.jobId,
          success: `Generating documents for ${appState.selectedAssignments.length} assignments...`,
          docProgress: 0,
        })
      } else {
        updateState({ error: data.error || "Failed to start document generation", loading: false })
      }
    } catch (err) {
      updateState({ error: "Network error occurred", loading: false })
    }
  }

  const handleAssignmentSelection = (courseId: string, index: number, assignment: Assignment, checked: boolean) => {
    const assignmentRef = { ...assignment, courseId, index }

    if (checked && appState.selectedAssignments.length < 5) {
      updateState({
        selectedAssignments: [...appState.selectedAssignments, assignmentRef],
      })
    } else if (!checked) {
      updateState({
        selectedAssignments: appState.selectedAssignments.filter(
          (a) => !(a.courseId === courseId && a.index === index),
        ),
      })
    }
  }

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isAssignmentSelected = (courseId: string, index: number) => {
    return appState.selectedAssignments.some((a) => a.courseId === courseId && a.index === index)
  }

  const isAssignmentDisabled = (courseId: string, index: number) => {
    return !isAssignmentSelected(courseId, index) && appState.selectedAssignments.length >= 5
  }

  const getTotalAssignments = () => {
    return Object.values(appState.assignments).reduce((total, course) => total + course.nonSubmittedCount, 0)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Pending Assignments</h2>
              <p className="text-blue-200 text-lg">
                Found {getTotalAssignments()} pending assignments across {Object.keys(appState.assignments).length} courses
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
      {Object.keys(appState.assignments).length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 shadow-2xl backdrop-blur-sm">
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
            {Object.entries(appState.assignments).map(([courseId, courseData]) => (
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
                        ? 'border-blue-500 bg-blue-900/20 shadow-blue-500/10'
                        : isAssignmentDisabled(courseId, index)
                        ? 'border-gray-600 bg-gray-700/20 opacity-50'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={isAssignmentSelected(courseId, index)}
                            onCheckedChange={(checked) => 
                              handleAssignmentSelection(courseId, index, assignment, !!checked)
                            }
                            disabled={isAssignmentDisabled(courseId, index)}
                            className="mt-1 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          
                          <div className="flex-1 min-w-0 space-y-4">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">
                                {assignment.title}
                              </h4>
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="border-gray-500 text-gray-300 text-xs">
                                  {assignment.type}
                                </Badge>
                                <Badge 
                                  variant={assignment.submissionStatus === 'Not submitted' ? 'destructive' : 'secondary'}
                                  className={`text-xs ${assignment.submissionStatus === 'Not submitted' 
                                    ? 'bg-red-600/20 text-red-300 border border-red-500/30' 
                                    : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                                  }`}
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {assignment.submissionStatus}
                                </Badge>
                              </div>
                            </div>

                            {/* Related Files */}
                            {assignment.relatedFiles && assignment.relatedFiles.length > 0 && (
                              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
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
                                      className="h-8 text-xs border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
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
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
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
                
                {Object.entries(appState.assignments).length > 1 && <Separator className="bg-gray-600" />}
              </div>
            ))}

            {/* Selection Summary & Action */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-600 bg-gray-700/30 -mx-6 px-6 py-6 rounded-b-lg">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-gray-500 text-gray-300 px-3 py-1">
                  {appState.selectedAssignments.length}/5 assignments selected
                </Badge>
                <Progress value={(appState.selectedAssignments.length / 5) * 100} className="w-32" />
              </div>
              
              <Button 
                onClick={handleDocumentGeneration}
                disabled={appState.loading || appState.selectedAssignments.length === 0}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 shadow-lg shadow-green-500/25"
              >
                {appState.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
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

      {/* Document Generation Progress */}
      {appState.docJobId && (
        <Card className="bg-blue-900/20 border-blue-600/50 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              {appState.docProgress >= 100 ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {appState.docProgress >= 100 ? "Documents Generated!" : "Generating Documents..."}
                </h3>
                <p className="text-blue-200">
                  Processing {appState.selectedAssignments.length} selected assignments
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-blue-200">
                <span>Progress</span>
                <span>{appState.docProgress}%</span>
              </div>
              <Progress value={appState.docProgress} className="h-3" />
            </div>

            {appState.docProgress >= 100 && (
              <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <div className="flex items-center text-green-300">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Completed</span>
                </div>
                <p className="text-green-400 mt-1">Documents are ready for download</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Documents Download */}
      {appState.generatedFiles && appState.generatedFiles.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Download className="h-6 w-6 mr-2 text-green-400" />
              Download Generated Documents
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              {appState.generatedFiles.length} documents ready for download
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {appState.generatedFiles.map((file: any, index: number) => (
              <Card key={index} className="border border-gray-600 bg-gray-700/30 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                        <FileText className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {file.assignmentTitle}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{file.fileName}</span>
                          <span>{formatFileSize(file.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleDownload(file.downloadUrl, file.fileName)}
                      className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center pt-6">
              <Button
                onClick={() => {
                  appState.generatedFiles?.forEach((file: any) => 
                    handleDownload(file.downloadUrl, file.fileName)
                  )
                }}
                variant="outline"
                size="lg"
                className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download All Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
