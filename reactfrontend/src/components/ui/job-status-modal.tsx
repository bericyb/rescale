import { useEffect } from 'react';
import { Button } from './button';
import { X } from 'lucide-react';
import { Job } from '../../types/job';
import { useJobDetails } from '../../hooks/useJobDetails';
import { useStatusUpdate } from '../../hooks/useStatusUpdate';
import { JobInfo } from './job-info';
import { StatusSelector } from './status-selector';
import { StatusHistory } from './status-history';
import { ErrorDisplay } from './error-display';

interface JobStatusModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (jobId: number, newStatus: string) => Promise<void>;
  isUpdating?: boolean;
}

export function JobStatusModal({ job, isOpen, onClose, onUpdateStatus, isUpdating = false }: JobStatusModalProps) {
  const { displayJob, loadingDetails } = useJobDetails(job, isOpen);
  const { selectedStatus, setSelectedStatus, apiError, handleSubmit, resetForm, clearError, hasChanges } = useStatusUpdate({
    job,
    onUpdateStatus,
    onSuccess: onClose,
  });

  useEffect(() => {
    if (job && isOpen) {
      clearError();
    }
  }, [job, isOpen, clearError]);

  if (!isOpen || !job) return null;

  const handleClose = () => {
    if (isUpdating) return;
    resetForm();
    onClose();
  };

  if (!displayJob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Job Status
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
            disabled={isUpdating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {/* Status Update Form */}
          <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col">
            {/* API Error Display */}
            <ErrorDisplay error={apiError} />

            {/* Job Info */}
            <JobInfo job={displayJob} showTimestamps={false} />

            {/* Status Selection */}
            <StatusSelector
              selectedStatus={selectedStatus}
              onStatusChange={(status) => {
                setSelectedStatus(status);
                if (apiError) clearError();
              }}
              disabled={isUpdating}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
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
          <StatusHistory job={displayJob} loading={loadingDetails} />
        </div>
      </div>
    </div>
  );
}
