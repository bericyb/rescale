import { useState, useEffect } from 'react';
import { Button } from './button';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface Job {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  current_status: {
    status_type: string;
    timestamp: string;
  };
}

interface DeleteJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteJob: (jobId: number) => Promise<void>;
  isDeleting?: boolean;
}

const deleteSchema = z.object({
  confirmName: z.string().min(1, 'Job name is required'),
});

export function DeleteJobModal({ job, isOpen, onClose, onDeleteJob, isDeleting = false }: DeleteJobModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [formError, setFormError] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
      setFormError('');
      setApiError('');
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const isNameMatch = confirmName === job.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setApiError('');

    try {
      const validatedData = deleteSchema.parse({ confirmName });

      if (validatedData.confirmName !== job.name) {
        setFormError('Job name does not match');
        return;
      }

      await onDeleteJob(job.id);
      toast.success('Job deleted successfully!');
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormError(error.issues[0].message);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete job';
        setApiError(errorMessage);
        toast.error(`Failed to delete job: ${errorMessage}`);
      }
    }
  };

  const handleClose = () => {
    if (isDeleting) return;

    setConfirmName('');
    setFormError('');
    setApiError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Job
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* API Error Display */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700 font-medium">Failed to delete job</p>
                <p className="text-sm text-red-600 mt-1">{apiError}</p>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    This action cannot be undone
                  </h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete the job and all associated data.
                  </p>
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Job to be deleted:</h4>
              <div className="bg-gray-50 rounded-md p-3 border">
                <p className="font-semibold text-gray-900">{job.name}</p>
                <p className="text-sm text-gray-600">ID: #{job.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label htmlFor="confirmName" className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-semibold text-red-600">{job.name}</span> to confirm deletion
            </label>
            <input
              type="text"
              id="confirmName"
              name="confirmName"
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value);
                if (formError) setFormError('');
                if (apiError) setApiError('');
              }}
              className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 w-full transition-colors ${formError || apiError ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder={`Type "${job.name}" to confirm`}
              disabled={isDeleting}
              autoComplete="off"
            />
            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting || !isNameMatch}
              className="min-w-[100px]"
            >
              {isDeleting ? 'Deleting...' : 'Delete Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
