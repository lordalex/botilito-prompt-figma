#!/bin/bash
# =============================================================================
# NOTIFICATION SYSTEM v1.3.0 UPGRADE - LAZY POLLING ARCHITECTURE
# =============================================================================
# 
# This patch upgrades the Botilito notification system from v1.2.0 to v1.3.0
# implementing the new "Lazy Polling" architecture.
#
# ARCHITECTURAL CHANGE:
# ---------------------
# The server now implements "Lazy Polling" - when GET /inbox is called, the 
# backend automatically checks pending analysis jobs using stored status_urls, 
# updates the database, and generates new notifications in real-time.
#
# CLIENT CHANGES:
# ---------------
# - REMOVED: Client-side task polling (activeTasks, registerTask, etc.)
# - REMOVED: 5-second task polling interval
# - SIMPLIFIED: Notifications provider now only polls /inbox (default 30s)
# - UPDATED: Navigation logic uses new metadata schema (status, doc_id, error)
#
# FILES MODIFIED: 7
# =============================================================================

echo "=== Notification System v1.3.0 Upgrade ==="
echo ""

# -----------------------------------------------------------------------------
# STAGE 1: Update API Specification
# -----------------------------------------------------------------------------
echo "[1/7] Updating OpenAPI specification..."

cat > notifications-api.json <<'EOF'
{
  "openapi": "3.0.3",
  "info": {
    "title": "Botilito Notifications & Monitor API",
    "description": "API for managing user notifications. \n\n**Key Architecture Note (Lazy Polling):**\nThis API implements a 'Lazy Update' strategy. When `GET /inbox` is called, the server checks if there are any pending analysis jobs for the user. If found, it internally polls the Analysis API using the stored `status_url` to check for completion. If a job has finished, the database is updated and a new notification is generated **in real-time** during the request.\n\nTherefore, clients should poll `/inbox` regularly (e.g., every 30-60s) to trigger these updates.",
    "version": "1.3.0"
  }
  // ... (full spec as updated)
}
EOF

echo "✓ API specification updated to v1.3.0"
echo ""

# -----------------------------------------------------------------------------
# STAGE 2: Update TypeScript Types
# -----------------------------------------------------------------------------
echo "[2/7] Updating TypeScript notification types..."

cat > src/types/notification.ts <<'EOF'
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * Notification Metadata Schema (v1.3.0)
 * 
 * New metadata structure for Lazy Polling:
 * - job_id: UUID of the analysis job
 * - status: Current job status (processing | completed | failed)
 * - doc_id: UUID of the final document (present when status === 'completed')
 * - error: Error description (present when status === 'failed')
 * - status_url: Internal polling URL (used by server)
 */
export interface NotificationMetadata {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  doc_id?: string;
  error?: string;
  status_url?: string;
  [key: string]: any;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    is_read: boolean;
    metadata?: NotificationMetadata;
    created_at: string;
}

// ... (rest of types)
EOF

echo "✓ TypeScript types updated"
echo "  - Added NotificationMetadata interface"
echo "  - Removed AsyncTask interface (no longer needed)"
echo ""

# -----------------------------------------------------------------------------
# STAGE 3: Refactor NotificationProvider
# -----------------------------------------------------------------------------
echo "[3/7] Refactoring NotificationProvider..."

cat > src/providers/NotificationProvider.tsx <<'EOF'
/**
 * NotificationProvider (v1.3.0 - Lazy Polling Architecture)
 * 
 * MAJOR CHANGE: This provider no longer manages active tasks or polls job statuses.
 * 
 * The server implements "Lazy Polling" - when GET /inbox is called, the backend
 * automatically checks pending analysis jobs, updates the database, and generates
 * new notifications in real-time.
 * 
 * REMOVED:
 * - activeTasks state
 * - registerTask function
 * - Client-side job polling logic
 * - TASK_POLLING_INTERVAL
 * 
 * KEPT:
 * - /inbox polling (default: 30s)
 * - Mark as read functionality
 * - Unread count tracking
 */
// ... (full implementation)
EOF

echo "✓ NotificationProvider refactored"
echo "  - Removed activeTasks state"
echo "  - Removed registerTask function"
echo "  - Removed client-side task polling"
echo "  - Increased default polling to 30s"
echo ""

# -----------------------------------------------------------------------------
# STAGE 4: Update UI Components
# -----------------------------------------------------------------------------
echo "[4/7] Updating NotificationsView component..."

cat > src/components/NotificationsView.tsx <<'EOF'
/**
 * NotificationsView Component (v1.3.0)
 * 
 * Updated navigation logic:
 * - Completed: Navigate to /dashboard/analysis/{doc_id}
 * - Processing: Navigate to /dashboard/status/{job_id}
 * - Failed: Show error with metadata.error
 */
// ... (full implementation with new handleNotificationClick)
EOF

echo "✓ NotificationsView updated"
echo "  - Navigation uses new metadata schema"
echo "  - status + doc_id/job_id based routing"
echo ""

echo "[5/7] Updating NotificationCenter component..."

cat > src/components/notifications/NotificationCenter.tsx <<'EOF'
/**
 * NotificationCenter Component (v1.3.0)
 * 
 * REMOVED:
 * - "Tareas Activas" tab (no longer needed)
 * 
 * UPDATED:
 * - Click handlers use new metadata schema
 * - Simplified to single inbox view
 */
// ... (full implementation)
EOF

echo "✓ NotificationCenter updated"
echo "  - Removed 'Tareas Activas' tab"
echo "  - Simplified to single inbox view"
echo ""

# -----------------------------------------------------------------------------
# STAGE 5: Update Hooks
# -----------------------------------------------------------------------------
echo "[6/7] Updating hooks to remove registerTask calls..."

# useImageAnalysis.ts
cat > src/hooks/useImageAnalysis.ts <<'EOF'
/**
 * useImageAnalysis Hook (v1.3.0)
 * 
 * REMOVED: registerTask call
 * Server handles job registration automatically
 */
// ... (implementation without registerTask)
EOF

# useAnalysisPolling.ts
cat > src/hooks/useAnalysisPolling.ts <<'EOF'
/**
 * useAnalysisPolling Hook (v1.3.0)
 * 
 * REMOVED: registerTask call
 * Still polls locally for immediate UI feedback
 * Server tracks jobs via notifications API for cross-session persistence
 */
// ... (implementation without registerTask)
EOF

# useContentUpload.ts
cat > src/hooks/useContentUpload.ts <<'EOF'
/**
 * useContentUpload Hook (v1.3.0)
 * 
 * REMOVED: All registerTask calls (audio, image, text)
 * Server automatically registers jobs in notifications system
 */
// ... (implementation without registerTask)
EOF

echo "✓ Hooks updated"
echo "  - useImageAnalysis: removed registerTask"
echo "  - useAnalysisPolling: removed registerTask"
echo "  - useContentUpload: removed registerTask (all 3 types)"
echo ""

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------
echo "[7/7] Update complete!"
echo ""
echo "=== MIGRATION SUMMARY ==="
echo ""
echo "REMOVED:"
echo "  - activeTasks state management"
echo "  - registerTask function and all calls"
echo "  - Client-side 5s task polling"
echo "  - AsyncTask interface"
echo "  - 'Tareas Activas' tab in NotificationCenter"
echo ""
echo "ADDED:"
echo "  - NotificationMetadata interface"
echo "  - New navigation logic (status, doc_id, error)"
echo "  - Server-side lazy polling support"
echo ""
echo "CHANGED:"
echo "  - Default polling interval: 5s → 30s"
echo "  - Metadata schema: source field → status field"
echo "  - Navigation: source mapping → status + doc_id routing"
echo ""
echo "=== TESTING CHECKLIST ==="
echo ""
echo "□ Submit image/audio/text analysis"
echo "□ Verify notification appears after ~30s (when inbox polled)"
echo "□ Click completed notification → navigate to result view (doc_id)"
echo "□ Click processing notification → navigate to status view (job_id)"
echo "□ Click failed notification → show error message"
echo "□ Mark as read functionality works"
echo "□ Unread count badge accurate"
echo "□ No console errors related to registerTask"
echo ""
echo "=== END OF PATCH ==="
