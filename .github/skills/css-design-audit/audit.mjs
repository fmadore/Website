/**
 * CSS Design Audit Script
 * 
 * This script analyzes Svelte components and CSS files for design system compliance.
 * Run with: node .github/skills/css-design-audit/audit.mjs [path]
 * 
 * Examples:
 *   node .github/skills/css-design-audit/audit.mjs src/lib/components
 *   node .github/skills/css-design-audit/audit.mjs src/lib/components/menu/Header.svelte
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

// Design tokens that should be used instead of hardcoded values
const COLOR_PATTERNS = {
	// Primary blues
	'#1d4ed8': '--color-primary',
	'#1e3a5f': '--color-primary-dark',
	'#3b82f6': '--color-primary-light',
	'#60a5fa': '--color-primary-lighter',
	// Accent teal
	'#14b8a6': '--color-accent',
	'#0d9488': '--color-accent-dark',
	'#2dd4bf': '--color-accent-light',
	// Highlight amber
	'#f59e0b': '--color-highlight',
	'#d97706': '--color-highlight-dark',
	'#fbbf24': '--color-highlight-light',
	// Success emerald
	'#10b981': '--color-success',
	'#059669': '--color-success-dark',
	// Danger red
	'#dc2626': '--color-danger',
	'#b91c1c': '--color-danger-dark',
	'#ef4444': '--color-danger-light',
	// Neutrals (most common)
	'#64748b': '--color-secondary',
	'#475569': '--color-secondary / --color-text-soft',
	'#1e293b': '--color-text',
	'#f8fafc': '--color-surface',
	'#f1f5f9': '--color-surface-alt',
	'#e2e8f0': '--color-border',
};

const SPACING_PATTERNS = {
	'4px': '--space-1',
	'8px': '--space-2',
	'12px': '--space-3',
	'16px': '--space-4',
	'20px': '--space-5',
	'24px': '--space-6',
	'28px': '--space-7',
	'32px': '--space-8',
	'40px': '--space-10',
	'48px': '--space-12',
	'64px': '--space-16',
	'80px': '--space-20',
	'96px': '--space-24',
	'0.25rem': '--space-1',
	'0.5rem': '--space-2',
	'0.75rem': '--space-3',
	'1rem': '--space-4',
	'1.25rem': '--space-5',
	'1.5rem': '--space-6',
	'2rem': '--space-8',
	'2.5rem': '--space-10',
	'3rem': '--space-12',
};

const DURATION_PATTERNS = {
	'75ms': '--duration-instant',
	'150ms': '--duration-fast',
	'200ms': '--duration-normal',
	'300ms': '--duration-slow',
	'500ms': '--duration-slower',
	'700ms': '--duration-slower',
};

// Issue types
const ISSUE_TYPES = {
	HARDCODED_COLOR: 'hardcoded-color',
	HARDCODED_SPACING: 'hardcoded-spacing',
	HARDCODED_DURATION: 'hardcoded-duration',
	MISSING_WEBKIT_BACKDROP: 'missing-webkit-backdrop',
	DEPRECATED_ANIMATION: 'deprecated-animation',
	INVALID_MEDIA_QUERY: 'invalid-media-query',
	MISSING_FOCUS_VISIBLE: 'missing-focus-visible',
	RGBA_INSTEAD_OF_COLOR_MIX: 'rgba-instead-of-color-mix',
};

/**
 * Find all files recursively in a directory
 */
function findFiles(dir, extensions = ['.svelte', '.css']) {
	const results = [];
	
	try {
		const items = readdirSync(dir);
		
		for (const item of items) {
			const fullPath = join(dir, item);
			const stat = statSync(fullPath);
			
			if (stat.isDirectory()) {
				// Skip node_modules, build, .svelte-kit
				if (!['node_modules', 'build', '.svelte-kit', 'dist'].includes(item)) {
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
		return [{ content, startLine: 1 }];
	}
	
	const styleBlocks = [];
	const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
	let match;
	
	while ((match = styleRegex.exec(content)) !== null) {
		const beforeStyle = content.substring(0, match.index);
		const startLine = beforeStyle.split('\n').length;
		styleBlocks.push({
			content: match[1],
			startLine
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
	const styleBlocks = extractStyles(content, filePath);
	
	// Skip the variables.css file - it defines the tokens
	const isVariablesFile = filePath.includes('variables.css');
	
	// Check for hardcoded colors in style blocks
	for (const block of styleBlocks) {
		const blockLines = block.content.split('\n');
		
		blockLines.forEach((line, idx) => {
			const lineNum = block.startLine + idx;
			
			// Skip comments, variable definitions, and @supports fallback blocks
			if (line.trim().startsWith('/*') || line.trim().startsWith('*') || 
			    line.trim().startsWith('//') || line.includes('--sys-color') ||
			    line.includes('--color-') || line.includes('@supports not') ||
			    line.trim().startsWith('--')) {
				return;
			}
			
			// For variables.css, only check for specific issues, not token definitions
			if (isVariablesFile) {
				return; // Skip all checks for the variables file
			}
			
			// Check for hardcoded hex colors
			const hexMatches = line.match(/#[0-9a-fA-F]{3,8}\b/g);
			if (hexMatches) {
				for (const hex of hexMatches) {
					const normalized = hex.toLowerCase();
					if (COLOR_PATTERNS[normalized]) {
						issues.push({
							type: ISSUE_TYPES.HARDCODED_COLOR,
							line: lineNum,
							current: hex,
							suggestion: `var(${COLOR_PATTERNS[normalized]})`,
							context: line.trim()
						});
					}
				}
			}
			
			// Check for rgba() that could use color-mix()
			if (line.includes('rgba(') && !line.includes('color-mix')) {
				issues.push({
					type: ISSUE_TYPES.RGBA_INSTEAD_OF_COLOR_MIX,
					line: lineNum,
					current: 'rgba()',
					suggestion: 'color-mix(in srgb, var(--color-*) XX%, transparent)',
					context: line.trim()
				});
			}
			
			// Check for hardcoded spacing (but not in variable definitions, calc, or transition properties)
			if (!line.includes('--space') && !line.includes('calc(') && 
			    !line.includes('transition') && !line.includes('min-width') && 
			    !line.includes('min-height') && !line.includes('max-width') &&
			    !line.includes('max-height')) {
				for (const [value, token] of Object.entries(SPACING_PATTERNS)) {
					// Match the value when it's used as a property value (more strict matching)
					const regex = new RegExp(`:\\s*${value.replace('.', '\\.')}[;\\s]`, 'i');
					if (regex.test(line)) {
						// Skip icon sizes (width/height on small elements)
						if ((line.includes('width') || line.includes('height')) && 
						    ['8px', '12px', '16px', '20px', '24px'].includes(value)) {
							// These might be intentional icon sizes - flag but note
							issues.push({
								type: ISSUE_TYPES.HARDCODED_SPACING,
								line: lineNum,
								current: value,
								suggestion: `var(${token}) [Note: May be intentional icon size]`,
								context: line.trim()
							});
						} else {
							issues.push({
								type: ISSUE_TYPES.HARDCODED_SPACING,
								line: lineNum,
								current: value,
								suggestion: `var(${token})`,
								context: line.trim()
							});
						}
					}
				}
			}
			
			// Check for hardcoded durations (but not in variable definitions or custom property values)
			if (!line.includes('--duration') && !line.includes('--anim-duration') &&
			    !line.includes('--stagger') && !line.trim().startsWith('--')) {
				for (const [value, token] of Object.entries(DURATION_PATTERNS)) {
					if (line.includes(value) && !line.includes(`var(${token})`)) {
						issues.push({
							type: ISSUE_TYPES.HARDCODED_DURATION,
							line: lineNum,
							current: value,
							suggestion: `var(${token})`,
							context: line.trim()
						});
					}
				}
			}
			
			// Check for backdrop-filter without -webkit- prefix
			// But skip transition properties and @supports queries
			if (line.includes('backdrop-filter:') && !line.includes('-webkit-backdrop-filter') &&
			    !line.includes('transition') && !line.includes('@supports')) {
				// Look for webkit version nearby
				const nearbyLines = blockLines.slice(Math.max(0, idx - 2), idx + 3).join('\n');
				if (!nearbyLines.includes('-webkit-backdrop-filter')) {
					issues.push({
						type: ISSUE_TYPES.MISSING_WEBKIT_BACKDROP,
						line: lineNum,
						current: 'backdrop-filter',
						suggestion: 'Add: -webkit-backdrop-filter: blur(...);',
						context: line.trim()
					});
				}
			}
		});
	}
	
	// Check for deprecated scrollAnimations.ts usage in Svelte files
	if (filePath.endsWith('.svelte')) {
		lines.forEach((line, idx) => {
			if (line.includes('use:scrollAnimate') || line.includes('scrollAnimations')) {
				issues.push({
					type: ISSUE_TYPES.DEPRECATED_ANIMATION,
					line: idx + 1,
					current: 'scrollAnimations.ts',
					suggestion: 'Use CSS classes: scroll-reveal, scroll-reveal-scale, grid-stagger',
					context: line.trim()
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
					context: line.trim()
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
	let output = '\n📋 CSS Design Audit Report\n';
	output += '═'.repeat(50) + '\n\n';
	
	let totalIssues = 0;
	const issuesByType = {};
	
	for (const [filePath, issues] of Object.entries(results)) {
		if (issues.length === 0) continue;
		
		const relativePath = relative(rootDir, filePath);
		output += `📄 ${relativePath}\n`;
		output += '─'.repeat(40) + '\n';
		
		for (const issue of issues) {
			output += `  Line ${issue.line}: ${formatIssueType(issue.type)}\n`;
			output += `    Current: ${issue.current}\n`;
			output += `    → ${issue.suggestion}\n`;
			if (issue.context) {
				output += `    Context: ${issue.context.substring(0, 60)}${issue.context.length > 60 ? '...' : ''}\n`;
			}
			output += '\n';
			
			totalIssues++;
			issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
		}
		
		output += '\n';
	}
	
	// Summary
	output += '─'.repeat(50) + '\n';
	output += `📊 Summary: ${totalIssues} issue(s) found\n\n`;
	
	for (const [type, count] of Object.entries(issuesByType)) {
		output += `  • ${formatIssueType(type)}: ${count}\n`;
	}
	
	if (totalIssues === 0) {
		output += '✅ No design system issues detected!\n';
	}
	
	return output;
}

function formatIssueType(type) {
	const labels = {
		[ISSUE_TYPES.HARDCODED_COLOR]: 'Hardcoded color',
		[ISSUE_TYPES.HARDCODED_SPACING]: 'Hardcoded spacing',
		[ISSUE_TYPES.HARDCODED_DURATION]: 'Hardcoded duration',
		[ISSUE_TYPES.MISSING_WEBKIT_BACKDROP]: 'Missing -webkit-backdrop-filter',
		[ISSUE_TYPES.DEPRECATED_ANIMATION]: 'Deprecated animation pattern',
		[ISSUE_TYPES.INVALID_MEDIA_QUERY]: 'Invalid media query',
		[ISSUE_TYPES.MISSING_FOCUS_VISIBLE]: 'Missing focus-visible state',
		[ISSUE_TYPES.RGBA_INSTEAD_OF_COLOR_MIX]: 'Consider color-mix() over rgba()',
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

console.log(`\n🔍 Auditing ${files.length} file(s)...\n`);

const results = {};
for (const file of files) {
	results[file] = analyzeFile(file);
}

console.log(formatReport(results, rootDir));
