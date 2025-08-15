import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Job } from '../types/job';

interface UseStatusUpdateProps {
  job: Job | null;
  onUpdateStatus: (jobId: number, newStatus: string) => Promise<void>;
  onSuccess?: () => void;
}

export function useStatusUpdate({ job, onUpdateStatus, onSuccess }: UseStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState(job?.current_status.status_type || 'PENDING');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (job) {
      setSelectedStatus(job.current_status.status_type);
    }
  }, [job]);

  const resetForm = () => {
    if (job) {
      setSelectedStatus(job.current_status.status_type);
    }
    setApiError('');
  };

  const clearError = () => {
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!job || selectedStatus === job.current_status.status_type) {
      onSuccess?.();
      return;
    }

    try {
      await onUpdateStatus(job.id, selectedStatus);
      toast.success('Job status updated successfully!');
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job status';
      setApiError(errorMessage);
      toast.error(`Failed to update status: ${errorMessage}`);
    }
  };

  return {
    selectedStatus,
    setSelectedStatus,
    apiError,
    handleSubmit,
    resetForm,
    clearError,
    hasChanges: job ? selectedStatus !== job.current_status.status_type : false
  };
}