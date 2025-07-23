"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertMessage } from "@/components/alert-message"
import { PageHeader } from "@/components/page-header"
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle,
  Clock,
  Zap,
  RefreshCw
} from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import type { Assignment, GeneratedFile, Credentials } from "@/types"

export default function DocsPage() {
  const router = useRouter()
  const { getDocumentJobStatus } = useApi()
  
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([])
  const [credentials, setCredentials] = useState<Credentials>({ username: "", password: "" })
  const [docJobId, setDocJobId] = useState("")
  const [docProgress, setDocProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState("processing")
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [startTime, setStartTime] = useState<string>("")
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // Load data from localStorage
    const storedAssignments = storage.get(STORAGE_KEYS.SELECTED_ASSIGNMENTS)
    const storedCredentials = storage.get(STORAGE_KEYS.CREDENTIALS)
    const storedJobData = storage.get(STORAGE_KEYS.DOC_JOB)
    
    if (!storedAssignments || !storedCredentials || !storedJobData) {
      router.push('/assignments')
      return
    }
    
    setSelectedAssignments(storedAssignments)
    setCredentials(storedCredentials)
    setDocJobId(storedJobData.jobId)
    setStartTime(storedJobData.startTime)
  }, [router])

  // Timer for elapsed time
  useEffect(() => {
    if (!startTime || jobStatus === "completed") return

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, jobStatus])

  // Polling for document generation status
  useEffect(() => {
    if (!docJobId || jobStatus === "completed") return

    const interval = setInterval(async () => {
      try {
        const data = await getDocumentJobStatus(docJobId)
        if (data.success) {
          setDocProgress(data.job.progress || 0)
          setJobStatus(data.job.status)
          
          if (data.job.status === "completed") {
            setSuccess("Documents generated successfully!")
            setGeneratedFiles(data.job.result?.generatedFiles || [])
            
            // Clean up job data from storage
            storage.remove(STORAGE_KEYS.DOC_JOB)
          } else if (data.job.status === "failed") {
            setError("Document generation failed. Please try again.")
          }
        }
      } catch (err) {
        console.error("Error checking document job status:", err)
        setError("Failed to check job status")
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [docJobId, jobStatus])

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
      setError("Failed to download file")
    }
  }

  const handleDownloadAll = () => {
    generatedFiles.forEach((file: any) => {
      setTimeout(() => handleDownload(file.downloadUrl, file.fileName), 100)
    })
  }

  const handleStartOver = () => {
    storage.remove(STORAGE_KEYS.SELECTED_ASSIGNMENTS)
    storage.remove(STORAGE_KEYS.DOC_JOB)
    router.push('/assignments')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black">
      <PageHeader 
        title="Document Generation" 
        subtitle="Your documents are being processed"
        showBackButton
        backTo="/assignments"
        backLabel="Back to Assignments"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AlertMessage error={error} success={success} />
        
        <div className="mt-8 space-y-8">
          {/* Status Overview */}
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {jobStatus === "completed" ? "Documents Ready!" : "Processing Documents"}
                  </h2>
                  <p className="text-blue-200 text-lg">
                    {jobStatus === "completed" 
                      ? `Successfully generated ${generatedFiles.length} documents`
                      : `Generating documents for ${selectedAssignments.length} assignments`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white">{docProgress}%</div>
                  <div className="text-blue-200">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                {jobStatus === "completed" ? (
                  <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
                ) : (
                  <Zap className="h-6 w-6 mr-2 text-blue-400" />
                )}
                Generation Status
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                {jobStatus === "completed" 
                  ? "All documents have been successfully generated"
                  : "Please wait while we process your assignments"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-gray-300">
                  <span>Progress</span>
                  <span>{docProgress}%</span>
                </div>
                <Progress 
                  value={docProgress} 
                  className="h-4"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{selectedAssignments.length} assignments selected</span>
                  <span>
                    {jobStatus === "completed" 
                      ? `Completed in ${formatTime(elapsedTime)}`
                      : `Elapsed: ${formatTime(elapsedTime)}`
                    }
                  </span>
                </div>
              </div>

              {/* Assignment List */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Selected Assignments
                </h4>
                <div className="grid gap-3">
                  {selectedAssignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-600">
                      <div className="flex items-center space-x-3">
                        {jobStatus === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : docProgress > (index / selectedAssignments.length) * 100 ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">{assignment.title}</p>
                          <p className="text-gray-400 text-sm">{assignment.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          jobStatus === "completed" || docProgress > (index / selectedAssignments.length) * 100
                            ? "default" 
                            : "secondary"
                        }
                        className={
                          jobStatus === "completed" || docProgress > (index / selectedAssignments.length) * 100
                            ? "bg-green-600/20 text-green-300 border border-green-500/30"
                            : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                        }
                      >
                        {jobStatus === "completed" || docProgress > (index / selectedAssignments.length) * 100
                          ? "Completed" 
                          : "Processing"
                        }
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Message */}
              {jobStatus === "completed" ? (
                <div className="p-4 bg-green-950/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center text-green-300">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Generation Complete!</span>
                  </div>
                  <p className="text-green-400 mt-1">All documents are ready for download</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center text-blue-300">
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    <span className="font-semibold">Processing...</span>
                  </div>
                  <p className="text-blue-400 mt-1">
                    {docProgress < 25 ? "Analyzing assignments..." :
                     docProgress < 50 ? "Generating content..." :
                     docProgress < 75 ? "Formatting documents..." :
                     "Finalizing documents..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download Section */}
          {generatedFiles && generatedFiles.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <Download className="h-6 w-6 mr-2 text-green-400" />
                  Download Documents
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  {generatedFiles.length} documents ready for download
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Download All Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadAll}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 shadow-lg shadow-green-500/25"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download All Documents ({generatedFiles.length})
                  </Button>
                </div>

                {/* Individual Files */}
                <div className="space-y-4">
                  {generatedFiles.map((file: any, index: number) => (
                    <Card key={index} className="border border-gray-700 bg-gray-800/30 hover:shadow-lg transition-all">
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
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 pt-6 border-t border-gray-700">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    size="lg"
                    className="px-8 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate More Documents
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    size="lg"
                    className="px-8 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Back to Home
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
