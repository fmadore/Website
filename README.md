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
│   └── routes/          # Pages and routes (SvelteKit file-based routing)
│       ├── +page.svelte # Home page
│       ├── +layout.svelte # Main layout (header, footer, navigation)
│       ├── about/+page.svelte # About page
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
