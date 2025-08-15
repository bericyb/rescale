import { useState } from 'react';
import { Button } from './button';
import { X, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (jobName: string) => Promise<void>;
  isCreating?: boolean;
}

const jobSchema = z.object({
  name: z.string().min(1, 'Job name is required').trim(),
});

export function CreateJobModal({ isOpen, onClose, onCreateJob, isCreating = false }: CreateJobModalProps) {
  const [jobName, setJobName] = useState('');
  const [formError, setFormError] = useState('');
  const [apiError, setApiError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setApiError('');

    try {
      const validatedData = jobSchema.parse({ name: jobName });
      await onCreateJob(validatedData.name);

      setJobName('');
      toast.success('Job created successfully!');
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormError(error.issues[0].message);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
        setApiError(errorMessage);
        toast.error(`Failed to create job: ${errorMessage}`);
      }
    }
  };

  const handleClose = () => {
    if (isCreating) return;

    setJobName('');
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
          <h3 className="text-lg font-semibold text-gray-900">
            Create New Job
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
            disabled={isCreating}
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
                <p className="text-sm text-red-700 font-medium">Failed to create job</p>
                <p className="text-sm text-red-600 mt-1">{apiError}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 mb-2">
              Job Name
            </label>
            <input
              type="text"
              id="jobName"
              name="jobName"
              value={jobName}
              onChange={(e) => {
                setJobName(e.target.value);
                if (formError) setFormError('');
                if (apiError) setApiError('');
              }}
              className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors ${formError || apiError ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter job name..."
              disabled={isCreating}
              autoFocus
            />
            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !jobName.trim()}
              className="min-w-[100px]"
            >
              {isCreating ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
