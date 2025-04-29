export class Logger {
  static info(context: string, message: string, data?: any): void {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      context,
      message,
      data,
    }));
  }

  static error(context: string, message: string, error?: any): void {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      context,
      message,
      error: error ? {
        name: error.name || 'Error',
        message: error.message || String(error),
        stack: error.stack || undefined,
      } : undefined,
    }));
  }
}
