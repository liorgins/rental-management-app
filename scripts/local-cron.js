#!/usr/bin/env node

/**
 * Local cron simulator for development
 * This script simulates the Vercel cron job locally by calling the endpoint at regular intervals
 */

const ENDPOINT = 'http://localhost:3000/api/tasks/reminders'
const CRON_SECRET = process.env.CRON_SECRET || '14903b8131783cb701edfb12976f35c9401cf4e9b88cd13565212f896a9476e1'
const INTERVAL_MS = 60 * 1000 // 1 minute (matching your vercel.json schedule)

console.log('🕐 Starting local cron simulator...')
console.log(`📍 Endpoint: ${ENDPOINT}`)
console.log(`⏰ Interval: ${INTERVAL_MS / 1000} seconds`)
console.log('💡 Press Ctrl+C to stop\n')

let runCount = 0

async function triggerCron() {
  runCount++
  const timestamp = new Date().toISOString()
  
  try {
    console.log(`[${timestamp}] Run #${runCount} - Triggering cron...`)
    
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Success: ${result.message}`)
      if (result.remindersSent > 0 || result.dueNotificationsSent > 0) {
        console.log(`   📨 Reminders sent: ${result.remindersSent}`)
        console.log(`   📅 Due notifications: ${result.dueNotificationsSent}`)
      }
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log(`❌ Network error:`, error.message)
  }
  
  console.log(`   ⏱️  Next run in ${INTERVAL_MS / 1000} seconds\n`)
}

// Run immediately, then at intervals
triggerCron()
setInterval(triggerCron, INTERVAL_MS)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping local cron simulator...')
  process.exit(0)
})
