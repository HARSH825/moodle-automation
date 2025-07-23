import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const apiService = {
  // Flow 1: Login and fetch courses
  loginAndFetchCourses: async (username: string, password: string) => {
    const response = await api.post('/api/v1/loginfetch', {
      username,
      password,
    });
    return response.data;
  },

  // Flow 2: Assignment checking
  startAssignmentCheck: async (username: string, selectedCourseIds: string[]) => {
    const response = await api.post('/api/v1/checkSub/start', {
      username,
      selectedCourseIds,
    });
    return response.data;
  },

  checkJobStatus: async (jobId: string) => {
    const response = await api.get(`/api/v1/checkSub/status/${jobId}`);
    return response.data;
  },

  getNonSubmittedAssignments: async (username: string) => {
    const response = await api.get(`/api/v1/checkSub/assignments/${username}`);
    return response.data;
  },

  // Flow 3: Document generation
  startDocumentGeneration: async (username: string, selectedAssignments: any[], userDetails: any) => {
    const response = await api.post('/api/v1/genDoc/generate', {
      username,
      selectedAssignments,
      userDetails,
    });
    return response.data;
  },

  checkDocumentJobStatus: async (jobId: string) => {
    const response = await api.get(`/api/v1/genDoc/status/${jobId}`);
    return response.data;
  },
};
