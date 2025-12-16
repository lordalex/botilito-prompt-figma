import { api } from '@/services/api';
import type { Session } from '@supabase/supabase-js';

export type JobType = 'ingestion' | 'voting' | 'search';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: any;
  result?: any;
  error?: string;
  progress: number;
  startTime: number;
  endTime?: number;
  apiJobId?: string;
  retryCount: number;
}

type Listener = (job: Job) => void;

const jobApi = {
  ingestion: {
    submit: api.ingestion.submit,
    getStatus: api.ingestion.getStatus,
  },
  voting: {
    submit: api.voting.submit,
    getStatus: api.voting.getStatus,
  },
  // Assuming a search API exists in the consolidated service
  // search: {
  //   submit: api.search.submit,
  //   getStatus: api.search.getStatus,
  // },
};

class JobManager {
  private jobs: Record<string, Job> = {};
  private listeners: Map<string, Listener[]> = new Map();
  private session: Session | null = null;
  private POLLING_INTERVAL = 3000; // Initial polling interval
  private MAX_POLLING_INTERVAL = 60000; // Max polling interval
  private pollingIntervalId: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.startPolling();
  }

  setSession(session: Session | null) {
    const sessionJustInitialized = !this.session && session;
    this.session = session;
    if (sessionJustInitialized) {
      console.log("[JobManager] Session is now available. Immediately reprocessing pending jobs.");
      this.reprocessPendingJobs();
    }
  }

  on(eventName: string, listener: Listener) { const l = this.listeners.get(eventName) || []; this.listeners.set(eventName, [...l, listener]); }
  off(eventName: string, listener: Listener) { let l = this.listeners.get(eventName) || []; this.listeners.set(eventName, l.filter(cb => cb !== listener)); }
  private emit(eventName: string, data: Job) { (this.listeners.get(eventName) || []).forEach(l => l(data)); }
  private persist() { try { localStorage.setItem('botilito-job-manager', JSON.stringify(this.jobs)); } catch (e) {} }
  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('botilito-job-manager');
      if (saved) {
        this.jobs = JSON.parse(saved);
        Object.values(this.jobs).forEach(job => {
          if (job.status === 'processing') job.status = 'pending';
        });
      }
    } catch (e) {}
  }

  public addJob(type: JobType, payload: any): string {
    const id = crypto.randomUUID();
    const newJob: Job = { id, type, payload, status: 'pending', progress: 0, startTime: Date.now(), retryCount: 0 };
    this.jobs[id] = newJob;
    this.persist();
    this.emit('job:added', newJob);
    this.processJob(id);
    return id;
  }
  
  public getJob(id: string): Job | undefined { return this.jobs[id]; }
  public getAllJobs(): Record<string, Job> { return this.jobs; }

  public clearAllJobs() {
    this.jobs = {};
    try {
      localStorage.removeItem('botilito-job-manager');
    } catch (e) {}
    this.emit('job:cleared', {} as Job); // Emitting a dummy job for the event
  }

  private async processJob(id: string) {
    const job = this.jobs[id];
    if (!job) return;
    if (!this.session) {
      console.warn(`[JobManager] Cannot process job ${id}: no session. Will retry when session is available.`);
      return;
    }
    try {
      this.updateJob(id, { status: 'processing', progress: 10 });
      
      const jobTypeApi = jobApi[job.type];
      if (!jobTypeApi) {
        throw new Error(`Unknown job type: ${job.type}`);
      }

      const response = await jobTypeApi.submit(this.session, job.payload);
      
      if (response?.job_id) {
        this.updateJob(id, { apiJobId: response.job_id, progress: 20 });
      } else {
        this.updateJob(id, { status: 'completed', result: response, progress: 100, endTime: Date.now() });
      }
    } catch (error: any) {
      this.updateJob(id, { status: 'failed', error: error.message });
    }
  }

  private reprocessPendingJobs() {
      const pendingJobs = Object.values(this.jobs).filter(j => j.status === 'pending');
      if (pendingJobs.length > 0) {
          console.log(`[JobManager] Found ${pendingJobs.length} pending jobs to re-process.`);
          for (const job of pendingJobs) {
              this.processJob(job.id);
          }
      }
  }

  private startPolling() { if (this.pollingIntervalId) clearInterval(this.pollingIntervalId); this.pollingIntervalId = setInterval(this.pollJobs.bind(this), this.POLLING_INTERVAL); }
  
  private async pollJobs() {
    if (!this.session) return;
    
    const processingJobs = Object.values(this.jobs).filter(j => j.status === 'processing' && j.apiJobId);
    if (processingJobs.length === 0) return;

    console.log(`[JobManager] Polling ${processingJobs.length} active job(s)...`);
    for (const job of processingJobs) {
      try {
        const jobTypeApi = jobApi[job.type];
        if (!jobTypeApi) {
            this.updateJob(job.id, { status: 'failed', error: `Unknown job type: ${job.type}` });
            continue;
        }

        const result = await jobTypeApi.getStatus(this.session, job.apiJobId!);
        
        if (result?.status === 'completed') {
          this.updateJob(job.id, { status: 'completed', result: result.result, progress: 100, endTime: Date.now() });
        } else if (result?.status === 'failed') {
          this.updateJob(job.id, { status: 'failed', error: result.error?.message || 'Job failed' });
        } else {
          const newRetryCount = job.retryCount + 1;
          const newProgress = Math.min((job.progress || 0) + 15, 90);
          this.updateJob(job.id, { progress: newProgress, retryCount: newRetryCount });
          
          // Exponential backoff
          const newInterval = Math.min(this.POLLING_INTERVAL * Math.pow(2, newRetryCount), this.MAX_POLLING_INTERVAL);
          // This is a simplified backoff. A more robust implementation would have a separate timer for each job.
          // For now, we just log the intended interval.
          console.log(`[JobManager] Job ${job.id} still processing. Next poll in ${newInterval}ms.`);
        }
      } catch (error: any) {
        this.updateJob(job.id, { status: 'failed', error: 'Polling request failed: ' + error.message });
      }
    }
  }

  private updateJob(id: string, updates: Partial<Job>) {
    if (this.jobs[id]) {
      this.jobs[id] = { ...this.jobs[id], ...updates };
      this.persist();
      this.emit('job:updated', this.jobs[id]);
      if(updates.status) this.emit(`job:${updates.status}`, this.jobs[id]);
    }
  }
}
export const jobManager = new JobManager();