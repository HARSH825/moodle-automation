export interface Credentials {
  username: string
  password: string
}

export interface Course {
  id: string
  name: string
}

export interface RelatedFile {
  fileUrl: string
  fileName: string
}

export interface Assignment {
  id: string
  url: string
  type: string
  title: string
  relatedFiles: RelatedFile[] | null
  assignmentUrl: string
  submissionStatus: string
  courseId?: string
  index?: number
}

export interface CourseAssignments {
  courseUrl: string
  assignments: Assignment[]
  courseTitle: string
  nonSubmittedCount: number
}

export interface AssignmentsResponse {
  success: boolean
  nonSubmittedAssignments: Record<string, CourseAssignments>
  coursesFound: number
}

export interface GeneratedFile {
  assignmentTitle: string
  fileName: string
  downloadUrl: string
  fileSize: number
}

export interface JobResult {
  success: boolean
  generatedFiles: GeneratedFile[]
  totalFiles: number
  expiresAt: string
}

export interface DocumentJob {
  id: string
  status: string
  progress: number
  data: {
    username: string
    selectedAssignments: Assignment[]
    userDetails: Record<string, any>
    timestamp: string
  }
  result?: JobResult
  createdAt: string
}

export interface DocumentJobResponse {
  success: boolean
  job: DocumentJob
}

export interface AppState {
  currentStep: number
  loading: boolean
  error: string
  success: string
  credentials: Credentials
  courses: Course[]
  selectedCourses: string[]
  checkJobId: string
  checkProgress: number
  assignments: Record<string, CourseAssignments>
  selectedAssignments: Assignment[]
  docJobId: string
  docProgress: number
}
