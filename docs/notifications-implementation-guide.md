# Notifications System - Implementation Guide (v2.0.0)

## Concept: "Notification-Driven State Management"

The Frontend doesn't need to track `AnalysisJob` objects manually. Instead, it relies on the **Notification Inbox as the "State Manager"** for async tasks.

---

## A. Architectural Behavior: Active Sync on Fetch

Unlike standard CRUD APIs, the `GET /inbox` endpoint has a **side effect**:

1. When called, it first looks up any of the user's jobs in the `analysis_jobs` table that are still `processing`
2. It polls the Analysis Engine using the stored `status_url`
3. If a job status has changed (e.g., to `completed`), it **inserts a new notification** and updates the job record
4. Finally, it returns the fresh inbox list

**This eliminates the need for:**
- Background cron jobs
- Complex frontend polling logic for every analysis item
- Client-side task management state

---

## B. Frontend Polling Loop

You should have a single global component (e.g., `<NotificationProvider />`) that polls the inbox.

### Recommended Polling Intervals

| Environment | Interval | Notes |
|-------------|----------|-------|
| **Desktop** | 30 seconds | Balance between freshness and server load |
| **Mobile** | 60 seconds | Conserve battery and data |
| **User Action** | On-demand | Pull-to-refresh, page focus, etc. |

### Implementation Example

```typescript
const fetchInbox = async () => {
  // Calling this endpoint automatically syncs job statuses in the background
  const res = await api.get('/functions/v1/notifications/inbox');
  setUnreadCount(res.unread_count);
  setNotifications(res.notifications);
};

// Poll every 30s
useEffect(() => {
  fetchInbox();
  const interval = setInterval(fetchInbox, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## C. Handling Notification Clicks (Routing)

When a user clicks a notification item, inspect the `metadata` object to decide where to navigate.

### Routing Table

| Notification Type | Status in Metadata | Where to Navigate? |
|-------------------|-------------------|-------------------|
| **Success** | `completed` | Result Page: `/analysis/{metadata.doc_id}` |
| **Info** | `processing` | Status Page: `/status/{metadata.job_id}` |
| **Error** | `failed` | Error/Retry View: Show Toast with `metadata.error` |
| **System** | N/A | General: Just show the message or specific link if provided |

### Implementation Example

```typescript
const handleNotificationClick = (notification: Notification) => {
  const { metadata } = notification;
  if (!metadata?.job_id) return;

  switch (metadata.status) {
    case 'completed':
      if (metadata.doc_id) {
        navigate(`/analysis/${metadata.doc_id}`);
      }
      break;
    
    case 'processing':
      navigate(`/status/${metadata.job_id}`);
      break;
    
    case 'failed':
      showErrorModal(metadata.error || 'Unknown error occurred');
      break;
  }
  
  // Mark as read
  markAsRead(notification.id);
};
```

---

## D. Lifecycle of a Job via Notifications

### Example Flow

1. **Start**: User submits URL for analysis
   - Backend creates `Notification A`: "Análisis Iniciado" (`processing`)

2. **Wait**: User browses other pages
   - Frontend polls `/inbox` every 30s

3. **Sync**:
   - **Poll #1**: Job still running. Backend updates nothing.
   - **Poll #2**: Job finished! Backend inserts `Notification B`: "Análisis Finalizado" (`success`)

4. **Alert**: Frontend receives `Notification B` in the response
   - `unread_count` increments
   - Bell icon lights up

5. **Action**: User clicks `Notification B`
   - Frontend reads `metadata.doc_id` and navigates to the result

---

## E. Idempotency & Multiple Notifications

### Why multiple notifications for one job?

This system is designed to provide a **history log**.

- You will see one row for **"Started"** (`processing`)
- You will see a separate, new row for **"Finished"** (`completed` or `failed`)

**This is intentional**. It allows the user to see the timeline:
- "I started this at 10:00"
- "It finished at 10:05"

### How the backend prevents spam

The backend logic checks:
```javascript
if (!existingNotif) {
  // Insert new notification
}
```

This ensures it doesn't create duplicate "Finished" notifications for the same job every time the inbox is polled.

---

## F. API Endpoints

### 1. GET /inbox
**Sync & Fetch Inbox**

Retrieves notifications and triggers active sync with Analysis Engine.

**Parameters:**
- `limit` (number, default: 20) - Max notifications to return
- `unread` (boolean) - Filter only unread items
- `type` (string) - Filter by type: `info`, `success`, `error`

**Response:**
```json
{
  "unread_count": 2,
  "notifications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Análisis Finalizado",
      "message": "El reporte AMI #123 está listo para revisión.",
      "type": "success",
      "is_read": false,
      "created_at": "2026-01-06T22:00:00Z",
      "metadata": {
        "job_id": "job-uuid",
        "status": "completed",
        "doc_id": "doc-uuid"
      }
    }
  ]
}
```

### 2. PATCH /read
**Mark as Read**

Updates `is_read` status for notifications.

**Request Body:**
```json
{
  "notification_id": "uuid"  // Mark single notification
}
```

OR

```json
{
  "mark_all": true  // Mark all notifications as read
}
```

### 3. POST /send
**Manual Dispatch** (Admin/System Use)

Queues a manual notification.

**Request Body:**
```json
{
  "target": {
    "type": "single",
    "value": "user-uuid"
  },
  "content": {
    "title": "System Maintenance",
    "message": "Scheduled maintenance tonight at 2 AM",
    "type": "info"
  }
}
```

---

## G. Frontend Component Structure

### Recommended Architecture

```
App
├── NotificationProvider (Global polling)
│   ├── State: notifications, unreadCount
│   └── Effects: Polling /inbox every 30s
│
├── Navigation
│   └── NotificationCenter (Bell icon + popover)
│       ├── Unread badge
│       ├── Recent notifications list
│       └── "View all" link
│
└── NotificationsView (Full page)
    ├── Filter sidebar
    ├── Notification list
    └── Click handlers (navigation logic)
```

---

## H. Best Practices

### ✅ DO

- **Poll /inbox regularly** (30-60s) to trigger server-side sync
- **Use metadata.doc_id** for completed analyses (not job_id)
- **Show error details** from `metadata.error` when status is `failed`
- **Mark as read** when user clicks notification
- **Optimize badge** by using server's `unread_count` (don't count client-side)

### ❌ DON'T

- **Don't track jobs client-side** - let the notification system handle it
- **Don't poll individual job status endpoints** - the server does this via /inbox
- **Don't create new notifications client-side** - server handles all job lifecycle events
- **Don't poll too frequently** - respect server load, 30s is optimal

---

## I. Testing Checklist

- [ ] Submit analysis → notification appears within polling interval (~30s)
- [ ] Click completed notification → navigates to `/analysis/{doc_id}`
- [ ] Click processing notification → navigates to `/status/{job_id}`
- [ ] Click failed notification → shows error message
- [ ] Mark single notification as read → unread count decrements
- [ ] Mark all as read → unread count = 0
- [ ] Bell icon badge shows correct unread count
- [ ] Multiple notifications for same job show timeline correctly
- [ ] No duplicate "Finished" notifications on subsequent polls

---

## J. Troubleshooting

### Problem: Notifications not appearing

**Check:**
1. Is frontend polling /inbox? (Check network tab)
2. Is user authenticated? (401 errors mean no valid session)
3. Is server-side sync working? (Check server logs for job polling)

### Problem: Duplicate notifications

**Check:**
1. Server logic should have idempotency check
2. Frontend should deduplicate by `notification.id` (not job_id)

### Problem: Navigation not working

**Check:**
1. Does `metadata.doc_id` exist for completed notifications?
2. Is routing logic checking `metadata.status` correctly?
3. Are routes properly configured in your router?

---

**Version**: 2.0.0  
**Last Updated**: 2026-01-06  
**Architecture**: Active Sync on Fetch
