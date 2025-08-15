import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { JobDetailsView } from '../../src/components/ui/job-details-view';
import { Button } from '../../src/components/ui/button';
import { getJobDetails, updateJobStatus } from '../../src/lib/api';

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
  statuses?: JobStatus[];
}

export default function JobPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(5);

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status_type }: { jobId: number; status_type: string }) =>
      updateJobStatus({ jobId, status_type }),
    onSuccess: async (updatedJob) => {
      // Update local state with fresh data
      setJob(updatedJob);
      // Invalidate queries to refresh data in other parts of the app
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      // Optionally refresh the full job details to ensure we have latest status history
      try {
        const refreshedJob = await getJobDetails(updatedJob.id);
        setJob(refreshedJob);
      } catch (error) {
        console.error('Error refreshing job details after update:', error);
        // Don't show error to user since the update itself succeeded
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job status';
      toast.error(`Failed to update status: ${errorMessage}`);
    },
  });

  // Fetch job details
  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobData = await getJobDetails(jobId);
        setJob(jobData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load job';
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          setNotFound(true);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Redirect timer for 404
  useEffect(() => {
    if (notFound && redirectTimer > 0) {
      const timer = setTimeout(() => {
        setRedirectTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (notFound && redirectTimer === 0) {
      router.push('/');
    }
  }, [notFound, redirectTimer, router]);

  const handleUpdateStatus = async (jobId: number, newStatus: string) => {
    await updateStatusMutation.mutateAsync({ jobId, status_type: newStatus });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Job... - Job Manager</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>Job Not Found - Job Manager</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-600 mb-4">
              The job with ID #{id} could not be found. It may have been deleted or the ID is incorrect.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to main page in {redirectTimer} second{redirectTimer !== 1 ? 's' : ''}...
            </p>
            <div className="space-x-3">
              <Link href="/">
                <Button>Go Back Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error Loading Job - Job Manager</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Job</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-3">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Link href="/">
                <Button>Go Back</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!job) return null;

  return (
    <>
      <Head>
        <title>{job.name} - Job Manager</title>
        <meta name="description" content={`Details for job ${job.name} (ID: ${job.id})`} />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/">
                  <Button variant="outline" size="sm" className="mr-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Job Details</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <JobDetailsView
              job={job}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updateStatusMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
}