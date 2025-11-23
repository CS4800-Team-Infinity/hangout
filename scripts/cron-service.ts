/**
 * Cron Service for sending event reminders
 * 
 * This script runs as a separate PM2 process and triggers the reminder cron job
 * at scheduled intervals.
 * 
 * To start: pm2 start scripts/cron-service.ts --name "hangout-cron"
 * To stop: pm2 stop hangout-cron
 * To view logs: pm2 logs hangout-cron
 */

import cronPkg from 'node-cron';

// Normalize import so this file works in both ESM and CommonJS runtimes
const cron = (cronPkg && (cronPkg as any).default) ? (cronPkg as any).default : cronPkg as any;

// Use global fetch when available (Node 18+). If not, dynamically import
// `node-fetch` at runtime to avoid ESM/CommonJS import errors when running
// scripts with plain Node or ts-node.
async function getFetch() {
  if (typeof (globalThis as any).fetch === 'function') {
    return (globalThis as any).fetch.bind(globalThis);
  }

  try {
    const nf = await import('node-fetch');
    const fetchFn = (nf && (nf as any).default) ? (nf as any).default : nf;
    if (typeof fetchFn === 'function') return fetchFn;
  } catch (err) {
    // fallthrough to error below
  }

  throw new Error('global fetch is not available in this Node runtime. Please run Node 18+ or install `node-fetch`.');
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error('ERROR: CRON_SECRET environment variable is not set');
  process.exit(1);
}

async function sendReminders() {
  try {
    console.log(`[${new Date().toISOString()}] Triggering event reminder check...`);
    const fetch = await getFetch();

    const response = await fetch(`${API_URL}/api/cron/send-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': CRON_SECRET!,
      },
    });

    const data = await response.json() as any;

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] ✓ Reminders sent successfully`);
      console.log(`  Notifications sent: ${data.notificationsSent || 0}`);
    } else {
      console.error(`[${new Date().toISOString()}] ✗ Failed to send reminders:`, data.error);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ✗ Error triggering reminders:`, error);
  }
}

// Run every hour at minute 0
cron.schedule('0 * * * *', sendReminders);

console.log('✓ Cron service started');
console.log('  Schedule: Every hour at minute 0');
console.log('  API URL:', API_URL);
console.log('  Checking for events 1 day away and 1 hour away');

// Optional: Send reminders immediately on startup (comment out if not desired)
console.log('Running initial reminder check...');
sendReminders();
