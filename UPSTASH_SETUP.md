# Upstash KV Storage Setup Guide

This application now uses Upstash Redis KV storage for persisting units and expenses data with React Query for state management.

## Prerequisites

1. Create an Upstash account at [https://console.upstash.com/](https://console.upstash.com/)
2. Create a new Redis database

## Environment Variables Setup

Create a `.env.local` file in the root directory of your project and add the following variables:

```bash
# Upstash Redis Configuration
# Get these from your Upstash Redis dashboard
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

## How to Get Your Credentials

1. Log in to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database (or use an existing one)
3. Go to your database details page
4. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the REST API section
5. Paste them into your `.env.local` file

## Features

- **Automatic Fallback**: If Upstash is not configured, the app will fall back to localStorage for development
- **Data Migration**: Existing localStorage data will be automatically migrated to Upstash on first load
- **React Query Integration**: All data operations use React Query for optimal caching and synchronization
- **Real-time Updates**: Changes are immediately reflected across all components

## Data Operations

The app now supports:

### Units

- ✅ View all units
- ✅ View individual unit details
- ✅ Create new units (via hooks)
- ✅ Update unit information (via hooks)
- ✅ Delete units (via hooks)

### Expenses

- ✅ View all expenses
- ✅ View unit-specific expenses
- ✅ View global expenses
- ✅ Create new expenses
- ✅ Update expenses (via hooks)
- ✅ Delete expenses (via hooks)
- ✅ Expense statistics and calculations

## Development Mode

During development, if Upstash credentials are not provided:

- The app will automatically fall back to localStorage
- All features will work normally
- Data will persist locally in the browser
- Migration to Upstash will happen automatically once credentials are added

## Production Deployment

For production deployment (especially on Vercel):

1. Add the environment variables to your deployment platform
2. Ensure the Upstash Redis instance is accessible
3. The app will automatically use KV storage in production

## File Structure

```
lib/
├── kv.ts                 # Upstash Redis configuration
├── kv-service.ts         # Data service layer with fallback logic
└── react-query-provider.tsx # React Query setup

hooks/
├── use-units.ts          # Units-related React Query hooks
└── use-expenses.ts       # Expenses-related React Query hooks
```

