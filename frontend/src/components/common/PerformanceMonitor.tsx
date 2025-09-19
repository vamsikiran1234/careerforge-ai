import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP not supported in this browser
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // FID not supported in this browser
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.reportMetric('CLS', clsValue);
      });
      
      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // CLS not supported in this browser
      }
    }

    // First Contentful Paint
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('paint');
      const fcpEntry = perfData.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.reportMetric('FCP', fcpEntry.startTime);
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.reportMetric('TTFB', this.metrics.ttfb);
      }
    });
  }

  private reportMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      console.log(`${name}: ${value.toFixed(2)}ms`);
    }

    // In production, send metrics to analytics service
    if (import.meta.env.PROD) {
      this.sendToAnalytics(name, value);
    }
  }

  private sendToAnalytics(name: string, value: number) {
    // Send to your analytics service (Google Analytics, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(value)
      });
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public measurePageLoad(pageName: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.reportMetric(`Page Load - ${pageName}`, duration);
    };
  }

  public measureUserInteraction(actionName: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.reportMetric(`User Interaction - ${actionName}`, duration);
    };
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (pageName?: string) => {
  useEffect(() => {
    if (pageName) {
      const monitor = PerformanceMonitor.getInstance();
      const measurePageLoad = monitor.measurePageLoad(pageName);
      
      return measurePageLoad;
    }
  }, [pageName]);

  return {
    measureInteraction: (actionName: string) => {
      const monitor = PerformanceMonitor.getInstance();
      return monitor.measureUserInteraction(actionName);
    },
    getMetrics: () => {
      const monitor = PerformanceMonitor.getInstance();
      return monitor.getMetrics();
    }
  };
};

// Component to display performance metrics in development
export const PerformanceDebugger: React.FC = () => {
  const { getMetrics } = usePerformanceMonitor();

  if (import.meta.env.PROD) {
    return null;
  }

  const metrics = getMetrics();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded text-xs font-mono z-50">
      <div className="font-bold mb-2">Performance Metrics</div>
      {metrics.fcp && <div>FCP: {metrics.fcp.toFixed(1)}ms</div>}
      {metrics.lcp && <div>LCP: {metrics.lcp.toFixed(1)}ms</div>}
      {metrics.fid && <div>FID: {metrics.fid.toFixed(1)}ms</div>}
      {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
      {metrics.ttfb && <div>TTFB: {metrics.ttfb.toFixed(1)}ms</div>}
    </div>
  );
};

export default PerformanceMonitor;
