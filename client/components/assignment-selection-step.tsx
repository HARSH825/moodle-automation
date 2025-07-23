"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { FileText, BookOpen, Download, Loader2, ExternalLink, Paperclip, CheckCircle } from "lucide-react"
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
              // Store the generated files data
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Assignment Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Pending Assignments</span>
          </CardTitle>
          <CardDescription>
            Found {getTotalAssignments()} pending assignments across {Object.keys(appState.assignments).length} courses.
            Select up to 5 assignments to generate documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(appState.assignments).map(([courseId, courseData]) => (
              <div key={courseId} className="border rounded-lg p-4 bg-card/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">{courseData.courseTitle}</h3>
                      <p className="text-sm text-muted-foreground">Course ID: {courseId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{courseData.nonSubmittedCount} pending</Badge>
                    <Button variant="outline" size="sm" onClick={() => window.open(courseData.courseUrl, "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {courseData.assignments.map((assignment, index) => (
                    <div key={assignment.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={`${courseId}-${index}`}
                          checked={isAssignmentSelected(courseId, index)}
                          onCheckedChange={(checked) =>
                            handleAssignmentSelection(courseId, index, assignment, !!checked)
                          }
                          disabled={isAssignmentDisabled(courseId, index)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`${courseId}-${index}`} className="cursor-pointer">
                            <div className="font-medium leading-tight">{assignment.title}</div>
                          </Label>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {assignment.type}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {assignment.submissionStatus}
                            </Badge>
                          </div>

                          {assignment.relatedFiles && assignment.relatedFiles.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium flex items-center">
                                <Paperclip className="w-4 h-4 mr-1" />
                                Related Files:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {assignment.relatedFiles.map((file, fileIndex) => (
                                  <Button
                                    key={fileIndex}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(file.fileUrl, "_blank")}
                                    className="h-8 text-xs"
                                  >
                                    {file.fileName}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(assignment.assignmentUrl, "_blank")}
                            >
                              View Assignment
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm">
              {appState.selectedAssignments.length}/5 assignments selected
            </Badge>

            <Button
              onClick={handleDocumentGeneration}
              disabled={
                appState.loading || appState.selectedAssignments.length === 0 || appState.selectedAssignments.length > 5
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {appState.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Documents
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Generation Progress */}
      {appState.docJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {appState.docProgress >= 100 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              <span>{appState.docProgress >= 100 ? "Documents Generated!" : "Generating Documents..."}</span>
            </CardTitle>
            <CardDescription>Processing {appState.selectedAssignments.length} selected assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm text-muted-foreground">{appState.docProgress}%</span>
                </div>
                <Progress value={appState.docProgress} className="h-3" />
              </div>

              {appState.docProgress >= 100 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                  <span className="text-sm text-muted-foreground">Documents are ready for download</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Documents Download */}
      {appState.generatedFiles && appState.generatedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-600" />
              <span>Download Generated Documents</span>
            </CardTitle>
            <CardDescription>{appState.generatedFiles.length} documents ready for download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appState.generatedFiles.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                  <div className="flex-1">
                    <h4 className="font-medium">{file.assignmentTitle}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>{file.fileName}</span>
                      <span>{formatFileSize(file.fileSize)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(file.downloadUrl, file.fileName)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  appState.generatedFiles?.forEach((file: any) => handleDownload(file.downloadUrl, file.fileName))
                }}
                variant="outline"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
