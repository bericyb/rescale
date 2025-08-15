import { useEffect } from 'react';
import { Button } from './button';
import { Job } from '../../types/job';
import { useJobDetails } from '../../hooks/useJobDetails';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { JobInfo } from './job-info';
import { StatusSelector } from './status-selector';
import { StatusHistory } from './status-history';
import { ErrorDisplay } from './error-display';

interface JobDetailsViewProps {
  job: Job | null;
  onUpdateStatus: (jobId: number, newStatus: string) => Promise<void>;
  isUpdating?: boolean;
  className?: string;
}

export function JobDetailsView({ job, onUpdateStatus, isUpdating = false, className = '' }: JobDetailsViewProps) {
  const { displayJob, loadingDetails } = useJobDetails(job);
  const { selectedStatus, setSelectedStatus, apiError, handleSubmit, clearError, hasChanges } = useStatusUpdate({
    job,
    onUpdateStatus,
  });

  useEffect(() => {
    if (job) {
      clearError();
    }
  }, [job, clearError]);

  if (!job || !displayJob) return null;

  return (
    <div className={`flex h-[calc(100vh-200px)] ${className}`}>
      {/* Status Update Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {/* API Error Display */}
          <ErrorDisplay error={apiError} />

          {/* Job Info */}
          <JobInfo job={displayJob} titleClassName="text-xl" />

          {/* Status Selection */}
          <StatusSelector
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status);
              if (apiError) clearError();
            }}
            disabled={isUpdating}
            label="Update Status"
          />
        </div>

        {/* Update Button */}
        <div className="border-t border-gray-100 pt-4 mt-4 flex-shrink-0">
          <Button
            type="submit"
            disabled={isUpdating || !hasChanges}
            className="min-w-[120px]"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </form>

      {/* Status History */}
      <StatusHistory job={displayJob} loading={loadingDetails} className="ml-8" />
    </div>
  );
}
