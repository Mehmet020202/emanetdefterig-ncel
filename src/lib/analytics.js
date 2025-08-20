// Analytics and Error Tracking

class AnalyticsManager {
  constructor() {
    this.isEnabled = false;
    this.events = [];
    this.init();
  }

  init() {
    // Check if analytics is enabled
    this.isEnabled = localStorage.getItem('analytics_enabled') === 'true';
    
    // Setup error tracking
    this.setupErrorTracking();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        this.trackEvent('page_performance', {
          load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          total_time: Math.round(perfData.loadEventEnd - perfData.fetchStart)
        });
      }
    });
  }

  trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        user_agent: navigator.userAgent,
        session_id: this.getSessionId()
      }
    };

    this.events.push(event);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
    
    // Store in localStorage
    localStorage.setItem('analytics_events', JSON.stringify(this.events));
    
    console.log('Analytics Event:', event);
  }

  trackError(errorType, errorData) {
    this.trackEvent('error', {
      error_type: errorType,
      ...errorData
    });
  }

  trackUserAction(action, details = {}) {
    this.trackEvent('user_action', {
      action,
      ...details
    });
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  enableAnalytics() {
    this.isEnabled = true;
    localStorage.setItem('analytics_enabled', 'true');
  }

  disableAnalytics() {
    this.isEnabled = false;
    localStorage.setItem('analytics_enabled', 'false');
    localStorage.removeItem('analytics_events');
  }

  getEvents() {
    return this.events;
  }

  exportEvents() {
    const data = {
      events: this.events,
      exported_at: new Date().toISOString(),
      session_id: this.getSessionId()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const analytics = new AnalyticsManager();
