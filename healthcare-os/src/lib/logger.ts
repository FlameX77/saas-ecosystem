type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  userId?: string
  clinicId?: string
}

export const logger = {
  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    // In production, we'd send this to a service like Axiom, Datadog, or Sentry
    if (process.env.NODE_ENV === 'development') {
      const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : level === 'info' ? '\x1b[34m' : '\x1b[90m'
      console.log(`${color}${level.toUpperCase()}\x1b[0m [${entry.timestamp}] ${message}`, context || '')
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  },

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  },

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log('error', message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    })
  },

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }
}
