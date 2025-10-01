/**
 * Logger Utility
 * Centralized logging for the application
 */

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = process.env.LOG_LEVEL 
      ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] || LogLevel.INFO
      : level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level}] ${message}`;
    if (data) {
      formatted += ` ${JSON.stringify(data)}`;
    }
    return formatted;
  }

  error(message: string, error?: any): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, error));
    }
  }

  warn(message: string, data?: any): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.level >= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }
}

export const logger = new Logger();
