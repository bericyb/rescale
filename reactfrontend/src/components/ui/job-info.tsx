import { Job } from '../../types/job';
import { statusOptions } from '../../constants/jobStatus';

interface JobInfoProps {
  job: Job;
  showTimestamps?: boolean;
  titleClassName?: string;
}

export function JobInfo({ job, showTimestamps = true, titleClassName = '' }: JobInfoProps) {
  const currentStatusOption = statusOptions.find(option => option.value === job.current_status.status_type);

  return (
    <div className="mb-6">
      <h4 className={`font-medium text-gray-900 mb-2 ${titleClassName}`}>{job.name}</h4>
      <div className="text-sm text-gray-600">
        <p>Job ID: #{job.id.toString().padStart(4, '0')}</p>
        <div className="flex items-center mt-1">
          <span>Current Status: </span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${currentStatusOption?.color}`}>
            {currentStatusOption?.label}
          </span>
        </div>
        {showTimestamps && (
          <div className="mt-2 text-xs text-gray-500">
            <div>Created: {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}</div>
            <div>Last Updated: {new Date(job.updated_at).toLocaleDateString()} at {new Date(job.updated_at).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}