# Organisms

Organisms are complex UI components that combine multiple molecules and atoms to create distinct sections of a user interface. They represent larger, more complex pieces of the UI that work as cohesive units.

## Characteristics of Organisms

- Complex components that can contain multiple molecules and atoms
- Represent distinct sections of the interface
- Often correspond to major UI regions (headers, footers, sidebars, etc.)
- Typically specific to the application's domain
- May manage complex state and interactions between child components

## Available Organism Components

| Component | Description | Usage |
|-----------|-------------|-------|
| [Header](./Header.md) | Site header with responsive navigation | Top of every page |
| Footer | Site footer with links and copyright | Bottom of every page |
| LatestActivities | Display of the most recent activities | Home page |
| RelevantPublications | Display of selected publications | Home page |
| RelevantCommunications | Display of selected communications | Home page |

## Designing New Organisms

When creating new organism components:

1. Identify a distinct section of the UI that serves a specific purpose
2. Break down the section into its constituent molecules and atoms
3. Consider the state management and interactions between components
4. Establish clear interfaces for data flow and event handling
5. Document how the organism integrates with the overall page layout

## Implementation Details

### Component Composition Pattern

Organisms typically compose molecules and atoms:

```svelte
<script>
  import MoleculeA from '$lib/components/molecules/MoleculeA.svelte';
  import MoleculeB from '$lib/components/molecules/MoleculeB.svelte';
  import AtomA from '$lib/components/atoms/AtomA.svelte';
  
  // Organism-specific props, state and handlers
</script>

<div class="organism-wrapper">
  <div class="section-one">
    <MoleculeA />
  </div>
  
  <div class="section-two">
    <MoleculeB />
    <AtomA />
  </div>
</div>
```

### State Management Pattern

Organisms often manage complex state that affects multiple child components:

```typescript
// Central state management
let activeItem: number | null = null;
let isExpanded = false;

// State distribution to children
function handleItemActivation(index: number) {
  activeItem = index;
  isExpanded = true;
}

function handleCollapse() {
  isExpanded = false;
}
```

### Event Delegation Pattern

Organisms coordinate events between multiple child components:

```typescript
// In the organism component
function handleMoleculeAEvent(data) {
  // Update some state based on MoleculeA
  
  // Potentially trigger an action in MoleculeB
  moleculeBAction();
}
```

### Responsive Behavior

Organisms typically implement different layouts and behaviors across screen sizes:

```svelte
<style>
  .organism-wrapper {
    display: flex;
    flex-direction: column;
  }
  
  @media (min-width: 768px) {
    .organism-wrapper {
      flex-direction: row;
    }
  }
</style>
```