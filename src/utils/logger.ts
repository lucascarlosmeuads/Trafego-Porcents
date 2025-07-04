
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

class Logger {
  private config: LoggerConfig;
  
  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: any): void {
    if (!this.shouldLog('debug')) return;
    
    if (this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: any): void {
    if (!this.shouldLog('info')) return;
    
    if (this.config.enableConsole) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: any): void {
    if (!this.shouldLog('warn')) return;
    
    if (this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: any): void {
    if (!this.shouldLog('error')) return;
    
    if (this.config.enableConsole) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  table(data: any[], title?: string): void {
    if (!this.shouldLog('info')) return;
    
    if (this.config.enableConsole) {
      if (title) {
        console.info(`📊 ${title}`);
      }
      console.table(data);
    }
  }

  group(title: string, collapsed = false): void {
    if (!this.shouldLog('info')) return;
    
    if (this.config.enableConsole) {
      if (collapsed) {
        console.groupCollapsed(title);
      } else {
        console.group(title);
      }
    }
  }

  groupEnd(): void {
    if (this.config.enableConsole) {
      console.groupEnd();
    }
  }
}

// Configuração baseada no ambiente
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

const config: LoggerConfig = {
  level: isProduction ? 'warn' : 'debug',
  enableConsole: true,
  enableRemote: false // Para futuro uso com serviços de logging
};

export const logger = new Logger(config);

// Funções de conveniência para componentes específicos
export const createComponentLogger = (componentName: string) => ({
  debug: (message: string, context?: any) => logger.debug(`[${componentName}] ${message}`, context),
  info: (message: string, context?: any) => logger.info(`[${componentName}] ${message}`, context),
  warn: (message: string, context?: any) => logger.warn(`[${componentName}] ${message}`, context),
  error: (message: string, context?: any) => logger.error(`[${componentName}] ${message}`, context),
});

// Logs específicos para diferentes contextos
export const authLogger = createComponentLogger('Auth');
export const clienteLogger = createComponentLogger('Cliente');
export const tableLogger = createComponentLogger('Table');
export const modalLogger = createComponentLogger('Modal');
export const supabaseLogger = createComponentLogger('Supabase');
