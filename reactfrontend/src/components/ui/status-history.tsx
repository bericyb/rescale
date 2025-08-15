import { Clock } from 'lucide-react';
import { Job } from '../../types/job';
import { getStatusColor } from '../../constants/jobStatus';

interface StatusHistoryProps {
  job: Job;
  loading?: boolean;
  className?: string;
}

export function StatusHistory({ job, loading = false, className = '' }: StatusHistoryProps) {
  return (
    <div className={`w-80 border-l border-gray-200 flex flex-col min-h-0 ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-500 mr-2" />
          <h4 className="font-medium text-gray-900">Status History</h4>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading history...</div>
          </div>
        ) : job.statuses && job.statuses.length > 0 ? (
          <div className="space-y-3">
            {job.statuses
              .slice()
              .reverse()
              .map((status, index) => (
                <div key={status.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(status.status_type)}`}>
                      {status.status_type}
                    </span>
                    {index === 0 && (
                      <span className="text-xs text-gray-500 font-medium">Current</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>{new Date(status.timestamp).toLocaleDateString()}</div>
                    <div>{new Date(status.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No status history available</div>
          </div>
        )}
      </div>
    </div>
  );
}