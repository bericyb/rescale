interface JobStatus {
  id: number;
  status_type: string;
  timestamp: string;
}

interface Job {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  current_status: {
    status_type: string;
    timestamp: string;
  };
  statuses: JobStatus[];
}

export function JobCard({ job }: { job: Job }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{job.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.current_status.status_type)}`}>
          {job.current_status.status_type}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p>Created: {new Date(job.created_at).toLocaleString()}</p>
        <p>Updated: {new Date(job.updated_at).toLocaleString()}</p>
        <p>Status Updated: {new Date(job.current_status.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}
