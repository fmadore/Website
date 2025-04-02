# Website Documentation

This documentation covers the key aspects of the website implementation.

## Contents

- [Components](./components/README.md) - Documentation for reusable UI components
- Data Structure - Coming soon
- Styling System - Coming soon
- Routing - Coming soon

## Architecture Overview

The website is built with:

- [SvelteKit](https://kit.svelte.dev/) - The web framework
- Component-based UI architecture
- Responsive design using utility classes
- Client-side filtering and visualization

### Key Design Patterns

1. **Filterable Entity Lists**
   - Publications, communications, and other academic entities follow a common pattern
   - Each list has filters, item displays, and optional visualizations

2. **Reusable Layout Components**
   - Common layouts like `EntityListPageLayout` provide consistent structure
   - Slot-based composition allows for flexible content arrangement

3. **Store-Based Filtering**
   - Filter state managed in Svelte stores
   - Components react to filter changes and update displays accordingly

4. **Event Delegation**
   - Item components dispatch events (e.g., filter requests)
   - Parent components handle these events through callbacks

## Getting Started with Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Visit `http://localhost:5173` to see the site

## Adding New Components

When creating new components:

1. Follow existing naming conventions
2. Add proper TypeScript types for props
3. Consider adding component documentation in the `/docs/components` directory
4. Use existing CSS variables for styling consistency 