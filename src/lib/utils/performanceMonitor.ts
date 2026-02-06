/**
 * Performance monitoring utilities for PWA optimization
 * Tracks Core Web Vitals and other performance metrics
 */

import { browser } from '$app/environment';

interface PerformanceMetrics {
	lcp?: number; // Largest Contentful Paint
	fid?: number; // First Input Delay
	cls?: number; // Cumulative Layout Shift
	fcp?: number; // First Contentful Paint
	ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
	private metrics: PerformanceMetrics = {};
	private observers: PerformanceObserver[] = [];

	constructor() {
		if (browser) {
			this.initializeObservers();
		}
	}

	private initializeObservers() {
		// Largest Contentful Paint (LCP)
		this.observeMetric('largest-contentful-paint', (entry) => {
			this.metrics.lcp = entry.startTime;
			this.reportMetric('LCP', entry.startTime);
		});

		// First Input Delay (FID)
		this.observeMetric('first-input', (entry) => {
			this.metrics.fid = (entry as any).processingStart - entry.startTime;
			this.reportMetric('FID', this.metrics.fid);
		});

		// Cumulative Layout Shift (CLS)
		this.observeMetric('layout-shift', (entry) => {
			if (!(entry as any).hadRecentInput) {
				this.metrics.cls = (this.metrics.cls || 0) + (entry as any).value;
				this.reportMetric('CLS', this.metrics.cls || 0);
			}
		});

		// First Contentful Paint (FCP)
		this.observeMetric('paint', (entry) => {
			if (entry.name === 'first-contentful-paint') {
				this.metrics.fcp = entry.startTime;
				this.reportMetric('FCP', entry.startTime);
			}
		});

		// Navigation timing for TTFB
		this.measureTTFB();
	}

	private observeMetric(type: string, callback: (entry: PerformanceEntry) => void) {
		try {
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					callback(entry);
				}
			});

			observer.observe({ type, buffered: true });
			this.observers.push(observer);
		} catch (error) {
			console.warn(`Failed to observe ${type}:`, error);
		}
	}

	private measureTTFB() {
		if ('navigation' in performance) {
			const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
			if (navEntry) {
				this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
				this.reportMetric('TTFB', this.metrics.ttfb);
			}
		}
	}

	private reportMetric(name: string, value: number) {
		// Log to console in development
		if (import.meta.env.DEV) {
			console.log(`[Performance] ${name}: ${Math.round(value)}ms`);
		}

		// Send to analytics in production (if you have analytics setup)
		if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
			window.gtag('event', 'web_vital', {
				name,
				value: Math.round(value),
				metric_id: `${name}-${Date.now()}`
			});
		}
	}

	public getMetrics(): PerformanceMetrics {
		return { ...this.metrics };
	}

	public disconnect() {
		this.observers.forEach((observer) => observer.disconnect());
		this.observers = [];
	}
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function initPerformanceMonitoring() {
	if (browser && !performanceMonitor) {
		performanceMonitor = new PerformanceMonitor();
	}
	return performanceMonitor;
}

export function getPerformanceMetrics(): PerformanceMetrics {
	return performanceMonitor?.getMetrics() || {};
}

// Resource loading performance
export function measureResourceLoading(resourceUrl: string) {
	if (!browser) return;

	const startTime = performance.now();

	return {
		end: () => {
			const endTime = performance.now();
			const loadTime = endTime - startTime;
			console.log(`[Resource] ${resourceUrl}: ${Math.round(loadTime)}ms`);

			// Report to analytics
			if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
				window.gtag('event', 'resource_timing', {
					resource_url: resourceUrl,
					load_time: Math.round(loadTime)
				});
			}
		}
	};
}

// Connection quality assessment
export function assessConnectionQuality(): string {
	if (!browser) return 'unknown';

	// Check for Network Information API
	const connection =
		(navigator as any).connection ||
		(navigator as any).mozConnection ||
		(navigator as any).webkitConnection;

	if (connection) {
		const effectiveType = connection.effectiveType;
		const rtt = connection.rtt;
		const downlink = connection.downlink;

		console.log(`[Connection] Type: ${effectiveType}, RTT: ${rtt}ms, Downlink: ${downlink}Mbps`);
		return effectiveType;
	}

	// Fallback: estimate based on performance timing
	if ('navigation' in performance) {
		const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
		const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;

		if (loadTime < 1000) return 'fast';
		if (loadTime < 3000) return 'moderate';
		return 'slow';
	}

	return 'unknown';
}

// Memory usage monitoring (if available)
export function monitorMemoryUsage() {
	if (!browser) return null;

	const memory = (performance as any).memory;
	if (memory) {
		const usage = {
			used: Math.round(memory.usedJSHeapSize / 1048576), // MB
			total: Math.round(memory.totalJSHeapSize / 1048576), // MB
			limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
		};

		console.log(`[Memory] Used: ${usage.used}MB, Total: ${usage.total}MB, Limit: ${usage.limit}MB`);
		return usage;
	}

	return null;
}
