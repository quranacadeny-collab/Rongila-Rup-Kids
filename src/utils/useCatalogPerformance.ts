import { useEffect, useRef } from 'react';
import { catalogPerf } from './performanceMonitor';
import { Product } from '../types';

interface UseCatalogPerformanceOptions {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
}

/**
 * Custom React Hook for monitoring product catalog performance
 * Tracks:
 * 1. Initial catalog load & time-to-interactive
 * 2. Filter & Sort recalculation latency
 * 3. Product grid DOM render & commit time
 * 4. Logs to console with bottleneck analysis in development mode
 */
export function useCatalogPerformance({
  products,
  filteredProducts,
  selectedCategory,
  searchQuery,
  sortBy
}: UseCatalogPerformanceOptions) {
  const mountTimeRef = useRef<number>(performance.now());
  const initialLoadRecordedRef = useRef<boolean>(false);
  const renderTraceIdRef = useRef<string | null>(null);
  const prevFilterStateRef = useRef<{ category: string; query: string; sort: string; count: number }>({
    category: selectedCategory,
    query: searchQuery,
    sort: sortBy,
    count: products.length
  });

  // Track initial catalog mount & load time
  useEffect(() => {
    const traceId = 'catalog-initial-load';
    catalogPerf.startTrace(traceId, 'Product Catalog Initial Load', 'initial_load', {
      initialProductCount: products.length,
      timestamp: Date.now()
    });

    return () => {
      // Cleanup if unmounted
    };
  }, []);

  // Track when initial products become ready and interactive in the DOM
  useEffect(() => {
    if (!initialLoadRecordedRef.current && products.length > 0) {
      initialLoadRecordedRef.current = true;
      const initialDuration = performance.now() - mountTimeRef.current;
      
      catalogPerf.endTrace('catalog-initial-load', {
        loadedProductsCount: products.length,
        filteredCount: filteredProducts.length,
        initialTimeMs: Number(initialDuration.toFixed(2))
      });

      // Also trigger a summary log in dev mode after initial boot
      if (catalogPerf.isDevMode()) {
        setTimeout(() => {
          catalogPerf.generateReport();
        }, 1500);
      }
    }
  }, [products.length, filteredProducts.length]);

  // Track DOM Render Commit time when filtered products or filters change
  useEffect(() => {
    if (renderTraceIdRef.current) {
      catalogPerf.endTrace(renderTraceIdRef.current, {
        renderedCardCount: filteredProducts.length,
        category: selectedCategory,
        hasSearch: Boolean(searchQuery.trim()),
        sortBy
      });
      renderTraceIdRef.current = null;
    }
  });

  // Check if filtering/sorting state changed to trace subsequent render time
  useEffect(() => {
    const prev = prevFilterStateRef.current;
    const hasChanged = 
      prev.category !== selectedCategory || 
      prev.query !== searchQuery || 
      prev.sort !== sortBy ||
      prev.count !== products.length;

    if (hasChanged && initialLoadRecordedRef.current) {
      prevFilterStateRef.current = {
        category: selectedCategory,
        query: searchQuery,
        sort: sortBy,
        count: products.length
      };

      const traceName = searchQuery.trim() 
        ? `Catalog Filter: "${searchQuery}" (${filteredProducts.length} items)`
        : `Catalog View: ${selectedCategory} [${sortBy}] (${filteredProducts.length} items)`;

      renderTraceIdRef.current = `catalog-render-${Date.now()}`;
      catalogPerf.startTrace(
        renderTraceIdRef.current,
        traceName,
        'render_commit',
        {
          totalCatalogSize: products.length,
          displayedItems: filteredProducts.length,
          filterCategory: selectedCategory,
          sortMethod: sortBy
        }
      );
    }
  }, [products.length, filteredProducts.length, selectedCategory, searchQuery, sortBy]);

  return {
    monitor: catalogPerf
  };
}
