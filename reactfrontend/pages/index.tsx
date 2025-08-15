import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getJobs, createJob, updateJobStatus, deleteJob } from '@/lib/api';
import { JobTable } from '@/components/ui/job-table';
import { JobStatusModal } from '@/components/ui/job-status-modal';
import { CreateJobModal } from '@/components/ui/create-job-modal';
import { DeleteJobModal } from '@/components/ui/delete-job-modal';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    initialPageParam: undefined,
    retry: 1, // Only retry once to avoid overwhelming the server
  });

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      const previousData = queryClient.getQueryData(['jobs']);

      const optimisticJob = {
        id: Date.now(),
        name: newJob.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_status: {
          status_type: 'PENDING',
          timestamp: new Date().toISOString(),
        },
      };

      queryClient.setQueryData(['jobs'], (old: any) => {
        if (!old) return { pages: [{ results: [optimisticJob], next: null }], pageParams: [undefined] };

        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          results: [optimisticJob, ...newPages[0].results],
        };

        return {
          ...old,
          pages: newPages,
        };
      });

      return { previousData };
    },
    onError: (err, newJob, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['jobs'], context.previousData);
      }
      // Don't show toast here - let the modal handle it
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateJobStatus,
    onMutate: async ({ jobId, status_type }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      const previousData = queryClient.getQueryData(['jobs']);

      queryClient.setQueryData(['jobs'], (old: any) => {
        if (!old) return old;

        const newPages = old.pages.map((page: any) => ({
          ...page,
          results: page.results.map((job: any) =>
            job.id === jobId
              ? {
                ...job,
                current_status: {
                  status_type,
                  timestamp: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
              }
              : job
          ),
        }));

        return {
          ...old,
          pages: newPages,
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['jobs'], context.previousData);
      }
      // Don't show toast here - let the modal handle it
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      const previousData = queryClient.getQueryData(['jobs']);

      queryClient.setQueryData(['jobs'], (old: any) => {
        if (!old) return old;

        const newPages = old.pages.map((page: any) => ({
          ...page,
          results: page.results.filter((job: any) => job.id !== jobId),
        }));

        return {
          ...old,
          pages: newPages,
        };
      });

      return { previousData };
    },
    onError: (err, jobId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['jobs'], context.previousData);
      }
      // Don't show toast here - let the modal handle it
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const jobs = useMemo(() => {
    return data?.pages.flatMap(page => page.results) || [];
  }, [data]);

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setIsStatusModalOpen(true);
  };

  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false);
    setSelectedJob(null);
  };

  const handleCreateJobClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateJob = async (jobName: string) => {
    try {
      await createJobMutation.mutateAsync({ name: jobName });
    } catch (error) {
      throw error;
    }
  };

  const handleStatusUpdate = async (jobId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ jobId, status_type: newStatus });
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteJobClick = (job: any) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
    } catch (error) {
      throw error;
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const handleFetchNextPage = async () => {
    try {
      await fetchNextPage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more jobs';
      toast.error(`Failed to load more jobs: ${errorMessage}`);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 bg-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Rescale Job Dashboard
        </h2>
        <Button onClick={handleCreateJobClick}>
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>


      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-gray-600">Loading jobs...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Jobs</h3>
                <p className="text-red-600 mb-4">
                  {error instanceof Error ? error.message : 'An unexpected error occurred while loading jobs'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleRetry}
              disabled={isRefetching}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>{isRefetching ? 'Retrying...' : 'Try Again'}</span>
            </Button>
          </div>
        )}

        {!isLoading && !error && jobs.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No jobs found. Create your first job above!
          </div>
        )}

        {jobs.length > 0 && (
          <JobTable
            jobs={jobs}
            onFetchNextPage={handleFetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onJobClick={handleJobClick}
            onDeleteJob={handleDeleteJobClick}
          />
        )}
      </div>

      <JobStatusModal
        job={selectedJob}
        isOpen={isStatusModalOpen}
        onClose={handleStatusModalClose}
        onUpdateStatus={handleStatusUpdate}
        isUpdating={updateStatusMutation.isPending}
      />

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onCreateJob={handleCreateJob}
        isCreating={createJobMutation.isPending}
      />

      <DeleteJobModal
        job={jobToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onDeleteJob={handleDeleteJob}
        isDeleting={deleteJobMutation.isPending}
      />
    </div >
  );
}
