/**
 * 订阅管理日志工具
 * 
 * 提供结构化的日志记录功能，便于调试和监控订阅相关操作
 */

export interface LogContext {
  userId?: string;
  subscriptionId?: string;
  creemSubscriptionId?: string;
  operation: string;
  metadata?: Record<string, any>;
}

export class SubscriptionLogger {
  private static formatMessage(level: string, message: string, context: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = JSON.stringify({
      userId: context.userId,
      subscriptionId: context.subscriptionId,
      creemSubscriptionId: context.creemSubscriptionId,
      operation: context.operation,
      metadata: context.metadata
    });
    
    return `[${timestamp}] [${level}] [SUBSCRIPTION] ${message} | Context: ${contextStr}`;
  }

  static info(message: string, context: LogContext) {
    console.log(this.formatMessage('INFO', message, context));
  }

  static warn(message: string, context: LogContext) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  static error(message: string, context: LogContext, error?: any) {
    const errorMessage = error ? `${message} | Error: ${error.message || error}` : message;
    console.error(this.formatMessage('ERROR', errorMessage, context));
  }

  static debug(message: string, context: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  /**
   * 记录订阅操作
   */
  static logSubscriptionOperation(
    operation: string,
    userId: string,
    subscriptionId?: string,
    creemSubscriptionId?: string,
    metadata?: Record<string, any>
  ) {
    this.info(`Subscription operation: ${operation}`, {
      userId,
      subscriptionId,
      creemSubscriptionId,
      operation,
      metadata
    });
  }

  /**
   * 记录支付操作
   */
  static logPaymentOperation(
    operation: string,
    userId: string,
    paymentId?: string,
    amount?: number,
    status?: string,
    metadata?: Record<string, any>
  ) {
    this.info(`Payment operation: ${operation}`, {
      userId,
      operation,
      metadata: {
        paymentId,
        amount,
        status,
        ...metadata
      }
    });
  }

  /**
   * 记录 Webhook 事件
   */
  static logWebhookEvent(
    eventType: string,
    eventId: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.info(`Webhook event received: ${eventType}`, {
      userId,
      operation: 'webhook_handler',
      metadata: {
        eventId,
        eventType,
        ...metadata
      }
    });
  }
}