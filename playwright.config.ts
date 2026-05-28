import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Tests run against the production build served by
 * `vite preview`, so they exercise the prerendered static output that ships to
 * GitHub Pages. Run with `npm run test:e2e`.
 */
const PORT = 4173;

export default defineConfig({
	testDir: 'tests-e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'npm run build && npm run preview -- --port ' + PORT,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
