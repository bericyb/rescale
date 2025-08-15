export interface JobStatus {
  id: number;
  status_type: string;
  timestamp: string;
}

export interface Job {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  current_status: {
    status_type: string;
    timestamp: string;
  };
  statuses?: JobStatus[];
}