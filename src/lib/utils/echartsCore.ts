/**
 * Tree-shaken ECharts build.
 *
 * `useECharts` dynamically imports this module instead of the all-in-one
 * `echarts` package, so the code-split echarts chunk carries only the series,
 * components and renderer the site actually uses. Register new series or
 * components here when a chart needs them — importing from `'echarts'`
 * anywhere else reintroduces the full ~1 MB build.
 *
 * The `loadExtensions` hook in `useECharts` exists for extensions that register
 * themselves against this same core registry. Nothing uses it at present:
 * `echarts-wordcloud` was the only consumer, and the word clouds were retired
 * in favour of the typeset key-terms cloud (`scaleKeyTerms` + `.key-terms`),
 * which encodes the same frequencies without a canvas.
 */

import * as echarts from 'echarts/core';
import { BarChart, ScatterChart, CustomChart, TreemapChart } from 'echarts/charts';
import {
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	AriaComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
	// Series
	BarChart, // bar / horizontal bar / stacked bar
	ScatterChart, // gantt milestone points
	CustomChart, // gantt range bars
	TreemapChart,
	// NOTE: GraphChart (force-directed networks) is deliberately absent — the
	// networks are drawn as declarative SVG by NetworkGraph.svelte, which gives
	// keyboard-navigable nodes, label-collision handling and a settled layout
	// that the canvas series could not. Do not re-register it.
	// NOTE: PieChart and the LabelLayout feature are gone with the doughnuts.
	// A two-value split is now the `.hbar` proportion ledger and a seven-value
	// one a ranked horizontal bar, both of which read the near-ties a pie hid.
	// Components
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	AriaComponent, // data-derived aria descriptions + decal patterns
	// Renderer
	CanvasRenderer
]);

export * from 'echarts/core';
