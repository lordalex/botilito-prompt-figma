
import type { JobStatusResponse } from '@/utils/humanVerification/types';

// A function that initiates a job and returns a job_id
export type JobSubmissionFunction<T extends any[]> = (...args: T) => Promise<{ job_id: string }>;

// A function that polls for the status of a job
export type JobStatusFunction = (jobId: string) => Promise<JobStatusResponse>;

interface JobManagerOptions {
  pollInterval?: number;
  maxAttempts?: number;
}

/**
 * Manages the lifecycle of an asynchronous job.
 * It submits a job, polls for its status, and returns the final result.
 */
export class JobManager<T extends any[], R> {
  private submissionFunction: JobSubmissionFunction<T>;
  private statusFunction: JobStatusFunction;
  private pollInterval: number;
  private maxAttempts: number;

  constructor(
    submissionFunction: JobSubmissionFunction<T>,
    statusFunction: JobStatusFunction,
    options: JobManagerOptions = {}
  ) {
    this.submissionFunction = submissionFunction;
    this.statusFunction = statusFunction;
    this.pollInterval = options.pollInterval || 5000;
    this.maxAttempts = options.maxAttempts || 20;
  }

  /**
   * Submits the job and starts polling for the result.
   * @param args Arguments for the job submission function.
   * @returns A promise that resolves with the job result.
   */
  public async submit(...args: T): Promise<R> {
    const { job_id } = await this.submissionFunction(...args);

    if (!job_id) {
      throw new Error('No valid job ID received from submission.');
    }

    return this.poll(job_id);
  }

  /**
   * Polls the job status endpoint until the job is completed or fails.
   * @param jobId The ID of the job to poll.
   * @returns A promise that resolves with the job result.
   */
  private async poll(jobId: string): Promise<R> {
    for (let attempts = 0; attempts < this.maxAttempts; attempts++) {
      const data = await this.statusFunction(jobId);

      if (data.status === 'completed') {
        if (data.result) {
          return data.result as R;
        }
        throw new Error('Job completed but returned no result.');
      }

      if (data.status === 'failed') {
        const errorMessage = typeof data.error === 'string' ? data.error : (data.error as any)?.message;
        throw new Error(errorMessage || 'API job failed');
      }

      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }

    throw new Error('API job timed out.');
  }
}
