# Card

A versatile card component for displaying content with an optional image, title, and various content sections.

## Usage

```svelte
<script>
  import Card from '$lib/components/Card.svelte';
</script>

<Card 
  title="Research Project" 
  imageUrl="/images/project-photo.jpg"
  linkUrl="/projects/research-project"
  target="_self"
>
  <svelte:fragment slot="subtitle">
    2020-2022 • Collaborative Research
  </svelte:fragment>
  
  <p>This research project focused on exploring new methodologies...</p>
  
  <svelte:fragment slot="details">
    <div>Lead Researcher: Dr. Jane Smith</div>
    <div>Funding: National Science Foundation</div>
  </svelte:fragment>
  
  <svelte:fragment slot="action">
    <a href="/projects/research-project" class="btn btn-primary">Learn More</a>
  </svelte:fragment>
</Card>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageUrl` | `string \| undefined \| null` | `undefined` | Optional URL for the card's image |
| `imageAlt` | `string` | `''` (falls back to title) | Alt text for the image |
| `linkUrl` | `string \| undefined \| null` | `undefined` | Optional URL to link the title and image |
| `target` | `string` | `'_blank'` | Target attribute for links (`_blank`, `_self`, etc.) |
| `title` | `string` | `''` | The main title for the card |

## Slots

| Name | Description |
|------|-------------|
| default | The main content/description of the card |
| `subtitle` | Optional subtitle displayed below the title |
| `details` | Additional details displayed below the main content |
| `action` | Action elements like buttons or links, displayed at the bottom |

## Styling

The card includes transitions and hover effects:
- Shadow depth increases on hover
- Card slightly elevates on hover
- Images scale slightly on hover

The component uses CSS variables for theming:
- `--color-background`: Card background color
- `--color-border`: Card border color
- `--color-primary`: Used for title and links
- `--color-primary-dark`: Used for link hover state
- `--shadow-md`, `--shadow-lg`: For card shadow states
- Various spacing variables (`--spacing-*`)

## Example

```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each publications as publication}
    <Card
      title={publication.title}
      imageUrl={publication.coverImage}
      linkUrl={`/publications/${publication.id}`}
      target="_self"
    >
      <svelte:fragment slot="subtitle">
        {publication.year} • {publication.type}
      </svelte:fragment>
      
      <p>{publication.abstract?.substring(0, 150)}...</p>
      
      <svelte:fragment slot="details">
        {#if publication.authors}
          <div>{publication.authors.join(', ')}</div>
        {/if}
        {#if publication.publisher}
          <div>{publication.publisher}</div>
        {/if}
      </svelte:fragment>
      
      <svelte:fragment slot="action">
        <a href={`/publications/${publication.id}`}>Read more</a>
      </svelte:fragment>
    </Card>
  {/each}
</div>
``` 