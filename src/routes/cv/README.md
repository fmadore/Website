# CV Component Structure

This document describes the refactored CV page architecture.

## Overview

The CV page has been refactored from a single ~750-line file into a modular component-based structure for improved maintainability and code organization.

## Structure

```
src/routes/cv/
├── +page.svelte                 # Main container (now ~100 lines)
├── components/                   # Section components
│   ├── CVHeader.svelte          # Contact information and header
│   ├── CVEducation.svelte       # Education section
│   ├── CVAppointments.svelte    # Professional appointments
│   ├── CVPublications.svelte    # Publications section
│   ├── CVGrants.svelte          # Grants and fellowships
│   ├── CVAwards.svelte          # Awards and honors
│   ├── CVConferences.svelte     # Conference participation
│   ├── CVEvents.svelte          # Academic events organization
│   ├── CVInvitedTalks.svelte    # Invited talks
│   ├── CVMedia.svelte           # Media appearances
│   ├── CVService.svelte         # Service to profession
│   ├── CVAffiliations.svelte    # Professional affiliations
│   └── CVFieldwork.svelte       # Fieldwork section
└── utils/
    └── cvFormatters.ts          # Shared utility functions
```

## Components

### CVHeader.svelte
- Displays CV title, name, and contact information
- Includes icons for email, LinkedIn, GitHub, and ORCID
- Responsive layout for contact links

### CVEducation.svelte
- Filters and displays education by type (Degrees, Trainings, Certificates)
- Shows thesis titles and additional details
- Conditional rendering for empty sections

### CVAppointments.svelte
- Lists professional appointments chronologically
- Displays institution, location, and date ranges
- Includes optional details

### CVPublications.svelte
- Groups publications by type using utility functions
- Formats citations according to publication type
- Handles DOI and external links
- Supports multiple publication formats (books, articles, chapters, etc.)

### CVGrants.svelte
- Displays grants and fellowships
- Shows funding amounts and status
- Includes date ranges and details

### CVAwards.svelte
- Lists awards and honors
- Shows institution and year
- Includes optional details

### CVConferences.svelte
- Organizes conference participation into:
  - Panels organised
  - Papers presented
- Formats dates and locations
- Conditional rendering based on data availability

### CVEvents.svelte
- Lists organized academic events
- Shows event details, conference, and location
- Conditionally renders only if events exist

### CVInvitedTalks.svelte
- Displays invited lectures and seminars
- Shows authors (if multiple), title, venue, and date
- Conditionally renders only if talks exist

### CVMedia.svelte
- Lists media appearances (interviews, features)
- Shows outlet, program, topic, and links
- Formats dates in readable format

### CVService.svelte
- Combines peer review activities and editorial memberships
- Shows journal/publisher information
- Includes Publons records for reviews
- Conditional rendering for each subsection

### CVAffiliations.svelte
- Lists professional affiliations
- Shows roles and date periods using utility formatter
- Displays parent organizations and links
- Supports nested role hierarchies

### CVFieldwork.svelte
- Groups fieldwork by location
- Aggregates years for each location
- Sorts locations alphabetically

## Utilities

### cvFormatters.ts
Contains shared formatting functions:

- `getPublicationTypeDisplayName(type)` - Converts publication types to display names
- `formatVolumeIssueDisplay(volume, issue)` - Formats journal volume/issue info
- `formatAffiliationPeriod(period)` - Formats date ranges for affiliations
- `groupPublicationsByType(publications)` - Groups and filters publications

## Benefits

1. **Maintainability**: Each section is self-contained and easier to update
2. **Reusability**: Components can be imported elsewhere if needed
3. **Testing**: Individual sections can be tested in isolation
4. **Performance**: Better code splitting and lazy loading potential
5. **Readability**: Main page is now a clean layout template (~100 lines vs ~750)
6. **Collaboration**: Multiple developers can work on different sections without conflicts
7. **Debugging**: Easier to identify and fix issues in specific sections

## Main Page (+page.svelte)

The main page now serves as a simple container:
- Imports all component modules
- Provides SEO metadata
- Includes PDF generator
- Wraps components in styled container
- Contains print-specific styles (global scope for all components)

## Styling

- Component-specific styles remain in each component
- Print styles are centralized in the main page using `:global()` selectors
- Responsive behavior is maintained in individual components
- Glassmorphism and theme support is preserved

## Data Flow

Each component:
1. Imports its required data from `$lib/data/`
2. Performs any necessary filtering or transformation
3. Renders its section independently
4. Uses shared utilities from `cvFormatters.ts` when needed

This architecture allows data to be managed independently per section while sharing common formatting logic.
