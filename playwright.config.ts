import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Tests run against the production build served by a
 * plain static file server (`serve build`), which mirrors GitHub Pages — the
 * prerendered route output that actually ships. We deliberately avoid
 * `vite preview` here: the legacy `static/index.html` SPA shell shadows the
 * prerendered home route under preview, so `/` would never boot the app.
 * Run with `npm run test:e2e`.
 */
const PORT = 4173;

export default defineConfig({
	testDir: 'tests-e2e',
	fullyParallel: true,
	// The visualisation pages initialize D3/ECharts/MapLibre chunks. Capping
	// parallel browser contexts keeps those readiness checks deterministic on
	// developer laptops and two-core CI runners without serializing the suite.
	workers: 4,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				// Sandboxed/CI containers often pre-install a system Chromium instead
				// of the exact build this Playwright version would download. Point
				// PLAYWRIGHT_CHROMIUM_PATH at that binary to use it; unset, Playwright
				// resolves its own managed browser as usual.
				...(process.env.PLAYWRIGHT_CHROMIUM_PATH
					? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
					: {})
			}
		},
		{
			name: 'mobile-chromium',
			testMatch: /responsive\.spec\.ts/,
			use: {
				...devices['Pixel 7'],
				...(process.env.PLAYWRIGHT_CHROMIUM_PATH
					? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
					: {})
			}
		},
		{
			name: 'firefox',
			testMatch: /cross-browser\.spec\.ts/,
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit',
			testMatch: /cross-browser\.spec\.ts/,
			use: { ...devices['Desktop Safari'] }
		}
	],
	webServer: {
		// In CI the production build is produced once by an earlier job and
		// downloaded as an artifact; set PLAYWRIGHT_SKIP_BUILD=1 to serve that
		// existing `build/` directory instead of rebuilding. Locally (unset),
		// `npm run test:e2e` still builds first, as before.
		command: process.env.PLAYWRIGHT_SKIP_BUILD
			? `npx serve build --listen ${PORT} --no-port-switching`
			: `npm run build && npx serve build --listen ${PORT} --no-port-switching`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
