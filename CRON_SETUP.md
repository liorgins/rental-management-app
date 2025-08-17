# 🕐 Vercel Cron Setup for Task Reminders

## Overview

This app uses Vercel Cron Jobs to automatically check and send task reminder notifications every 15 minutes.

## Configuration

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/tasks/reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Schedule Details

- **Frequency**: Every 15 minutes
- **Cron Expression**: `*/15 * * * *`
- **Endpoint**: `/api/tasks/reminders`
- **Method**: POST

## How It Works

1. **Vercel Cron** automatically calls `/api/tasks/reminders` every 15 minutes
2. **The endpoint**:

   - Fetches all active tasks from the database
   - Checks each task's reminders against current time
   - Sends push notifications for due reminders
   - Marks reminders as sent to avoid duplicates
   - Sends "due today" notifications for tasks due today

3. **Logging**: All cron runs are logged with detailed stats:
   - Total tasks processed
   - Active tasks (non-completed)
   - Number of reminders sent
   - Number of due notifications sent
   - Processing duration

## Monitoring

### Status Endpoint

```bash
GET /api/cron/status
```

Returns current system status including:

- Upcoming reminders count
- Overdue tasks count
- Next tasks that will trigger reminders
- Cron configuration info

### Manual Trigger (Development)

```bash
curl -X POST http://localhost:3000/api/tasks/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### View Logs

- **Development**: Check your terminal/console
- **Production**: View Vercel Functions logs in your dashboard

## Environment Variables

The following environment variables are required for the cron system to work:

### Required Variables

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_EMAIL=mailto:your-email@example.com

# Cron Security
CRON_SECRET=your_random_secret_here

# Redis/KV Storage
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

### Generate VAPID Keys

```bash
npm run generate-vapid-keys
```

This will output new VAPID keys that you can use in your environment variables.

> **Note**: The `NEXT_PUBLIC_VAPID_PUBLIC_KEY` uses the `NEXT_PUBLIC_` prefix because it needs to be accessible to the client-side code for push notification subscriptions.

## Security

- Uses `CRON_SECRET` environment variable for manual auth
- Vercel cron jobs are automatically authenticated via `x-vercel-cron-signature` header
- Both authentication methods are supported

## Example Response

```json
{
  "success": true,
  "message": "Reminders processed successfully",
  "timestamp": "2025-08-16T22:52:39.101Z",
  "duration": 2806,
  "totalTasks": 3,
  "activeTasks": 3,
  "remindersSent": 3,
  "dueNotificationsSent": 1,
  "processedReminders": ["Task Title (1_day)", "Another Task (2_days)"],
  "processedDueNotifications": ["Due Today Task"]
}
```

## Deployment

1. Ensure `vercel.json` is in your project root
2. Deploy to Vercel
3. Cron jobs will automatically start running
4. Check Vercel dashboard for cron job status and logs

## Troubleshooting

- **No notifications received**: Check push notification permissions and subscriptions
- **Cron not running**: Verify `vercel.json` is deployed and check Vercel dashboard
- **Authentication errors**: Ensure `CRON_SECRET` environment variable is set
- **Task reminders not triggering**: Check task due dates and reminder configurations
