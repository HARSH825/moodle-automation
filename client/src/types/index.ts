export interface Course {
  id: string;
  title: string;
  url: string;
}

export interface Assignment {
  id: string;
  title: string;
  url: string;
  assignmentUrl: string;
  type: string;
  submissionStatus?: string;
  relatedFiles?: Array<{
    fileName: string;
    fileUrl: string;
  }>;
}

export interface CourseAssignments {
  courseTitle: string;
  courseUrl: string;
  nonSubmittedCount: number;
  assignments: Assignment[];
}

export interface JobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  data?: any;
  result?: any;
  failedReason?: string;
  createdAt: string;
}

export interface GeneratedFile {
  assignmentTitle: string;
  fileName: string;
  downloadUrl: string;
  fileSize: number;
}

export interface UserData {
  username: string;
  courses: Course[];
}
