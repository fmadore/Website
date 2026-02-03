/**
 * CSS Design Audit Script - Warm Earth Tones Edition
 *
 * This script analyzes Svelte components and CSS files for design system compliance.
 * Updated for the warm earth tone palette (terracotta/gold) design system.
 *
 * Run with: node .github/skills/css-design-audit/audit.mjs [path]
 *
 * Examples:
 *   node .github/skills/css-design-audit/audit.mjs src/lib/components
 *   node .github/skills/css-design-audit/audit.mjs src/lib/components/menu/Header.svelte
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

// ============================================================
// DESIGN SYSTEM v2.0 - Warm Earth Tones (Terracotta/Gold)
// ============================================================

// Current design system colors (what SHOULD be used)
const CURRENT_PALETTE = {
	// Primary Terracotta
	'--color-primary': '#9a4419',
	'--color-primary-dark': '#7a3516',
	'--color-primary-light': '#b5651d',
	'--color-primary-lighter': '#d4956a',
	// Accent Gold
	'--color-accent': '#c4a35a',
	'--color-accent-dark': '#a67c00',
	'--color-accent-light': '#d4b96a',
	// Highlight
	'--color-highlight': '#d4b96a',
	// Text (warm grays)
	'--color-text': '#2d2820',
	'--color-text-light': '#7a7267',
	'--color-text-muted': '#a8a196',
	// Surfaces (warm)
	'--color-surface': '#faf9f7',
	'--color-surface-alt': '#f5f3f0',
	'--color-border': '#e8e4df',
	// Background
	'--color-background': '#ffffff',
	'--color-background-dark': '#1a1612',
};

// OLD palette colors that should be flagged as LEGACY/DEPRECATED
const LEGACY_COLORS = {
	// Old Primary blues
	'#1d4ed8': { token: '--color-primary', note: 'OLD blue - use terracotta #9a4419' },
	'#1e3a8a': { token: '--color-primary-dark', note: 'OLD dark blue - use #7a3516' },
	'#1e3a5f': { token: '--color-primary-dark', note: 'OLD dark blue variant - use #7a3516' },
	'#3b82f6': { token: '--color-primary-light', note: 'OLD blue-500 - use #b5651d' },
	'#60a5fa': { token: '--color-primary-lighter', note: 'OLD blue-400 - use #d4956a' },
	'#2563eb': { token: '--color-primary', note: 'OLD blue-600 - use #9a4419' },
	// Old Accent teal
	'#14b8a6': { token: '--color-accent', note: 'OLD teal - use gold #c4a35a' },
	'#0d9488': { token: '--color-accent-dark', note: 'OLD teal-600 - use #a67c00' },
	'#2dd4bf': { token: '--color-accent-light', note: 'OLD teal-400 - use #d4b96a' },
	'#0f766e': { token: '--color-accent-dark', note: 'OLD teal-700 - use #a67c00' },
	// Old slate/cool grays (text)
	'#1e293b': { token: '--color-text', note: 'OLD cool slate - use warm #2d2820' },
	'#334155': { token: '--color-text', note: 'OLD slate-700 - use warm gray' },
	'#64748b': { token: '--color-text-light', note: 'OLD slate-500 - use #7a7267' },
	'#94a3b8': { token: '--color-text-muted', note: 'OLD slate-400 - use #a8a196' },
	'#475569': { token: '--color-text-soft', note: 'OLD slate-600 - use warm gray' },
	// Old cool surfaces
	'#f8fafc': { token: '--color-surface', note: 'OLD cool white - use warm #faf9f7' },
	'#f1f5f9': { token: '--color-surface-alt', note: 'OLD slate-100 - use #f5f3f0' },
	'#e2e8f0': { token: '--color-border', note: 'OLD slate-200 - use warm #e8e4df' },
};

// Colors that are OK (current design tokens or intentional fixed colors)
const ALLOWED_COLORS = {
	// Current palette
	'#9a4419': '--color-primary (terracotta)',
	'#7a3516': '--color-primary-dark',
	'#b5651d': '--color-primary-light',
	'#d4956a': '--color-primary-lighter / terracotta-400',
	'#c4a35a': '--color-accent (gold)',
	'#a67c00': '--color-accent-dark',
	'#d4b96a': '--color-accent-light / gold-400',
	'#2d2820': '--color-text',
	'#7a7267': '--color-text-light',
	'#a8a196': '--color-text-muted',
	'#faf9f7': '--color-surface',
	'#f5f3f0': '--color-surface-alt',
	'#e8e4df': '--color-border',
	'#1a1612': '--color-background-dark',
	// Common fixed colors (white, black, transparent-ish)
	'#ffffff': 'white (OK)',
	'#000000': 'black (OK)',
	'#fff': 'white shorthand (OK)',
	'#000': 'black shorthand (OK)',
	// Status colors (these haven't changed)
	'#f59e0b': '--color-highlight (amber)',
	'#d97706': '--color-highlight-dark',
	'#10b981': '--color-success (emerald)',
	'#059669': '--color-success-dark',
	'#dc2626': '--color-danger (red)',
	'#b91c1c': '--color-danger-dark',
	'#ef4444': '--color-danger-light',
	// Timeline colors (warm-harmonized)
	'#6b9e4f': '--color-timeline-education (sage)',
	'#5c8ab4': '--color-timeline-publications (dusty blue)',
	'#a67c9b': '--color-timeline-presentations (mauve)',
	'#cd7f32': '--color-timeline-awards (bronze)',
	'#6b9a8d': '--color-timeline-fieldwork (sage teal)',
};

// Deprecated patterns to flag in comments/documentation
const DEPRECATED_TERMS = [
	'academic blue',
	'blue theme',
	'teal accent',
	'slate gray',
	'cool gray',
	'blue-900',
	'blue-800',
	'blue-700',
	'blue-600',
	'blue-500',
	'teal-700',
	'teal-600',
	'teal-500',
];

const SPACING_PATTERNS = {
	// Pixel values (8-point grid)
	'2px': '--space-0-5',
	'4px': '--space-1',
	'6px': '--space-1-5',
	'8px': '--space-2',
	'10px': '--space-2-5',
	'12px': '--space-3',
	'14px': '--space-3-5 / --space-md-tight',
	'16px': '--space-4',
	'20px': '--space-5',
	'24px': '--space-6',
	'28px': '--space-7 / --space-xl-tight',
	'32px': '--space-8',
	'36px': '--space-9',
	'40px': '--space-10',
	'44px': '--space-11',
	'48px': '--space-12',
	'56px': '--space-14',
	'64px': '--space-16',
	'80px': '--space-20',
	'96px': '--space-24',
	'112px': '--space-28',
	'128px': '--space-32',
	// Rem values
	'0.125rem': '--space-0-5',
	'0.25rem': '--space-1',
	'0.375rem': '--space-1-5',
	'0.5rem': '--space-2',
	'0.625rem': '--space-2-5',
	'0.75rem': '--space-3',
	'0.875rem': '--space-3-5',
	'1rem': '--space-4',
	'1.25rem': '--space-5',
	'1.5rem': '--space-6',
	'1.75rem': '--space-7',
	'2rem': '--space-8',
	'2.25rem': '--space-9',
	'2.5rem': '--space-10',
	'2.75rem': '--space-11',
	'3rem': '--space-12',
	'3.5rem': '--space-14',
	'4rem': '--space-16',
	'5rem': '--space-20',
	'6rem': '--space-24',
};

const DURATION_PATTERNS = {
	'75ms': '--duration-instant',
	'150ms': '--duration-fast',
	'200ms': '--duration-normal',
	'300ms': '--duration-moderate',
	'500ms': '--duration-slow',
	'700ms': '--duration-slower',
};

const BORDER_RADIUS_PATTERNS = {
	'2px': '--border-radius-xs',
	'4px': '--border-radius-sm',
	'8px': '--border-radius',
	'10px': '--border-radius-md',
	'12px': '--border-radius-lg',
	'16px': '--border-radius-xl',
	'20px': '--border-radius-2xl',
	'24px': '--border-radius-3xl',
	'0.125rem': '--border-radius-xs',
	'0.25rem': '--border-radius-sm',
	'0.5rem': '--border-radius',
	'0.625rem': '--border-radius-md',
	'0.75rem': '--border-radius-lg',
	'1rem': '--border-radius-xl',
	'1.25rem': '--border-radius-2xl',
	'1.5rem': '--border-radius-3xl',
};

const ZINDEX_PATTERNS = {
	'1000': '--z-dropdown',
	'1020': '--z-sticky',
	'1030': '--z-fixed',
	'1040': '--z-modal-backdrop',
	'1050': '--z-modal',
	'1060': '--z-popover',
	'1070': '--z-tooltip',
	'1080': '--z-toast',
};

// Issue types
const ISSUE_TYPES = {
	LEGACY_COLOR: 'legacy-color',
	HARDCODED_COLOR: 'hardcoded-color',
	HARDCODED_SPACING: 'hardcoded-spacing',
	HARDCODED_DURATION: 'hardcoded-duration',
	HARDCODED_BORDER_RADIUS: 'hardcoded-border-radius',
	HARDCODED_ZINDEX: 'hardcoded-zindex',
	MISSING_WEBKIT_BACKDROP: 'missing-webkit-backdrop',
	DEPRECATED_ANIMATION: 'deprecated-animation',
	INVALID_MEDIA_QUERY: 'invalid-media-query',
	RGBA_COOL_GRAY: 'rgba-cool-gray',
	DEPRECATED_TERMINOLOGY: 'deprecated-terminology',
	OLD_SYSTEM_COLOR_VAR: 'old-system-color-var',
};

/**
 * Find all files recursively in a directory
 */
function findFiles(dir, extensions = ['.svelte', '.css', '.ts', '.md']) {
	const results = [];

	try {
		const items = readdirSync(dir);

		for (const item of items) {
			const fullPath = join(dir, item);
			const stat = statSync(fullPath);

			if (stat.isDirectory()) {
				if (!['node_modules', 'build', '.svelte-kit', 'dist', '.git'].includes(item)) {
					results.push(...findFiles(fullPath, extensions));
				}
			} else if (extensions.includes(extname(item))) {
				results.push(fullPath);
			}
		}
	} catch (e) {
		// Directory doesn't exist or permission denied
	}

	return results;
}

/**
 * Extract style blocks from Svelte files
 */
function extractStyles(content, filePath) {
	const isSvelte = filePath.endsWith('.svelte');

	if (!isSvelte) {
		return [{ content, startLine: 1, isStyle: filePath.endsWith('.css') }];
	}

	const styleBlocks = [];
	const styleRegex = /<style[^>]*>([\s\S]*?)<\/style[^>]*>/gi;
	let match;

	while ((match = styleRegex.exec(content)) !== null) {
		const beforeStyle = content.substring(0, match.index);
		const startLine = beforeStyle.split('\n').length;
		styleBlocks.push({
			content: match[1],
			startLine,
			isStyle: true
		});
	}

	// Also check script sections for JS color values
	const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script[^>]*>/gi;
	while ((match = scriptRegex.exec(content)) !== null) {
		const beforeScript = content.substring(0, match.index);
		const startLine = beforeScript.split('\n').length;
		styleBlocks.push({
			content: match[1],
			startLine,
			isStyle: false,
			isScript: true
		});
	}

	return styleBlocks;
}

/**
 * Analyze a file for design system issues
 */
function analyzeFile(filePath) {
	const issues = [];
	const content = readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const blocks = extractStyles(content, filePath);

	// Skip the variables.css file - it defines the tokens
	const isVariablesFile = filePath.includes('variables.css');
	const isMarkdown = filePath.endsWith('.md');
	const isTypeScript = filePath.endsWith('.ts');

	// Check for deprecated terminology in all files
	lines.forEach((line, idx) => {
		const lineLower = line.toLowerCase();
		for (const term of DEPRECATED_TERMS) {
			if (lineLower.includes(term.toLowerCase())) {
				// Skip if it's in the audit script itself or variable definitions
				if (filePath.includes('audit.mjs') || filePath.includes('variables.css')) {
					continue;
				}
				issues.push({
					type: ISSUE_TYPES.DEPRECATED_TERMINOLOGY,
					line: idx + 1,
					current: term,
					suggestion: 'Update to warm earth tone terminology (terracotta/gold)',
					context: line.trim().substring(0, 80)
				});
			}
		}
	});

	// Check for old system color variable usage
	lines.forEach((line, idx) => {
		if (line.includes('--sys-color-blue-') || line.includes('--sys-color-teal-')) {
			// Skip variable definitions in variables.css
			if (isVariablesFile && line.trim().startsWith('--sys-color')) {
				return;
			}
			issues.push({
				type: ISSUE_TYPES.OLD_SYSTEM_COLOR_VAR,
				line: idx + 1,
				current: line.match(/--sys-color-(blue|teal)-\d+/)?.[0] || 'blue/teal var',
				suggestion: 'Use --sys-color-terracotta-* or --sys-color-gold-* instead',
				context: line.trim().substring(0, 80)
			});
		}
	});

	// Check style/script blocks
	for (const block of blocks) {
		const blockLines = block.content.split('\n');

		blockLines.forEach((line, idx) => {
			const lineNum = block.startLine + idx;

			// Skip comments and variable definitions
			if (line.trim().startsWith('/*') || line.trim().startsWith('*') ||
			    line.trim().startsWith('//') || line.trim().startsWith('--')) {
				return;
			}

			if (isVariablesFile) {
				return;
			}

			// Check for legacy (old) hex colors - HIGH PRIORITY
			const hexMatches = line.match(/#[0-9a-fA-F]{3,8}\b/g);
			if (hexMatches) {
				for (const hex of hexMatches) {
					const normalized = hex.toLowerCase();

					// Check if it's a legacy color that needs updating
					if (LEGACY_COLORS[normalized]) {
						issues.push({
							type: ISSUE_TYPES.LEGACY_COLOR,
							line: lineNum,
							current: hex,
							suggestion: `var(${LEGACY_COLORS[normalized].token}) - ${LEGACY_COLORS[normalized].note}`,
							context: line.trim().substring(0, 80),
							severity: 'high'
						});
					}
					// Check if it's an unknown hardcoded color (not in allowed list)
					else if (!ALLOWED_COLORS[normalized] && !normalized.match(/^#[0-9a-f]{3}$/)) {
						issues.push({
							type: ISSUE_TYPES.HARDCODED_COLOR,
							line: lineNum,
							current: hex,
							suggestion: 'Consider using a design token or adding to allowed colors',
							context: line.trim().substring(0, 80),
							severity: 'medium'
						});
					}
				}
			}

			// Check for rgba() with old cool gray values
			const rgbaMatch = line.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
			if (rgbaMatch) {
				const [, r, g, b] = rgbaMatch.map(Number);
				// Old slate gray: rgb(30, 41, 59) = #1e293b
				if (r === 30 && g === 41 && b === 59) {
					issues.push({
						type: ISSUE_TYPES.RGBA_COOL_GRAY,
						line: lineNum,
						current: 'rgba(30, 41, 59, ...)',
						suggestion: 'Use rgba(26, 22, 18, ...) for warm dark or color-mix()',
						context: line.trim().substring(0, 80)
					});
				}
				// Old slate variants
				if ((r >= 30 && r <= 100) && (g >= 41 && g <= 120) && (b >= 59 && b <= 140) &&
				    Math.abs(b - r) > 20) { // Cool gray has higher blue than red
					issues.push({
						type: ISSUE_TYPES.RGBA_COOL_GRAY,
						line: lineNum,
						current: `rgba(${r}, ${g}, ${b}, ...)`,
						suggestion: 'Appears to be cool gray - consider warm equivalent or color-mix()',
						context: line.trim().substring(0, 80),
						severity: 'low'
					});
				}
			}

			// Only check CSS-specific patterns in style blocks
			if (!block.isStyle) return;

			// Check for hardcoded spacing
			if (!line.includes('--space') && !line.includes('calc(') &&
			    !line.includes('transition') && !line.includes('min-width') &&
			    !line.includes('min-height') && !line.includes('max-width') &&
			    !line.includes('max-height')) {
				for (const [value, token] of Object.entries(SPACING_PATTERNS)) {
					const regex = new RegExp(`:\\s*${value.replace('.', '\\.')}[;\\s]`, 'i');
					if (regex.test(line)) {
						if ((line.includes('width') || line.includes('height')) &&
						    ['8px', '12px', '16px', '20px', '24px'].includes(value)) {
							issues.push({
								type: ISSUE_TYPES.HARDCODED_SPACING,
								line: lineNum,
								current: value,
								suggestion: `var(${token}) [Note: May be intentional icon size]`,
								context: line.trim().substring(0, 80),
								severity: 'low'
							});
						} else {
							issues.push({
								type: ISSUE_TYPES.HARDCODED_SPACING,
								line: lineNum,
								current: value,
								suggestion: `var(${token})`,
								context: line.trim().substring(0, 80)
							});
						}
					}
				}
			}

			// Check for hardcoded durations
			if (!line.includes('--duration') && !line.includes('--anim-duration') &&
			    !line.includes('--stagger') && !line.trim().startsWith('--')) {
				for (const [value, token] of Object.entries(DURATION_PATTERNS)) {
					if (line.includes(value) && !line.includes(`var(${token})`)) {
						issues.push({
							type: ISSUE_TYPES.HARDCODED_DURATION,
							line: lineNum,
							current: value,
							suggestion: `var(${token})`,
							context: line.trim().substring(0, 80)
						});
					}
				}
			}

			// Check for backdrop-filter without -webkit- prefix
			if (line.includes('backdrop-filter:') && !line.includes('-webkit-backdrop-filter') &&
			    !line.includes('transition') && !line.includes('@supports')) {
				const nearbyLines = blockLines.slice(Math.max(0, idx - 2), idx + 3).join('\n');
				if (!nearbyLines.includes('-webkit-backdrop-filter')) {
					issues.push({
						type: ISSUE_TYPES.MISSING_WEBKIT_BACKDROP,
						line: lineNum,
						current: 'backdrop-filter',
						suggestion: 'Add: -webkit-backdrop-filter: blur(...);',
						context: line.trim().substring(0, 80)
					});
				}
			}

			// Check for hardcoded border-radius values
			if (line.includes('border-radius') && !line.includes('--border-radius')) {
				for (const [value, token] of Object.entries(BORDER_RADIUS_PATTERNS)) {
					const regex = new RegExp(`border-radius:\\s*${value.replace('.', '\\.')}[;\\s]`, 'i');
					if (regex.test(line)) {
						issues.push({
							type: ISSUE_TYPES.HARDCODED_BORDER_RADIUS,
							line: lineNum,
							current: value,
							suggestion: `var(${token})`,
							context: line.trim().substring(0, 80)
						});
					}
				}
			}

			// Check for hardcoded z-index values
			if (line.includes('z-index') && !line.includes('--z-')) {
				for (const [value, token] of Object.entries(ZINDEX_PATTERNS)) {
					const regex = new RegExp(`z-index:\\s*${value}[;\\s]`, 'i');
					if (regex.test(line)) {
						issues.push({
							type: ISSUE_TYPES.HARDCODED_ZINDEX,
							line: lineNum,
							current: value,
							suggestion: `var(${token})`,
							context: line.trim().substring(0, 80)
						});
					}
				}
			}
		});
	}

	// Check for deprecated scrollAnimations.ts usage
	if (filePath.endsWith('.svelte')) {
		lines.forEach((line, idx) => {
			if (line.includes('use:scrollAnimate') || line.includes('scrollAnimations')) {
				issues.push({
					type: ISSUE_TYPES.DEPRECATED_ANIMATION,
					line: idx + 1,
					current: 'scrollAnimations.ts',
					suggestion: 'Use CSS classes: scroll-reveal, scroll-reveal-scale, grid-stagger',
					context: line.trim().substring(0, 80)
				});
			}
		});

		// Check for invalid media queries with var()
		lines.forEach((line, idx) => {
			if (line.includes('@media') && line.includes('var(--')) {
				issues.push({
					type: ISSUE_TYPES.INVALID_MEDIA_QUERY,
					line: idx + 1,
					current: 'var() in @media',
					suggestion: 'Use PostCSS Custom Media: @media (--md)',
					context: line.trim().substring(0, 80)
				});
			}
		});
	}

	return issues;
}

/**
 * Format the audit report
 */
function formatReport(results, rootDir) {
	let output = '\n';
	output += '╔══════════════════════════════════════════════════════════════╗\n';
	output += '║  🎨 CSS Design Audit Report - Warm Earth Tones Edition       ║\n';
	output += '╚══════════════════════════════════════════════════════════════╝\n\n';

	let totalIssues = 0;
	let legacyColorCount = 0;
	const issuesByType = {};
	const fileIssues = [];

	for (const [filePath, issues] of Object.entries(results)) {
		if (issues.length === 0) continue;
		fileIssues.push({ path: filePath, issues });

		for (const issue of issues) {
			totalIssues++;
			issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
			if (issue.type === ISSUE_TYPES.LEGACY_COLOR) {
				legacyColorCount++;
			}
		}
	}

	// Sort by number of issues (most issues first)
	fileIssues.sort((a, b) => b.issues.length - a.issues.length);

	// Print files with issues
	for (const { path: filePath, issues } of fileIssues) {
		const relativePath = relative(rootDir, filePath);
		output += `📄 ${relativePath} (${issues.length} issue${issues.length > 1 ? 's' : ''})\n`;
		output += '─'.repeat(60) + '\n';

		// Group by issue type
		const grouped = {};
		for (const issue of issues) {
			if (!grouped[issue.type]) grouped[issue.type] = [];
			grouped[issue.type].push(issue);
		}

		// Print legacy colors first (most important)
		if (grouped[ISSUE_TYPES.LEGACY_COLOR]) {
			output += '  🔴 LEGACY COLORS (High Priority)\n';
			for (const issue of grouped[ISSUE_TYPES.LEGACY_COLOR]) {
				output += `     Line ${issue.line}: ${issue.current}\n`;
				output += `     → ${issue.suggestion}\n\n`;
			}
			delete grouped[ISSUE_TYPES.LEGACY_COLOR];
		}

		// Print other issues
		for (const [type, typeIssues] of Object.entries(grouped)) {
			output += `  🟡 ${formatIssueType(type)}\n`;
			for (const issue of typeIssues) {
				output += `     Line ${issue.line}: ${issue.current}\n`;
				output += `     → ${issue.suggestion}\n\n`;
			}
		}

		output += '\n';
	}

	// Summary
	output += '═'.repeat(60) + '\n';
	output += '📊 SUMMARY\n';
	output += '─'.repeat(60) + '\n\n';

	if (legacyColorCount > 0) {
		output += `  🔴 Legacy (old blue/teal) colors: ${legacyColorCount}\n`;
		output += '     These are HIGH PRIORITY - remnants of old design system\n\n';
	}

	for (const [type, count] of Object.entries(issuesByType)) {
		if (type !== ISSUE_TYPES.LEGACY_COLOR) {
			output += `  • ${formatIssueType(type)}: ${count}\n`;
		}
	}

	output += '\n';
	output += `  Total: ${totalIssues} issue(s) in ${fileIssues.length} file(s)\n`;

	if (totalIssues === 0) {
		output += '\n✅ No design system issues detected! Design philosophy is consistent.\n';
	} else if (legacyColorCount === 0) {
		output += '\n✅ No legacy colors found - warm earth tone migration complete!\n';
	}

	output += '\n';
	output += '─'.repeat(60) + '\n';
	output += '💡 Design System v2.0: Warm Earth Tones\n';
	output += '   Primary: Terracotta (#9a4419)\n';
	output += '   Accent: Desert Gold (#c4a35a)\n';
	output += '   Text: Warm grays (#2d2820, #7a7267)\n';
	output += '─'.repeat(60) + '\n';

	return output;
}

function formatIssueType(type) {
	const labels = {
		[ISSUE_TYPES.LEGACY_COLOR]: 'Legacy color (old blue/teal)',
		[ISSUE_TYPES.HARDCODED_COLOR]: 'Unknown hardcoded color',
		[ISSUE_TYPES.HARDCODED_SPACING]: 'Hardcoded spacing',
		[ISSUE_TYPES.HARDCODED_DURATION]: 'Hardcoded duration',
		[ISSUE_TYPES.HARDCODED_BORDER_RADIUS]: 'Hardcoded border-radius',
		[ISSUE_TYPES.HARDCODED_ZINDEX]: 'Hardcoded z-index',
		[ISSUE_TYPES.MISSING_WEBKIT_BACKDROP]: 'Missing -webkit-backdrop-filter',
		[ISSUE_TYPES.DEPRECATED_ANIMATION]: 'Deprecated animation pattern',
		[ISSUE_TYPES.INVALID_MEDIA_QUERY]: 'Invalid media query',
		[ISSUE_TYPES.RGBA_COOL_GRAY]: 'Cool gray rgba() value',
		[ISSUE_TYPES.DEPRECATED_TERMINOLOGY]: 'Outdated design terminology',
		[ISSUE_TYPES.OLD_SYSTEM_COLOR_VAR]: 'Old system color variable',
	};
	return labels[type] || type;
}

// Main execution
const targetPath = process.argv[2] || 'src';
const rootDir = process.cwd();
const fullPath = join(rootDir, targetPath);

let files = [];
try {
	const stat = statSync(fullPath);
	if (stat.isDirectory()) {
		files = findFiles(fullPath);
	} else {
		files = [fullPath];
	}
} catch (e) {
	console.error(`Error: Cannot access ${fullPath}`);
	process.exit(1);
}

console.log(`\n🔍 Auditing ${files.length} file(s) for design system compliance...\n`);

const results = {};
for (const file of files) {
	results[file] = analyzeFile(file);
}

console.log(formatReport(results, rootDir));
