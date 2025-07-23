"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Download, ArrowLeft } from "lucide-react"

export default function GenerateDocumentsPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams?.get("jobId")
  const username = searchParams?.get("username")

  const [jobData, setJobData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  console.log("Page loaded with:", { jobId, username }) // Debug log

  useEffect(() => {
    console.log("useEffect triggered with jobId:", jobId, "username:", username)

    if (!jobId || !username) {
      console.log("Missing jobId or username")
      setError("Missing job ID or username")
      setLoading(false)
      return
    }

    const fetchJobStatus = async () => {
      try {
        console.log("Fetching job status...")
        const response = await fetch(`http://localhost:4000/api/v1/genDoc/status/${jobId}`)
        console.log("Response status:", response.status)

        const data = await response.json()
        console.log("Job status data:", data)

        if (data.success) {
          setJobData(data)
          setProgress(data.job.progress || 0)

          if (data.job.status === "completed") {
            console.log("Job completed!")
            setLoading(false)
          } else if (data.job.status === "failed") {
            setError("Document generation failed")
            setLoading(false)
          }
        } else {
          setError("Failed to fetch job status")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching job status:", err)
        setError("Network error occurred")
        setLoading(false)
      }
    }

    // Initial fetch
    fetchJobStatus()

    // Set up polling
    const interval = setInterval(() => {
      console.log("Polling... Current status:", jobData?.job?.status)
      if (!jobData || (jobData.job.status !== "completed" && jobData.job.status !== "failed")) {
        fetchJobStatus()
      }
    }, 3000) // Poll every 3 seconds

    return () => {
      console.log("Cleaning up interval")
      clearInterval(interval)
    }
  }, [jobId, username])

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    try {
      console.log("Downloading:", fileName)
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-red-800 font-semibold">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <Button onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Debug Info:</h3>
            <p>Job ID: {jobId}</p>
            <p>Username: {username}</p>
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Document Generation</h1>
          <p className="text-muted-foreground">Job ID: {jobId}</p>
          <p className="text-muted-foreground">Username: {username}</p>
          <Button onClick={() => (window.location.href = "/")} className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 text-green-500" />}
              <span>{loading ? "Generating Documents..." : "Generation Complete!"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {jobData && (
                <div className="text-sm text-muted-foreground">
                  Status: {jobData.job.status} | Progress: {jobData.job.progress}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Documents */}
        {jobData?.job?.result?.generatedFiles && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Documents ({jobData.job.result.totalFiles})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobData.job.result.generatedFiles.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">{file.assignmentTitle}</h4>
                      <p className="text-sm text-muted-foreground">{file.fileName}</p>
                      <p className="text-sm text-muted-foreground">Size: {Math.round(file.fileSize / 1024)} KB</p>
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
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Job ID:</strong> {jobId}
              </p>
              <p>
                <strong>Username:</strong> {username}
              </p>
              <p>
                <strong>Loading:</strong> {loading.toString()}
              </p>
              <p>
                <strong>Progress:</strong> {progress}%
              </p>
              <p>
                <strong>Error:</strong> {error || "None"}
              </p>
              <p>
                <strong>Job Data:</strong>
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(jobData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
