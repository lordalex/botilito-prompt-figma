export type AdminJobType =
    | 'GET_DASHBOARD_SUMMARY'
    | 'GET_DASHBOARD_MACROS'
    | 'RUN_MAINTENANCE_MACRO'
    | 'CREATE_CHALLENGE'
    | 'UPDATE_USER_ACCESS'
    | 'UPDATE_PERMISSION_MATRIX';

export interface DispatchResponse {
    message: string;
    job_id: string;
    check_status: string;
}

export interface AdminJobResult<T = any> {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    current_step?: string;
    created_at: string;
    completed_at?: string;
    error?: string;
    result?: T;
}

export interface DashboardOverview {
    overview: {
        total_cases: number;
        total_users: number;
        total_documents: number;
        total_votes: number;
        total_interactions: number;
    };
    correlations: {
        description: string;
        top_active_users: Array<{
            user_id: string;
            total_actions: number;
            breakdown: {
                votes: number;
                reports: number;
            };
        }>;
    };
}

export interface DashboardMacros {
    period: string;
    charts: {
        activity_trend: Array<{
            date: string;
            votes: number;
            cases: number;
        }>;
        user_segments: {
            newbie: number;
            expert: number;
            master: number;
        };
    };
}
