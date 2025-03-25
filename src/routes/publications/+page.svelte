<script>
    // Publication types and their corresponding publications
    const publications = {
        books: [
            {
                title: "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023",
                publisher: "Oxford University Press",
                year: 2024,
                url: "https://example.com/book1"
            },
            {
                title: "La construction d'une sphère publique musulmane en Afrique de l'Ouest",
                publisher: "Presses de l'Université Laval/Hermann",
                year: 2016,
                url: "https://example.com/book2"
            }
        ],
        editedVolumes: [
            {
                title: "Religiosity on University Campuses in Africa: Trends and Experiences",
                publisher: "Lit Verlag",
                year: 2023,
                coEditors: ["John Smith", "Mary Johnson"],
                url: "https://example.com/edited1"
            }
        ],
        specialIssues: [
            {
                title: "Muslim Minorities in Africa, Part 1 & Part 2",
                journal: "Islamic Africa",
                years: "2021-22",
                coEditors: ["Jane Brown"],
                url: "https://example.com/special1"
            },
            {
                title: "Les acteurs religieux africains à l'ère du numérique",
                journal: "Émulations",
                years: "2017",
                coEditors: ["Pierre Dupont"],
                url: "https://example.com/special2"
            }
        ],
        journalArticles: [
            {
                title: "Faith-Based Organizing in West African Universities: Muslim Student Associations in Benin and Togo, 1980-2020",
                journal: "Journal of Religion in Africa",
                volume: "53",
                issue: "1-2",
                year: 2023,
                pages: "67-93",
                url: "https://example.com/article1"
            },
            {
                title: "Digital Islam in Francophone West Africa: Evolving Uses of Social Media",
                journal: "Islamic Africa",
                volume: "12",
                issue: "2",
                year: 2021,
                pages: "184-209",
                url: "https://example.com/article2"
            },
            {
                title: "Muslim Minorities and Religious Freedom in Coastal Benin",
                journal: "Journal of West African Studies",
                volume: "35",
                issue: "4",
                year: 2020,
                pages: "415-437",
                url: "https://example.com/article3"
            }
        ],
        bookChapters: [
            {
                title: "Youth and Islamic Activism in Burkina Faso",
                book: "Religious Activism in Africa",
                editors: "Thomas Wilson and Sarah Johnson",
                publisher: "Routledge",
                year: 2022,
                pages: "112-134",
                url: "https://example.com/chapter1"
            },
            {
                title: "Women's Islamic Organizations in Côte d'Ivoire",
                book: "Women and Religion in West Africa",
                editors: "Elizabeth Brown",
                publisher: "Oxford University Press",
                year: 2021,
                pages: "203-225",
                url: "https://example.com/chapter2"
            }
        ]
    };
</script>

<div class="prose prose-lg max-w-none">
    <h1 class="text-4xl font-bold mb-8">Publications</h1>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Books</h2>
        <ul class="space-y-4">
            {#each publications.books as book}
                <li>
                    <a href={book.url} class="text-blue-600 hover:text-blue-800 font-semibold">
                        {book.title}
                    </a>
                    <p class="text-gray-700">{book.publisher}, {book.year}</p>
                </li>
            {/each}
        </ul>
    </div>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Edited Volumes</h2>
        <ul class="space-y-4">
            {#each publications.editedVolumes as volume}
                <li>
                    <a href={volume.url} class="text-blue-600 hover:text-blue-800 font-semibold">
                        {volume.title}
                    </a>
                    <p class="text-gray-700">
                        {#if volume.coEditors.length > 0}
                            Co-edited with {volume.coEditors.join(', ')}.
                        {/if}
                        {volume.publisher}, {volume.year}
                    </p>
                </li>
            {/each}
        </ul>
    </div>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Special Journal Issues</h2>
        <ul class="space-y-4">
            {#each publications.specialIssues as issue}
                <li>
                    <a href={issue.url} class="text-blue-600 hover:text-blue-800 font-semibold">
                        {issue.title}
                    </a>
                    <p class="text-gray-700">
                        {issue.journal}, {issue.years}
                        {#if issue.coEditors.length > 0}
                            <br>Co-edited with {issue.coEditors.join(', ')}
                        {/if}
                    </p>
                </li>
            {/each}
        </ul>
    </div>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Journal Articles</h2>
        <ul class="space-y-4">
            {#each publications.journalArticles as article}
                <li>
                    <a href={article.url} class="text-blue-600 hover:text-blue-800 font-semibold">
                        {article.title}
                    </a>
                    <p class="text-gray-700">
                        <em>{article.journal}</em>, vol. {article.volume}, no. {article.issue}, {article.year}, pp. {article.pages}
                    </p>
                </li>
            {/each}
        </ul>
    </div>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Book Chapters</h2>
        <ul class="space-y-4">
            {#each publications.bookChapters as chapter}
                <li>
                    <a href={chapter.url} class="text-blue-600 hover:text-blue-800 font-semibold">
                        {chapter.title}
                    </a>
                    <p class="text-gray-700">
                        In <em>{chapter.book}</em>, edited by {chapter.editors}. {chapter.publisher}, {chapter.year}, pp. {chapter.pages}
                    </p>
                </li>
            {/each}
        </ul>
    </div>
</div> 