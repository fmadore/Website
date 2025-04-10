# Common Components

Common components are reusable UI elements that don't fit neatly into the atomic design hierarchy but are used extensively throughout the website. They provide consistent UI patterns for common needs across different pages.

## Available Common Components

| Component | Description | Usage |
|-----------|-------------|-------|
| [ToggleButton](./ToggleButton.md) | A button that toggles between two states | Filter options, view toggles |
| [TagList](./TagList.md) | Displays a list of tags/keywords as pills | Publication tags, research topics |
| [Sorter](./Sorter.md) | Controls for sorting a list of items | Publication lists, activity lists |
| [PageHeader](./PageHeader.md) | Standard page header with title and optional description | Section pages |
| [ItemReference](./ItemReference.md) | Link to an entity with metadata | Related items, references |

## Component Design Philosophy

Common components follow these design principles:

1. **Consistency** - Provide consistent UI patterns across the site
2. **Flexibility** - Adaptable to different contexts through props
3. **Simplicity** - Focus on a single responsibility
4. **Accessibility** - Designed to be accessible by default

## Usage Patterns

Common components are typically used within:
- Page layouts
- List displays
- Detail views
- Filter sections

## Example

```svelte
<script>
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import Sorter from '$lib/components/common/Sorter.svelte';
  import TagList from '$lib/components/common/TagList.svelte';
  
  const tags = ['Research', 'Africa', 'Islamic Studies'];
  
  function handleSortChange(event) {
    // Sort logic
  }
</script>

<PageHeader
  title="Publications"
  description="Academic publications on Islamic movements in West Africa"
/>

<div class="controls">
  <Sorter 
    options={['Date', 'Title', 'Relevance']}
    selected="Date"
    onChange={handleSortChange}
  />
</div>

<article>
  <h2>Publication Title</h2>
  <TagList tags={tags} />
  <!-- Content -->
</article>
```