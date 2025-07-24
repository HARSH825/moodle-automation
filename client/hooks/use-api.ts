import type { Credentials, Assignment } from "@/types"

const API_BASE = "https://api.moodle.harshdev.cloud"

export function useApi() {
  const login = async (credentials: Credentials) => {
    const response = await fetch(`${API_BASE}/api/v1/loginfetch/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    return response.json()
  }

  const checkAssignments = async (data: { username: string; selectedCourseIds: string[] }) => {
    const response = await fetch(`${API_BASE}/api/v1/checkSub/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  const getSubmissionJobStatus = async (jobId: string) => {
    const response = await fetch(`${API_BASE}/api/v1/checkSub/status/${jobId}`)
    return response.json()
  }

  const getDocumentJobStatus = async (jobId: string) => {
    const response = await fetch(`${API_BASE}/api/v1/genDoc/status/${jobId}`)
    return response.json()
  }

  const getNonSubmittedAssignments = async (username: string) => {
    const response = await fetch(`${API_BASE}/api/v1/checkSub/assignments/${username}`)
    return response.json()
  }

  const generateDocuments = async (data: {
    username: string
    selectedAssignments: Assignment[]
    userDetails: Record<string, any>
  }) => {
    const response = await fetch(`${API_BASE}/api/v1/genDoc/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  return {
    login,
    checkAssignments,
    getSubmissionJobStatus,
    getDocumentJobStatus,
    getNonSubmittedAssignments,
    generateDocuments,
  }
}
