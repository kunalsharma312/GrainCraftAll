/**
 * Analytics and Logging Service
 * Tracks user events and logs important actions
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEvent {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, any>;
  error?: string;
}

export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private logs: LogEvent[] = [];
  private events: AnalyticsEvent[] = [];
  private maxLogs = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private apiBase = process.env.EXPO_PUBLIC_API_URL || '';

  /**
   * Log an event
   */
  log(
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, any>,
    error?: Error
  ): void {
    const logEvent: LogEvent = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error: error?.message,
    };

    this.logs.push(logEvent);

    // Keep logs manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDevelopment) {
      this.logToConsole(logEvent);
    }

    // Send critical logs to backend
    if (level === LogLevel.ERROR) {
      this.sendLogToBackend(logEvent);
    }
  }

  /**
   * Log debug message
   */
  debug(category: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Log info message
   */
  info(category: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Log warning message
   */
  warn(category: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * Log error message
   */
  error(category: string, message: string, error?: Error, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  /**
   * Track analytics event
   */
  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    // Send event to backend
    this.sendEventToBackend(event);

    this.info('ANALYTICS', `Event tracked: ${eventName}`, properties);
  }

  /**
   * Track page view
   */
  trackPageView(screenName: string): void {
    this.trackEvent('page_view', { screen: screenName });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, data?: Record<string, any>): void {
    this.trackEvent('user_action', { action, ...data });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(productId: string, quantity: number, price: number): void {
    this.trackEvent('add_to_cart', {
      productId,
      quantity,
      price,
    });
  }

  /**
   * Track order placed
   */
  trackOrderPlaced(orderId: string, total: number, itemCount: number): void {
    this.trackEvent('order_placed', {
      orderId,
      total,
      itemCount,
    });
  }

  /**
   * Track order completed
   */
  trackOrderCompleted(orderId: string, total: number): void {
    this.trackEvent('order_completed', {
      orderId,
      total,
    });
  }

  /**
   * Track error
   */
  trackError(errorName: string, errorMessage: string, data?: Record<string, any>): void {
    this.trackEvent('error', {
      errorName,
      errorMessage,
      ...data,
    });
  }

  /**
   * Track user login
   */
  trackLogin(userId: string, method: string): void {
    this.trackEvent('login', {
      userId,
      method,
    });
  }

  /**
   * Track user logout
   */
  trackLogout(userId: string): void {
    this.trackEvent('logout', {
      userId,
    });
  }

  /**
   * Get all logs
   */
  getLogs(): LogEvent[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEvent[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string): LogEvent[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(event: LogEvent): void {
    const timestamp = new Date(event.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${event.level}] [${event.category}]`;

    switch (event.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, event.message, event.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, event.message, event.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, event.message, event.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, event.message, event.error, event.data);
        break;
    }
  }

  /**
   * Send log to backend
   */
  private async sendLogToBackend(event: LogEvent): Promise<void> {
    try {
      await fetch(`${this.apiBase}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  /**
   * Send event to backend
   */
  private async sendEventToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(`${this.apiBase}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event to backend:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
