export const storage = {
  // Store data in localStorage
  set: (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
    }
  },

  // Get data from localStorage
  get: (key: string) => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  },

  // Remove data from localStorage
  remove: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },

  // Clear all app data
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('moodle_credentials')
      localStorage.removeItem('moodle_courses')
      localStorage.removeItem('moodle_assignments')
      localStorage.removeItem('moodle_selected_assignments')
      localStorage.removeItem('moodle_doc_job')
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  CREDENTIALS: 'moodle_credentials',
  COURSES: 'moodle_courses',
  ASSIGNMENTS: 'moodle_assignments',
  SELECTED_ASSIGNMENTS: 'moodle_selected_assignments',
  DOC_JOB: 'moodle_doc_job'
} as const
