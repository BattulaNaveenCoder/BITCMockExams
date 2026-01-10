/**
 * Performance monitoring utilities for tracking load times
 * Similar to Netflix/YouTube optimization strategies
 */

interface PerformanceMetrics {
  timeToFirstByte: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalLoadTime: number;
  initialBundleSize?: number;
}

/**
 * Measure and log performance metrics
 */
export function measurePerformance(): Promise<PerformanceMetrics | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.performance) {
      resolve(null);
      return;
    }

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    function collectMetrics() {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const metrics: PerformanceMetrics = {
          timeToFirstByte: navigation?.responseStart - navigation?.requestStart || 0,
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0,
          totalLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
        };

        // Get LCP if available
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              metrics.largestContentfulPaint = lastEntry?.startTime || 0;
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Stop observing after 10 seconds
            setTimeout(() => observer.disconnect(), 10000);
          } catch (e) {
            console.warn('LCP observer failed:', e);
          }
        }

        // Calculate bundle sizes
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(r => r.name.endsWith('.js'));
        metrics.initialBundleSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

        resolve(metrics);
      } catch (error) {
        console.error('Performance measurement error:', error);
        resolve(null);
      }
    }
  });
}

/**
 * Log performance metrics to console (can be extended to send to analytics)
 */
export async function logPerformanceMetrics() {
  const metrics = await measurePerformance();
  
  if (!metrics) {
    console.warn('Performance metrics not available');
    return;
  }

  console.group('⚡ Performance Metrics');
  console.log(`🚀 Time to First Byte: ${metrics.timeToFirstByte.toFixed(2)}ms`);
  console.log(`📄 DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
  console.log(`🎨 First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
  console.log(`🖼️  Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(2)}ms`);
  console.log(`⏱️  Total Load Time: ${metrics.totalLoadTime.toFixed(2)}ms`);
  
  if (metrics.initialBundleSize) {
    console.log(`📦 Initial Bundle Size: ${(metrics.initialBundleSize / 1024).toFixed(2)}KB`);
  }

  // Warning if performance goals not met
  if (metrics.firstContentfulPaint > 500) {
    console.warn('⚠️ FCP is above 500ms target');
  }
  if (metrics.largestContentfulPaint > 2500) {
    console.warn('⚠️ LCP is above 2.5s target (Core Web Vital)');
  }
  
  console.groupEnd();

  return metrics;
}

/**
 * Mark custom performance events
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
  }
}

/**
 * Measure time between two marks
 */
export function measureBetweenMarks(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`⏱️  ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    } catch (e) {
      console.error('Performance measurement error:', e);
    }
  }
  return 0;
}

/**
 * Initialize performance monitoring (call in main.tsx)
 */
export function initPerformanceMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    // Auto-log metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        logPerformanceMetrics();
      }, 100);
    });
  }
}
