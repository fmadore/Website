# Frédérick Madore - Academic Website

This is my personal academic website built with SvelteKit and TailwindCSS. The site is deployed on GitHub Pages.

## Features

- Responsive design for all device sizes
- Detailed pages for research projects, publications, and contact information
- Research project pages with descriptions, methodologies, and outcomes
- Publications organized by type (books, journal articles, etc.)
- Social media integration

## Project Structure

```
Website/
├── .github/workflows/   # GitHub Actions workflows for deployment
├── src/                 # Source files
│   ├── app.css          # Main CSS file with Tailwind imports
│   ├── app.html         # HTML template
│   ├── lib/             # Shared components and utilities
│   │   ├── data/        # Data files for site content
│   │   │   ├── activities/ # Activity data files
│   │   ├── stores/      # Svelte stores
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── routes/          # Pages and routes (SvelteKit file-based routing)
│       ├── +page.svelte # Home page
│       ├── +layout.svelte # Main layout (header, footer, navigation)
│       ├── about/+page.svelte # About page
│       ├── activities/ # Activities pages
│       │   ├── +page.svelte # Activities overview page
│       │   └── [activity-id]/+page.svelte # Individual activity pages
│       ├── publications/+page.svelte # Publications page
│       ├── research/    # Research pages
│       │   ├── +page.svelte # Research overview page
│       │   └── [project-name]/+page.svelte # Individual research projects
│       └── contact/+page.svelte # Contact page
├── static/             # Static assets (images, PDF files, robots.txt)
│   ├── images/         # Image files
│   ├── files/          # CV and other documents
│   └── favicon.png     # Favicon
└── svelte.config.js    # SvelteKit configuration
```

## Development Guide

### Prerequisites

- Node.js (version 18 or higher)
- npm (version 8 or higher)

### Setup

1. Clone this repository
   ```bash
   git clone https://github.com/fmadore/Website.git
   cd Website
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Adding Content

#### Adding a New Research Project

1. Create a new directory under `src/routes/research/` with a URL-friendly name:
   ```bash
   mkdir src/routes/research/your-new-project-name
   ```

2. Create a `+page.svelte` file in this directory with content following the template of existing research pages.

3. Add the project to the `researchProjects` array in `src/routes/research/+page.svelte`.

4. Add a dropdown menu item in `src/routes/+layout.svelte` under the Research section.

#### Adding a New Activity

1. Create a new file in the `src/lib/data/activities/` directory following the template structure:
   ```bash
   cp src/lib/data/activities/activity-template.ts src/lib/data/activities/your-new-activity.ts
   ```

2. Fill in the details for your new activity following the template. Make sure to:
   - Use a unique ID in kebab-case for routing
   - Set the date in ISO format (YYYY-MM-DD)
   - Add appropriate tags
   - Include a descriptive title and content

3. Import and export your activity in `src/lib/data/activities/index.ts`:
   ```typescript
   import { yourNewActivity } from './your-new-activity';
   
   // Add to exports
   export { yourNewActivity };
   
   // Add to the allActivities array
   export const allActivities: Activity[] = [
       // ... existing activities
       yourNewActivity
   ];
   ```

4. The activity will automatically appear in:
   - The activities overview page
   - The latest activities component on the home page
   - Year-based filtered views

Activities are automatically sorted by date (most recent first) and can be filtered by year.

##### Activity Type Structure

Each activity follows the Activity type structure defined in `src/lib/types/activity.ts`:

```typescript
export type Activity = {
    id: string;           // URL-friendly ID for routing
    title: string;        // Activity title
    date: string;         // Display date (e.g., "21 March 2025")
    dateISO: string;      // ISO date format (YYYY-MM-DD) for sorting and internal use
    url?: string;         // External URL if applicable
    year: number;         // Year for filtering
    description: string;  // Short description for list view
    content?: string;     // Full HTML content for detail page
    tags?: string[];      // Optional tags for categorization
    image?: string;       // Optional image path
    heroImage?: {         // Optional hero image configuration
        src: string;      // Path to the image
        alt: string;      // Alt text for accessibility
        caption?: string; // Optional caption for the image
    };
};
```

##### Date Formatting

The website includes utility functions for date formatting in `src/lib/utils/date-formatter.ts`:

- `formatDisplayDate(isoDate: string)`: Converts an ISO date (YYYY-MM-DD) to a display format (e.g., "21 March 2025")
- `getYearFromISODate(isoDate: string)`: Extracts the year from an ISO date string

These are used automatically when defining activities with the proper dateISO field.

##### Latest Activities Component

The site includes a reusable `LatestActivities` component in `src/lib/LatestActivities.svelte` which can be used on any page to display recent activities:

```svelte
<script>
  import LatestActivities from '$lib/LatestActivities.svelte';
</script>

<!-- Display 4 most recent activities with year filters -->
<LatestActivities limit={4} showYearFilters={true} />

<!-- Display 2 most recent activities without year filters -->
<LatestActivities limit={2} showYearFilters={false} />
```

The component:
- Automatically displays the most recent activities from the activities store
- Allows filtering by year (optional)
- Links to individual activity detail pages
- Provides a "View all activities" link to the activities index page

#### Adding Images

1. Place image files in the `static/images/` directory.

2. Reference them in your pages using paths like:
   ```html
   <img src="/images/your-image.jpg" alt="Description" />
   ```

#### Updating Publications

Edit the `publications` object in `src/routes/publications/+page.svelte` to add, remove, or modify publications.

#### Adding/Updating Your CV

1. Place your CV PDF in `static/files/cv.pdf`.
2. It will automatically be linked from the about and home pages.

### Styling and Design

- The site uses Tailwind CSS for styling
- Typography is handled with `@tailwindcss/typography` plugin
- Edit `src/app.css` to customize the base styles
- Styling is applied in-line in each component using Tailwind classes

### Building for Production

To build the site for production:

```bash
npm run build
```

The built files will be in the `build` directory.

## Deployment

### Automatic Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch, using the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

The deployment process:
1. Changes are pushed to the main branch
2. GitHub Actions workflow automatically runs
3. The site is built using SvelteKit
4. The build output is deployed to GitHub Pages
5. The site is available at https://fmadore.github.io/Website/

### Manual Deployment

If you need to deploy manually:

1. Build the site
   ```bash
   npm run build
   ```

2. Commit and push changes to GitHub
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

## Technologies

- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [MDsveX](https://mdsvex.com/) - Markdown processing
- [GitHub Pages](https://pages.github.com/) - Hosting

## SEO Implementation

The website includes extensive SEO (Search Engine Optimization) features:

### Meta Tags

- Each page uses the `SEO.svelte` component to add proper meta tags
- Dynamic title, description, and keywords for all pages
- Open Graph tags for social media sharing
- Twitter Cards for better Twitter previews
- Academic/Scholar meta tags for research visibility

### Structured Data

- JSON-LD structured data for activities, publications, and other content
- Proper schema.org types for academic content (ScholarlyArticle, Book, Event)
- Author and organization information included

### Site Indexing

- Dynamic sitemap.xml generated from all routes and content
- robots.txt file allowing search engines to crawl the site
- Canonical URLs to prevent duplicate content issues

### Usage

To add SEO to a new page:

```svelte
<script>
    import SEO from '$lib/SEO.svelte';
    // Page-specific code
</script>

<SEO 
    title="Page Title | Frédérick Madore"
    description="Page description for search engines."
    keywords="relevant, keywords, for, the, page"
    canonical="https://frederickmadore.com/specific-page" (optional)
    ogImage="/images/specific-page-image.jpg" (optional)
/>

<!-- Page content -->
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.