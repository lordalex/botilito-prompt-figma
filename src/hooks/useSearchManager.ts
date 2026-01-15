
import { useState, useCallback, useEffect } from 'react';

import { supabase } from '@/utils/supabase/client';

import { jobManager, Job } from '@/lib/JobManager';

import type { CaseEnriched, VerificationSummaryResult } from '@/utils/humanVerification/types';

import { transformStandardizedToEnriched } from '@/utils/humanVerification/api';

import { useToast } from '@/hooks/use-toast';





interface UseSearchManagerProps<T extends any[]> {

  initialArgs: T;

}



export function useSearchManager<T extends any[]>({



  initialArgs,



}: UseSearchManagerProps<T>) {



  const [cases, setCases] = useState<CaseEnriched[]>([]);



  const [isLoading, setIsLoading] = useState(false);



  const [error, setError] = useState<string | null>(null);



  const [args, setArgs] = useState(initialArgs);



  const [totalPages, setTotalPages] = useState(0);



  const [totalItems, setTotalItems] = useState(0);



  const [currentJobId, setCurrentJobId] = useState<string | null>(null);



  const { toast } = useToast();







  const page = args[0] as number;

  const pageSize = args[1] as number;



  useEffect(() => {

    const handleJobCompleted = (job: Job) => {

      if (job.id === currentJobId && job.type === 'search') {

        if (job.result) {

          const result = job.result as VerificationSummaryResult;

          const enrichedCases = result.cases.map(transformStandardizedToEnriched);

          setCases(enrichedCases);



          if (result.pagination) {

            setTotalItems(result.pagination.totalItems);

            setTotalPages(result.pagination.totalPages);

          }

        } else {

          setCases([]);

          setTotalItems(0);

          setTotalPages(0);

        }

        setIsLoading(false);

        setCurrentJobId(null);

      }

    };



    const handleJobFailed = (job: Job) => {

      if (job.id === currentJobId && job.type === 'search') {

        const errorMessage = job.error || 'An unknown error occurred.';

        setError(errorMessage);

        toast({

          title: 'Error en la Búsqueda',

          description: errorMessage,

          variant: 'destructive',

        });

        setIsLoading(false);

        setCurrentJobId(null);

      }

    };



    const handleJobAdded = (job: Job) => {

      if (job.type === 'search') {

        const [page, pageSize, filters] = args;

        if (job.payload.page === page && job.payload.pageSize === pageSize && JSON.stringify(job.payload.filters) === JSON.stringify(filters)) {

          setCurrentJobId(job.id);

        }

      }

    };



    jobManager.on('job:completed', handleJobCompleted);

    jobManager.on('job:failed', handleJobFailed);

    jobManager.on('job:added', handleJobAdded);



    return () => {

      jobManager.off('job:completed', handleJobCompleted);

      jobManager.off('job:failed', handleJobFailed);

      jobManager.off('job:added', handleJobAdded);

    };

  }, [currentJobId, toast, args]);



  const loadCases = useCallback(async (loadArgs: T) => {

    setIsLoading(true);

    setError(null);

    try {

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) throw new Error("No session");



      const [page, pageSize, filters] = loadArgs;

      jobManager.addJob('search', { page, pageSize, filters });



    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';

      setError(errorMessage);

      toast({

        title: 'Error al Cargar Casos',

        description: errorMessage,

        variant: 'destructive',

      });

      setIsLoading(false);

    }

  }, [toast]);



    const goToPage = (newPage: number) => {



      if (newPage > 0 && newPage <= (totalPages || newPage)) {



        const newArgs = [...args];



        newArgs[0] = newPage;



        setArgs(newArgs as T);



      }



    };



  



    const refresh = () => {



      loadCases(args);



    };



  



    return {



      cases,



      isLoading,



      error,



      page,



      pageSize,



      totalPages,



      totalItems,



      setPage: (p: number) => goToPage(p),



      setPageSize: (ps: number) => {



          const newArgs = [...args];



          newArgs[0] = 1; // reset to page 1



          newArgs[1] = ps;



          setArgs(newArgs as T);



      },



      goToPage,



      refresh,



    };



  }



  
