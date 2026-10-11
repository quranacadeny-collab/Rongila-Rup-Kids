/**
 * Lightweight Performance Monitor for Product Catalog
 * 
 * Tracks loading time, network fetches, filtering/sorting calculation times,
 * and DOM render times of the product catalog.
 * Automatically logs structured reports and bottleneck warnings to the console
 * exclusively when running in development mode (import.meta.env.DEV).
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  category: 'initial_load' | 'network_fetch' | 'filter_sort' | 'render_commit' | 'firestore_sync';
  startTime: number;
  endTime: number;
  durationMs: number;
  timestamp: string;
  metadata?: Record<string, any>;
  bottleneck?: {
    isBottleneck: boolean;
    level: 'ok' | 'warning' | 'critical';
    thresholdMs: number;
    issue?: string;
    recommendation?: string;
  };
}

export interface CatalogPerformanceReport {
  timestamp: string;
  totalMetricsRecorded: number;
  initialCatalogLoadTimeMs: number | null;
  latestFilterSortTimeMs: number | null;
  latestRenderTimeMs: number | null;
  bottlenecksDetected: number;
  recentMetrics: PerformanceMetric[];
}

// Configurable latency thresholds (in milliseconds) for detecting bottlenecks
const BOTTLENECK_THRESHOLDS: Record<string, { warning: number; critical: number; recommendation: string }> = {
  initial_load: {
    warning: 600,
    critical: 1200,
    recommendation: 'Optimize initial payload size, leverage local storage cache or pre-render top products.'
  },
  network_fetch: {
    warning: 400,
    critical: 1000,
    recommendation: 'Server response is sluggish. Verify server-side file cache, compression (gzip), or CDN.'
  },
  filter_sort: {
    warning: 16, // > 16ms drops below 60 FPS
    critical: 40,
    recommendation: 'Filter/sort computation exceeds 16.6ms (dropped frame budget). Consider memoizing search terms or debouncing user input.'
  },
  render_commit: {
    warning: 30,
    critical: 80,
    recommendation: 'DOM rendering time is high. Consider pagination, infinite scroll, or lazy-loading offscreen product cards.'
  },
  firestore_sync: {
    warning: 800,
    critical: 2000,
    recommendation: 'Firestore snapshot latency is high. Check network bandwidth or Firestore query limits.'
  }
};

class CatalogPerformanceMonitor {
  private activeTraces = new Map<string, { name: string; category: PerformanceMetric['category']; startTime: number; metadata?: Record<string, any> }>();
  private metricHistory: PerformanceMetric[] = [];
  private readonly maxHistory = 60;
  private isDev: boolean;
  private initialLoadCompleted = false;

  constructor() {
    this.isDev = Boolean(
      import.meta.env?.DEV ||
      import.meta.env?.MODE === 'development' ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    );

    // Expose developer debug handle in browser window if in dev mode
    if (this.isDev && typeof window !== 'undefined') {
      (window as any).__CATALOG_PERF__ = {
        getHistory: () => this.metricHistory,
        getReport: () => this.generateReport(),
        clearHistory: () => {
          this.metricHistory = [];
          console.log('%c[Catalog Perf] Performance history cleared.', 'color: #10b981; font-weight: bold;');
        },
        benchmarkCatalog: (productCount = 100) => this.runSyntheticBenchmark(productCount)
      };
    }
  }

  /**
   * Check if development mode logging is active
   */
  public isDevMode(): boolean {
    return this.isDev;
  }

  /**
   * Start tracking a performance trace
   */
  public startTrace(
    id: string, 
    name: string, 
    category: PerformanceMetric['category'], 
    metadata?: Record<string, any>
  ): string {
    if (!this.isDev) return id;

    const startTime = performance.now();
    this.activeTraces.set(id, { name, category, startTime, metadata });

    // Native browser performance marks for Chrome DevTools profiling
    try {
      if (typeof performance?.mark === 'function') {
        performance.mark(`catalog-start-${id}`);
      }
    } catch {
      // Safe fallback if performance mark fails
    }

    return id;
  }

  /**
   * Complete a performance trace and analyze for bottlenecks
   */
  public endTrace(
    id: string, 
    extraMetadata?: Record<string, any>
  ): PerformanceMetric | null {
    if (!this.isDev) return null;

    const trace = this.activeTraces.get(id);
    if (!trace) return null;

    this.activeTraces.delete(id);
    const endTime = performance.now();
    const durationMs = Number((endTime - trace.startTime).toFixed(2));

    // Native browser performance measure
    try {
      if (typeof performance?.measure === 'function') {
        performance.measure(`catalog-${trace.name}`, `catalog-start-${id}`);
      }
    } catch {
      // Safe fallback
    }

    const mergedMeta = { ...trace.metadata, ...extraMetadata };
    const threshold = BOTTLENECK_THRESHOLDS[trace.category] || { warning: 50, critical: 150, recommendation: 'Review execution path.' };

    let level: 'ok' | 'warning' | 'critical' = 'ok';
    let issue: string | undefined;
    let recommendation: string | undefined;

    if (durationMs >= threshold.critical) {
      level = 'critical';
      issue = `Critical bottleneck: ${durationMs}ms exceeds critical threshold of ${threshold.critical}ms`;
      recommendation = threshold.recommendation;
    } else if (durationMs >= threshold.warning) {
      level = 'warning';
      issue = `Potential bottleneck: ${durationMs}ms exceeds warning threshold of ${threshold.warning}ms`;
      recommendation = threshold.recommendation;
    }

    const metric: PerformanceMetric = {
      id,
      name: trace.name,
      category: trace.category,
      startTime: trace.startTime,
      endTime,
      durationMs,
      timestamp: new Date().toLocaleTimeString(),
      metadata: mergedMeta,
      bottleneck: {
        isBottleneck: level !== 'ok',
        level,
        thresholdMs: level === 'critical' ? threshold.critical : threshold.warning,
        issue,
        recommendation
      }
    };

    this.metricHistory.push(metric);
    if (this.metricHistory.length > this.maxHistory) {
      this.metricHistory.shift();
    }

    this.logMetric(metric);
    return metric;
  }

  /**
   * Formatted logging to console in development mode
   */
  private logMetric(metric: PerformanceMetric): void {
    if (!this.isDev) return;

    const { name, durationMs, bottleneck, metadata, category } = metric;
    const isBottleneck = bottleneck?.isBottleneck;
    const level = bottleneck?.level || 'ok';

    // Styling configurations based on performance status
    let badgeColor = '#10b981'; // Green (fast)
    let badgeText = '⚡ FAST';
    let icon = '⚡';

    if (level === 'warning') {
      badgeColor = '#f59e0b'; // Amber (warning)
      badgeText = '⚠️ SLOW';
      icon = '⚠️';
    } else if (level === 'critical') {
      badgeColor = '#ef4444'; // Red (critical bottleneck)
      badgeText = '🚨 BOTTLENECK';
      icon = '🚨';
    }

    const badgeStyle = `background: ${badgeColor}; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px;`;
    const titleStyle = 'color: #6366f1; font-weight: bold; font-size: 12px;';
    const durationStyle = `color: ${level === 'critical' ? '#ef4444' : level === 'warning' ? '#d97706' : '#059669'}; font-weight: bold; font-size: 12px;`;
    const labelStyle = 'color: #6b7280; font-size: 11px;';

    const header = `%c[Catalog Perf]%c %c${badgeText}%c ${name} %c(${durationMs}ms)`;
    
    if (isBottleneck) {
      console.groupCollapsed(
        header,
        'color: #8b5cf6; font-weight: bold;',
        '',
        badgeStyle,
        titleStyle,
        durationStyle
      );
      
      console.warn(
        `%c${icon} ${bottleneck?.issue}`,
        'color: #dc2626; font-weight: bold; font-size: 11px;'
      );

      if (bottleneck?.recommendation) {
        console.info(
          `%c💡 Bottleneck Advice: %c${bottleneck.recommendation}`,
          'color: #2563eb; font-weight: bold;',
          'color: #374151;'
        );
      }

      if (metadata && Object.keys(metadata).length > 0) {
        console.log('%cMetadata / Context:', labelStyle, metadata);
      }
      console.groupEnd();
    } else {
      // Clean single-line entry for normal healthy operations
      if (metadata && Object.keys(metadata).length > 0) {
        console.groupCollapsed(
          header,
          'color: #8b5cf6; font-weight: bold;',
          '',
          badgeStyle,
          titleStyle,
          durationStyle
        );
        console.log('%cMetadata / Context:', labelStyle, metadata);
        console.groupEnd();
      } else {
        console.log(
          header,
          'color: #8b5cf6; font-weight: bold;',
          '',
          badgeStyle,
          titleStyle,
          durationStyle
        );
      }
    }
  }

  /**
   * Log an overall summary report of the catalog's performance
   */
  public generateReport(): CatalogPerformanceReport {
    const bottlenecks = this.metricHistory.filter(m => m.bottleneck?.isBottleneck);
    const initialLoad = this.metricHistory.find(m => m.category === 'initial_load');
    const filterSorts = this.metricHistory.filter(m => m.category === 'filter_sort');
    const renderCommits = this.metricHistory.filter(m => m.category === 'render_commit');

    const report: CatalogPerformanceReport = {
      timestamp: new Date().toLocaleTimeString(),
      totalMetricsRecorded: this.metricHistory.length,
      initialCatalogLoadTimeMs: initialLoad ? initialLoad.durationMs : null,
      latestFilterSortTimeMs: filterSorts.length > 0 ? filterSorts[filterSorts.length - 1].durationMs : null,
      latestRenderTimeMs: renderCommits.length > 0 ? renderCommits[renderCommits.length - 1].durationMs : null,
      bottlenecksDetected: bottlenecks.length,
      recentMetrics: this.metricHistory.slice(-10)
    };

    if (this.isDev) {
      console.group('%c📊 [Catalog Perf Summary Report]', 'color: #8b5cf6; font-weight: bold; font-size: 13px;');
      console.table([
        {
          Metric: 'Initial Catalog Load',
          Duration: report.initialCatalogLoadTimeMs !== null ? `${report.initialCatalogLoadTimeMs} ms` : 'N/A',
          Status: report.initialCatalogLoadTimeMs && report.initialCatalogLoadTimeMs > 600 ? '⚠️ High' : '✅ Optimal'
        },
        {
          Metric: 'Latest Filter & Sort Calculation',
          Duration: report.latestFilterSortTimeMs !== null ? `${report.latestFilterSortTimeMs} ms` : 'N/A',
          Status: report.latestFilterSortTimeMs && report.latestFilterSortTimeMs > 16 ? '⚠️ Dropping Frame' : '✅ 60 FPS Smooth'
        },
        {
          Metric: 'Latest Catalog Render Commit',
          Duration: report.latestRenderTimeMs !== null ? `${report.latestRenderTimeMs} ms` : 'N/A',
          Status: report.latestRenderTimeMs && report.latestRenderTimeMs > 30 ? '⚠️ High DOM Paint' : '✅ Optimal'
        },
        {
          Metric: 'Total Bottlenecks Flagged',
          Duration: `${report.bottlenecksDetected} events`,
          Status: report.bottlenecksDetected === 0 ? '✅ None' : '⚠️ Review warnings above'
        }
      ]);
      console.groupEnd();
    }

    return report;
  }

  /**
   * Run a synthetic stress benchmark on product filtering/sorting in dev
   */
  public runSyntheticBenchmark(count = 100): void {
    if (!this.isDev) return;
    console.log(`%c🏃 Running Catalog Benchmark with ${count} synthetic items...`, 'color: #3b82f6; font-weight: bold;');
    
    const items = Array.from({ length: count }, (_, i) => ({
      id: `mock-${i}`,
      nameBn: `বেবি পোশাক ${i}`,
      nameEn: `Baby Dress ${i}`,
      price: 500 + (i * 25) % 2500,
      category: ['babydress', 'babyset', 'frock', 'panjabi'][i % 4],
      fabricBn: 'সুতি',
      fabricEn: 'Cotton',
      createdAt: Date.now() - i * 100000
    }));

    const traceId = this.startTrace('bench-filter-sort', `Benchmark: Filter & Sort (${count} items)`, 'filter_sort', { syntheticCount: count });
    
    // Simulate real filtering & sorting operations
    const filtered = items.filter(p => {
      return p.category === 'babydress' || p.price > 1000;
    }).sort((a, b) => b.price - a.price);

    this.endTrace(traceId, { outputCount: filtered.length });
  }

  /**
   * Helper to ensure initial load trace is logged cleanly once
   */
  public markInitialLoadDone(): boolean {
    if (this.initialLoadCompleted) return false;
    this.initialLoadCompleted = true;
    return true;
  }
}

// Singleton instance
export const catalogPerf = new CatalogPerformanceMonitor();
