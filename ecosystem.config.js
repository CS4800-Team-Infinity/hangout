/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.js          # Start all apps
 *   pm2 stop hangout                        # Stop the main app
 *   pm2 stop hangout-cron                   # Stop the cron service
 *   pm2 restart hangout-cron                # Restart cron service
 *   pm2 monit                               # Monitor all processes
 *   pm2 logs hangout-cron                   # View cron logs
 *   pm2 save                                # Save PM2 config (to auto-restart on reboot)
 */

module.exports = {
  apps: [
    {
      name: 'hangout',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/hangout', // Update this to your app path
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/hangout-error.log',
      out_file: './logs/hangout-out.log',
    },
    {
      name: 'hangout-cron',
      script: './scripts/cron-service.ts',
      cwd: '/path/to/hangout', // Update this to your app path
      interpreter: 'ts-node',
      env: {
        NODE_ENV: 'production',
        CRON_SECRET: process.env.CRON_SECRET,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      watch: false, // Don't watch for file changes in production
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
    },
  ],
};
