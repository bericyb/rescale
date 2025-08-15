import { useState, useEffect } from 'react';
import { getJobDetails } from '../lib/api';
import { Job } from '../types/job';

export function useJobDetails(job: Job | null, shouldLoad: boolean = true) {
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (job && shouldLoad) {
      const loadJobDetails = async () => {
        setLoadingDetails(true);
        try {
          const details = await getJobDetails(job.id);
          setJobDetails(details);
        } catch (error) {
          console.error('Error loading job details:', error);
          setJobDetails(job);
        } finally {
          setLoadingDetails(false);
        }
      };

      loadJobDetails();
    }
  }, [job, shouldLoad]);

  const displayJob = jobDetails || job;

  return { jobDetails, loadingDetails, displayJob };
}