"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  RefreshCw,
  User,
  Hash
} from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { storage, STORAGE_KEYS } from "@/lib/storage"
import type { Assignment, GeneratedFile, Credentials } from "@/types"

export default function DocsPage() {
  const router = useRouter()
  const { generateDocuments, getDocumentJobStatus } = useApi()
  
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([])
  const [credentials, setCredentials] = useState<Credentials>({ username: "", password: "" })
  const [userDetails, setUserDetails] = useState({ name: "", rollNo: "" })
  const [docJobId, setDocJobId] = useState("")
  const [docProgress, setDocProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState("processing")
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [startTime, setStartTime] = useState<string>("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showUserDetails, setShowUserDetails] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // load data from localStorage
    const storedAssignments = storage.get(STORAGE_KEYS.SELECTED_ASSIGNMENTS)
    const storedCredentials = storage.get(STORAGE_KEYS.CREDENTIALS)
    const storedJobData = storage.get(STORAGE_KEYS.DOC_JOB)
    
    if (!storedAssignments || !storedCredentials) {
      router.push('/assignments')
      return
    }
    
    setSelectedAssignments(storedAssignments)
    setCredentials(storedCredentials)
    
    if (storedJobData) {
      setDocJobId(storedJobData.jobId)
      setStartTime(storedJobData.startTime)
      setShowUserDetails(false)
      setIsGenerating(true)
    }
  }, [router])

  useEffect(() => {
    if (!startTime || jobStatus === "completed") return

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, jobStatus])

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

  const handleStartGeneration = async () => {
    setError("")
    setSuccess("")
    setIsGenerating(true)
    setShowUserDetails(false)
    
    try {
      const data = await generateDocuments({
        username: credentials.username,
        selectedAssignments: selectedAssignments,
        userDetails: userDetails,
      })
      
      if (data.success) {
        setDocJobId(data.jobId)
        setStartTime(new Date().toISOString())
        setDocProgress(0)
        setJobStatus("processing")
        
        storage.set(STORAGE_KEYS.DOC_JOB, {
          jobId: data.jobId,
          startTime: new Date().toISOString(),
          totalAssignments: selectedAssignments.length
        })
      } else {
        setError(data.error || "Failed to start document generation")
        setIsGenerating(false)
        setShowUserDetails(true)
      }
    } catch (err) {
      setError("Network error occurred")
      setIsGenerating(false)
      setShowUserDetails(true)
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
        subtitle="Generate and download your documents"
        showBackButton
        backTo="/assignments"
        backLabel="Back to Assignments"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <AlertMessage error={error} success={success} />
        
        <div className="mt-6 space-y-6">
          {/* User Details Form */}
          {showUserDetails && (
            <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-400" />
                  User Details (Optional)
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Provide your details to personalize the generated documents
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 text-sm">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                        className="pl-9 h-9 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rollNo" className="text-gray-300 text-sm">
                      Roll Number
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input
                        id="rollNo"
                        type="text"
                        placeholder="Enter your roll number"
                        value={userDetails.rollNo}
                        onChange={(e) => setUserDetails({ ...userDetails, rollNo: e.target.value })}
                        className="pl-9 h-9 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleStartGeneration}
                    size="sm"
                    className=" cursor-pointer bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 shadow-lg shadow-green-500/25 text-sm"
                  >
                    <Zap className="mr-2 h-3 w-3" />
                    Start Document Generation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Overview */}
          {isGenerating && (
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {jobStatus === "completed" ? "Documents Ready!" : "Processing Documents"}
                    </h2>
                    <p className="text-blue-200 text-sm">
                      {jobStatus === "completed" 
                        ? `Successfully generated ${generatedFiles.length} documents`
                        : `Generating documents for ${selectedAssignments.length} assignments`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{docProgress}%</div>
                    <div className="text-blue-200 text-xs">Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          {isGenerating && (
            <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  {jobStatus === "completed" ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  ) : (
                    <Zap className="h-5 w-5 mr-2 text-blue-400" />
                  )}
                  Generation Status
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {jobStatus === "completed" 
                    ? "All documents have been successfully generated"
                    : "Please wait while we process your assignments"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-300">
                    <span>Progress</span>
                    <span>{docProgress}%</span>
                  </div>
                  <Progress 
                    value={docProgress} 
                    className="h-3 bg-gray-800"
                    style={{
                      '--progress-background': 'rgb(34 197 94)', // Green color
                    } as React.CSSProperties}
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
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Selected Assignments
                  </h4>
                  <div className="grid gap-2">
                    {selectedAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded border border-gray-600">
                        <div className="flex items-center space-x-2">
                          {jobStatus === "completed" ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : docProgress > (index / selectedAssignments.length) * 100 ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Clock className="h-3 w-3 text-gray-400" />
                          )}
                          <div>
                            <p className="text-white font-medium text-sm">{assignment.title}</p>
                            <p className="text-gray-400 text-xs">{assignment.type}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            jobStatus === "completed" || docProgress > (index / selectedAssignments.length) * 100
                              ? "default" 
                              : "secondary"
                          }
                          className={`text-xs px-2 py-0 ${
                            jobStatus === "completed" || docProgress > (index / selectedAssignments.length) * 100
                              ? "bg-green-600/20 text-green-300 border border-green-500/30"
                              : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                          }`}
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
                  <div className="p-3 bg-green-950/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center text-green-300">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="font-semibold text-sm">Generation Complete!</span>
                    </div>
                    <p className="text-green-400 mt-1 text-xs">All documents are ready for download</p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center text-blue-300">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span className="font-semibold text-sm">Processing...</span>
                    </div>
                    <p className="text-blue-400 mt-1 text-xs">
                      {docProgress < 25 ? "Analyzing assignments..." :
                       docProgress < 50 ? "Generating content..." :
                       docProgress < 75 ? "Formatting documents..." :
                       "Finalizing documents..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Download Section */}
          {generatedFiles && generatedFiles.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <Download className="h-5 w-5 mr-2 text-green-400" />
                  Download Documents
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {generatedFiles.length} documents ready for download
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Download All Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadAll}
                    size="sm"
                    className=" cursor-pointer *:bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 shadow-lg shadow-green-500/25 text-sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All Documents ({generatedFiles.length})
                  </Button>
                </div>

                {/* Individual Files */}
                <div className="space-y-3">
                  {generatedFiles.map((file: any, index: number) => (
                    <Card key={index} className="border border-gray-700 bg-gray-800/30 hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-600/20 rounded-lg border border-green-500/30">
                              <FileText className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-1 text-sm">
                                {file.assignmentTitle}
                              </h4>
                              <div className="flex items-center space-x-3 text-xs text-gray-400">
                                <span>{file.fileName}</span>
                                <span>{formatFileSize(file.fileSize)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleDownload(file.downloadUrl, file.fileName)}
                            size="sm"
                            className="bg-green-600 cursor-pointer hover:bg-green-700 shadow-lg shadow-green-500/25 text-xs px-3"
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    size="sm"
                    className=" cursor-pointer bg-gray-800 px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Generate More Documents
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    size="sm"
                    className=" cursor-pointer bg-gray-800 px-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
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
