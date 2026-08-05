type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * Minimal structured logger (JSON lines) for scrape/apply observability.
 */
export class Logger {
  constructor(private readonly defaultFields: LogFields = {}) {}

  /**
   * Returns a child logger with merged default fields.
   */
  child(fields: LogFields): Logger {
    return new Logger({ ...this.defaultFields, ...fields });
  }

  debug(message: string, fields?: LogFields): void {
    this.write('debug', message, fields);
  }

  info(message: string, fields?: LogFields): void {
    this.write('info', message, fields);
  }

  warn(message: string, fields?: LogFields): void {
    this.write('warn', message, fields);
  }

  error(message: string, fields?: LogFields): void {
    this.write('error', message, fields);
  }

  private write(level: LogLevel, message: string, fields?: LogFields): void {
    const payload = {
      ts: new Date().toISOString(),
      level,
      message,
      ...this.defaultFields,
      ...fields,
    };
    const line = JSON.stringify(payload);
    if (level === 'error') {
      console.error(line);
      return;
    }
    if (level === 'warn') {
      console.warn(line);
      return;
    }
    console.log(line);
  }
}

export const rootLogger = new Logger({ service: 'jobhunter' });

/**
 * Creates a short correlation id for a scrape/apply run.
 */
export function createCorrelationId(prefix = 'run'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
