# Frédérick Madore - Academic Website

This is my personal academic website built with SvelteKit and TailwindCSS. The site is deployed on GitHub Pages.

## Features

- Responsive design for all device sizes
- Detailed pages for research projects, publications, and contact information
- Research project pages with descriptions, methodologies, and outcomes
- Publications organized by type (books, journal articles, etc.)
- Social media integration

## Development

### Prerequisites

- Node.js (version 18 or higher)
- npm (version 8 or higher)

### Setup

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/Website.git
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

### Building for Production

To build the site for production:

```bash
npm run build
```

The built files will be in the `build` directory.

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch, using the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

## Technologies

- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [MDsveX](https://mdsvex.com/) - Markdown processing
- [GitHub Pages](https://pages.github.com/) - Hosting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
