<script>
  /**
   * @type {string | undefined | null} Optional URL for the card's image.
   */
  export let imageUrl = undefined;

  /**
   * @type {string} Alt text for the image. Defaults to the title.
   */
  export let imageAlt = '';

  /**
   * @type {string | undefined | null} Optional URL to link the title and/or image.
   */
  export let linkUrl = undefined;

  /**
   * @type {string} Target attribute for links (_blank, _self, etc.).
   */
  export let target = '_blank'; // Default to opening external links in new tab

  /**
   * @type {string} The main title for the card.
   */
  export let title = '';

  // Set default imageAlt if not provided
  $: imageAlt = imageAlt || title;

</script>

<div class="card">
  {#if imageUrl}
    <div class="card-image">
      {#if linkUrl}
        <a href={linkUrl} {target} rel="noopener noreferrer">
          <img src={imageUrl} alt={imageAlt} />
        </a>
      {:else}
        <img src={imageUrl} alt={imageAlt} />
      {/if}
    </div>
  {/if}

  <div class="card-body">
    <h2 class="card-title">
      {#if linkUrl}
        <a href={linkUrl} {target} rel="noopener noreferrer">
          {title}
        </a>
      {:else}
        {title}
      {/if}
    </h2>

    {#if $$slots.subtitle}
      <div class="card-subtitle">
        <slot name="subtitle"></slot>
      </div>
    {/if}

    <div class="card-description">
      <slot></slot> <!-- Default slot for main description -->
    </div>

    {#if $$slots.details}
      <div class="card-details">
        <slot name="details"></slot>
      </div>
    {/if}

    {#if $$slots.action}
      <div class="card-action">
        <slot name="action"></slot>
      </div>
    {/if}
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    border-radius: var(--border-radius-lg); /* Use variable */
    overflow: hidden;
    box-shadow: var(--shadow-md); /* Use variable */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    background-color: var(--color-background, white); /* Use variable */
    border: 1px solid var(--color-border);
    height: 100%; /* Make cards in a grid have the same height */
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg); /* Use variable */
  }

  .card-image {
    overflow: hidden;
    max-height: 250px; /* Keep adjustable height */
    background-color: var(--color-gray-100, #f3f4f6); /* Use gray variable */
    flex-shrink: 0;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .card:hover .card-image img {
    transform: scale(1.05);
  }

  .card-body {
    padding: var(--spacing-6); /* Use variable */
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-size: var(--font-size-xl); /* Use variable */
    margin-top: 0;
    margin-bottom: var(--spacing-1); /* Adjust spacing */
    line-height: 1.3;
    font-weight: 600;
    color: var(--color-primary);
  }

  .card-title a {
    color: inherit; /* Inherit color from h2 */
    text-decoration: none;
  }

  .card-title a:hover {
    text-decoration: underline;
  }

  .card-subtitle {
    font-size: var(--font-size-sm); /* Use variable */
    color: var(--color-text-light, #666);
    margin-bottom: var(--spacing-3); /* Use variable */
    line-height: 1.5;
  }

  .card-description {
    margin-bottom: var(--spacing-4); /* Use variable */
    flex-grow: 1; /* Pushes action/details to bottom */
    line-height: 1.6;
  }

  .card-details {
    font-size: 0.9rem; /* Consider variable */
    margin-bottom: var(--spacing-3); /* Use variable */
    line-height: 1.5;
  }
  /* Styling for elements within card-details slot can be added here or passed via classes */

  .card-action {
    margin-top: auto; /* Pushes link to bottom */
    align-self: flex-start; /* Align link to the left */
  }

  /* Default styling for links inside the action slot */
  /* Consumers can override this by styling their slotted element */
  .card-action :global(a) {
    display: inline-block;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .card-action :global(a:hover) {
    color: var(--color-primary-dark);
    text-decoration: underline;
  }

</style> 