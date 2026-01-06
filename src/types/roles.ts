export interface RoleDefinition {
    name: string;
    level: string;
    description: string;
    permissions?: Record<string, boolean>;
}

export interface RolesConfigResponse {
    roles: Record<string, RoleDefinition>;
}

export interface UpdateRoleRequest {
    email: string;
    new_role: string;
}

export interface SuccessResponse {
    success: boolean;
    message: string;
    details?: any;
}

export interface ErrorResponse {
    error: string;
}
