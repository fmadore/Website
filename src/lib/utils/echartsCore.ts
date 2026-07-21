/**
 * Tree-shaken ECharts build.
 *
 * `useECharts` dynamically imports this module instead of the all-in-one
 * `echarts` package, so the code-split echarts chunk carries only the series,
 * components and renderer the site actually uses. Register new series or
 * components here when a chart needs them — importing from `'echarts'`
 * anywhere else reintroduces the full ~1 MB build.
 *
 * `echarts-wordcloud` registers itself against the same core registry
 * (`echarts/lib/echarts`), so extension loading via `loadExtensions` keeps
 * working unchanged.
 */

import * as echarts from 'echarts/core';
import {
	BarChart,
	PieChart,
	ScatterChart,
	CustomChart,
	TreemapChart,
	GraphChart
} from 'echarts/charts';
import {
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	AriaComponent
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
	// Series
	BarChart, // bar / horizontal bar / stacked bar
	PieChart, // doughnut
	ScatterChart, // gantt milestone points
	CustomChart, // gantt range bars
	TreemapChart,
	GraphChart, // co-presenter / keyword / institution networks
	// Components
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	AriaComponent, // data-derived aria descriptions + decal patterns
	// Features
	LabelLayout, // doughnut mobile label layout
	// Renderer
	CanvasRenderer
]);

export * from 'echarts/core';
