import Axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const apiClient = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Helper function to extract error messages
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data && typeof error.response.data === 'string') {
    return error.response.data;
  }
  if (error.message) {
    return error.message;
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout - please try again';
  }
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return 'Network error - please check your connection';
  }
  
  // HTTP status code based messages
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status === 500) {
    return 'Server error - please try again later';
  }
  if (error.response?.status === 400) {
    return 'Invalid request data';
  }
  if (error.response?.status === 403) {
    return 'Access denied';
  }
  
  return 'An unexpected error occurred';
};

export const fetchData = async (endpoint: string) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error fetching data:', error);
    throw new Error(message);
  }
};

export const getJobs = async ({ pageParam }: { pageParam?: string }) => {
  try {
    const url = pageParam ? pageParam.replace(API_BASE_URL, '') : '/jobs/';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error fetching jobs:', error);
    throw new Error(message);
  }
};

export const createJob = async (jobData: { name: string }) => {
  try {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error creating job:', error);
    throw new Error(message);
  }
};

export const updateJobStatus = async ({ jobId, status_type }: { jobId: number; status_type: string }) => {
  try {
    const response = await apiClient.patch(`/jobs/${jobId}/`, { status_type });
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error updating job status:', error);
    throw new Error(message);
  }
};

export const deleteJob = async (jobId: number) => {
  try {
    const response = await apiClient.delete(`/jobs/${jobId}/`);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error deleting job:', error);
    throw new Error(message);
  }
};

export const getJobDetails = async (jobId: number) => {
  try {
    const response = await apiClient.get(`/jobs/${jobId}/`);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error fetching job details:', error);
    throw new Error(message);
  }
};

