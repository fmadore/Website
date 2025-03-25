<script>
    import SEO from '$lib/SEO.svelte';
    import { publicationsByType, publicationsByYear } from '$lib/data/publications';

    // Get publications grouped by type
    const books = publicationsByType['book'] || [];
    const articles = publicationsByType['article'] || [];
    const chapters = publicationsByType['chapter'] || [];

    // Get the most recent year for sorting
    const years = Object.keys(publicationsByYear).map(Number).sort((a, b) => b - a);
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div class="prose">
    <h1 class="publications-title">Publications</h1>
    
    {#each years as year}
        <div class="year-section">
            <h2 class="year-title">{year}</h2>
            
            {#if publicationsByYear[year].some(pub => pub.type === 'book')}
                <div class="publications-section">
                    <h3 class="publication-type">Books</h3>
                    <ul class="publication-list">
                        {#each publicationsByYear[year].filter(pub => pub.type === 'book') as book}
                            <li class="publication-item">
                                <div class="publication-layout">
                                    {#if book.heroImage?.src || book.image}
                                        <div class="publication-image">
                                            <img 
                                                src={book.heroImage?.src || book.image} 
                                                alt={book.heroImage?.alt || `Cover of ${book.title}`}
                                                class="cover-image"
                                            />
                                            {#if book.heroImage?.caption}
                                                <div class="image-caption">{book.heroImage.caption}</div>
                                            {/if}
                                        </div>
                                    {/if}
                                    
                                    <div class="publication-content">
                                        <div class="publication-title">
                                            <a href={book.url}>
                                                {book.title}
                                            </a>
                                        </div>
                                        <p class="publication-meta">
                                            {book.authors.join(', ')}. {book.publisher}, {book.placeOfPublication}, {book.year}
                                            {#if book.isbn}
                                                <br>ISBN: {book.isbn}
                                            {/if}
                                        </p>
                                        <p class="publication-abstract">{book.abstract}</p>
                                        {#if book.tags && book.tags.length > 0}
                                            <div class="publication-tags">
                                                {#each book.tags as tag}
                                                    <span class="tag">{tag}</span>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if publicationsByYear[year].some(pub => pub.type === 'article')}
                <div class="publications-section">
                    <h3 class="publication-type">Journal Articles</h3>
                    <ul class="publication-list">
                        {#each publicationsByYear[year].filter(pub => pub.type === 'article') as article}
                            <li class="publication-item">
                                <div class="publication-layout">
                                    {#if article.heroImage?.src || article.image}
                                        <div class="publication-image">
                                            <img 
                                                src={article.heroImage?.src || article.image} 
                                                alt={article.heroImage?.alt || `Image for ${article.title}`}
                                                class="cover-image"
                                            />
                                            {#if article.heroImage?.caption}
                                                <div class="image-caption">{article.heroImage.caption}</div>
                                            {/if}
                                        </div>
                                    {/if}
                                    
                                    <div class="publication-content">
                                        <div class="publication-title">
                                            <a href={article.url}>
                                                {article.title}
                                            </a>
                                        </div>
                                        <p class="publication-meta">
                                            {article.authors.join(', ')}. {article.journal}, {article.year}
                                            {#if article.volume}
                                                <br>Vol. {article.volume}
                                                {#if article.issue}
                                                    , No. {article.issue}
                                                {/if}
                                            {/if}
                                            {#if article.pages}
                                                , pp. {article.pages}
                                            {/if}
                                        </p>
                                        <p class="publication-abstract">{article.abstract}</p>
                                        {#if article.tags && article.tags.length > 0}
                                            <div class="publication-tags">
                                                {#each article.tags as tag}
                                                    <span class="tag">{tag}</span>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if publicationsByYear[year].some(pub => pub.type === 'chapter')}
                <div class="publications-section">
                    <h3 class="publication-type">Book Chapters</h3>
                    <ul class="publication-list">
                        {#each publicationsByYear[year].filter(pub => pub.type === 'chapter') as chapter}
                            <li class="publication-item">
                                <div class="publication-layout">
                                    {#if chapter.heroImage?.src || chapter.image}
                                        <div class="publication-image">
                                            <img 
                                                src={chapter.heroImage?.src || chapter.image} 
                                                alt={chapter.heroImage?.alt || `Image for ${chapter.title}`}
                                                class="cover-image"
                                            />
                                            {#if chapter.heroImage?.caption}
                                                <div class="image-caption">{chapter.heroImage.caption}</div>
                                            {/if}
                                        </div>
                                    {/if}
                                    
                                    <div class="publication-content">
                                        <div class="publication-title">
                                            <a href={chapter.url}>
                                                {chapter.title}
                                            </a>
                                        </div>
                                        <p class="publication-meta">
                                            {chapter.authors.join(', ')}. In <em>{chapter.book}</em>, edited by {chapter.editors}. 
                                            {chapter.publisher}, {chapter.placeOfPublication}, {chapter.year}
                                            {#if chapter.pages}
                                                , pp. {chapter.pages}
                                            {/if}
                                        </p>
                                        <p class="publication-abstract">{chapter.abstract}</p>
                                        {#if chapter.tags && chapter.tags.length > 0}
                                            <div class="publication-tags">
                                                {#each chapter.tags as tag}
                                                    <span class="tag">{tag}</span>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .year-section {
        margin-bottom: 2rem;
    }

    .year-title {
        color: #4a5568;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .publications-section {
        margin-bottom: 1.5rem;
    }

    .publication-type {
        color: #2d3748;
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }

    .publication-list {
        list-style: none;
        padding: 0;
    }

    .publication-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .publication-layout {
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
    }

    .publication-image {
        flex: 0 0 150px;
    }

    .cover-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .image-caption {
        font-size: 0.75rem;
        color: #718096;
        margin-top: 0.5rem;
        text-align: center;
    }

    .publication-content {
        flex: 1;
    }

    .publication-title {
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .publication-title a {
        color: #2b6cb0;
        text-decoration: none;
    }

    .publication-title a:hover {
        text-decoration: underline;
    }

    .publication-meta {
        color: #4a5568;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .publication-abstract {
        color: #4a5568;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
    }

    .publication-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .tag {
        background-color: #e2e8f0;
        color: #4a5568;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.8rem;
    }

    .edited-with {
        font-style: italic;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .publication-layout {
            flex-direction: column;
        }

        .publication-image {
            flex: 0 0 auto;
            margin-bottom: 1rem;
            max-width: 200px;
        }
    }
</style> 