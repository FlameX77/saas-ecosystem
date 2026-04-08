import * as Sentry from '@sentry/nextjs'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export const logger = {
  log: (level: LogLevel, message: string, meta?: Record<string, any>) => {
    const isDev = process.env.NODE_ENV === 'development'
    
    if (isDev) {
      const colors = {
        info: '\x1b[36m', // Cyan
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[90m', // Gray
      }
      const reset = '\x1b[0m'
      console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, meta ? meta : '')
    } else {
      if (level === 'error') {
        Sentry.captureException(new Error(message), { extra: meta })
      } else {
        Sentry.addBreadcrumb({
          category: 'log',
          message,
          level: level === 'warn' ? 'warning' : level,
          data: meta,
        })
      }
    }
  },
  info: (msg: string, meta?: any) => logger.log('info', msg, meta),
  warn: (msg: string, meta?: any) => logger.log('warn', msg, meta),
  error: (msg: string, meta?: any) => logger.log('error', msg, meta),
  debug: (msg: string, meta?: any) => logger.log('debug', msg, meta),
}
