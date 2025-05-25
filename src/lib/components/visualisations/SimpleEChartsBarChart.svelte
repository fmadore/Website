<!--
ECharts Bar Chart using svelte-echarts wrapper - Even simpler!
-->
<script lang="ts">
    import { Chart } from 'svelte-echarts';
    import { init } from 'echarts';
    
    // Props - same interface as your D3 component
    type DataItem = $$Generic;
    let {
        data = [] as DataItem[],
        xAccessor,
        yAccessor,
        xAxisLabel = '',
        yAxisLabel = '',
        barColor = 'var(--color-primary)'
    }: {
        data?: DataItem[];
        xAccessor: (d: DataItem) => string | number;
        yAccessor: (d: DataItem) => number;
        xAxisLabel?: string;
        yAxisLabel?: string;
        barColor?: string;
    } = $props();    // Theme detection
    let isDark = $state(false);
    
    // Function to resolve CSS variables to actual color values
    function getCSSVariableValue(variableName: string): string {
        if (typeof window === 'undefined') return '#6366f1'; // Default fallback for SSR
        
        const computedStyle = getComputedStyle(document.documentElement);
        const value = computedStyle.getPropertyValue(variableName).trim();
        return value || '#6366f1'; // Fallback to a default blue if variable not found
    }

    // Function to resolve any color value (CSS variable or direct color)
    function resolveColor(color: string): string {
        if (color.startsWith('var(')) {
            // Extract variable name from var(--variable-name)
            const varName = color.slice(4, -1).trim();
            return getCSSVariableValue(varName);
        }
        return color; // Return as-is if not a CSS variable
    }

    // Resolve colors from CSS variables
    const resolvedColors = $derived({
        primary: getCSSVariableValue('--color-primary'),
        text: getCSSVariableValue('--color-text'),
        textLight: getCSSVariableValue('--color-text-light'),
        border: getCSSVariableValue('--color-border'),
        surface: getCSSVariableValue('--color-surface'),
        primaryDark: getCSSVariableValue('--color-primary-dark') || '#4f46e5',
        barColor: resolveColor(barColor)
    });
    
    $effect(() => {
        isDark = document.documentElement.classList.contains('dark');
        
        const observer = new MutationObserver(() => {
            isDark = document.documentElement.classList.contains('dark');
        });
        observer.observe(document.documentElement, { attributes: true });
        
        return () => observer.disconnect();
    });    // Chart options
    const option = $derived({
        tooltip: {
            trigger: 'axis' as const,
            backgroundColor: resolvedColors.surface,
            textStyle: {
                color: resolvedColors.text,
                fontSize: 12,
                fontFamily: 'Inter, -apple-system, sans-serif'
            },
            borderRadius: 6,
            borderColor: resolvedColors.border,
            borderWidth: 1,
            extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);'
        },
        grid: {
            left: 64,
            right: 24,
            top: 24,
            bottom: xAxisLabel ? 80 : 48
        },
        xAxis: {
            type: 'category' as const,
            data: data.map(d => String(xAccessor(d))),
            name: xAxisLabel,
            nameLocation: 'middle' as const,
            nameGap: 30,
            nameTextStyle: {
                color: resolvedColors.text,
                fontSize: 14,
                fontFamily: 'Inter, -apple-system, sans-serif'
            },
            axisLabel: {
                color: resolvedColors.textLight,
                fontSize: 12,
                fontFamily: 'Inter, -apple-system, sans-serif'
            },
            axisLine: {
                lineStyle: {
                    color: resolvedColors.border
                }
            },
            axisTick: {
                lineStyle: {                    color: resolvedColors.border
                }
            }
        },
        yAxis: {
            type: 'value' as const,
            name: yAxisLabel,
            nameLocation: 'middle' as const,
            nameGap: 45,
            nameTextStyle: {
                color: resolvedColors.text,
                fontSize: 14,
                fontFamily: 'Inter, -apple-system, sans-serif'
            },
            axisLabel: {
                color: resolvedColors.textLight,
                fontSize: 12,
                fontFamily: 'Inter, -apple-system, sans-serif'
            },
            axisLine: {
                lineStyle: {
                    color: resolvedColors.border
                }
            },
            axisTick: {
                lineStyle: {
                    color: resolvedColors.border
                }
            },
            splitLine: {
                lineStyle: {
                    color: resolvedColors.border,
                    opacity: 0.5
                }
            }
        },        series: [
            {
                name: yAxisLabel || 'Value',
                type: 'bar' as const,
                data: data.map(d => yAccessor(d)),
                itemStyle: {
                    color: resolvedColors.barColor,
                    borderRadius: [4, 4, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: resolvedColors.primaryDark,
                        shadowColor: resolvedColors.primary,
                        shadowBlur: 10
                    }
                }
            }
        ],
        backgroundColor: 'transparent'
    });
</script>

<div class="chart-wrapper">
    <Chart {init} options={option as any} />
</div>

<style>
    .chart-wrapper {
        width: 100%;
        height: 350px;
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-4);
        box-shadow: var(--shadow-sm);
        font-family: var(--font-family-sans);
    }
    
    .chart-wrapper :global(.echarts-container) {
        width: 100% !important;
        height: 100% !important;
    }
    
    /* Ensure proper dark mode handling */
    :global(html.dark) .chart-wrapper {
        background-color: var(--color-surface);
        border-color: var(--color-surface-border);
        box-shadow: var(--shadow-sm);
    }
</style>
