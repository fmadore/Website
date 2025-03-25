<script>
    // Data for latest activities
    const latestActivities = [
        {
            title: "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023",
            date: "21 March 2025",
            url: "/research/religious-activism-campuses-togo-benin"
        },
        {
            title: "Établir une faîtière islamique à l'échelle nationale: le cas de 4 pays d'Afrique de l'Ouest francophone",
            date: "4 March 2025",
            url: "/research/etablir-une-faitiere-islamique"
        },
        {
            title: "Author Meets Critic. Faith-based Student Activism in Togo and Benin: Muslims and Christians on University Campuses",
            date: "9 December 2024",
            url: "/conference-activity/author-meets-critic-faith-based-student-activism"
        }
    ];

    // Years with content
    const years = [
        { year: 2025, count: 2 },
        { year: 2024, count: 13 },
        { year: 2023, count: 10 },
        { year: 2022, count: 13 },
        { year: 2020, count: 1 },
        { year: 2016, count: 1 }
    ];
</script>

<div class="prose prose-lg max-w-none">
    <h1 class="text-4xl font-bold mb-8">About</h1>

    <p>I am a Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO), where I work in the research unit "Religion and Intellectual Culture". My research focuses on the history of Islam and Muslim societies in francophone West Africa from the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining Islamic activism among youth and women, their appropriation of (new) media, and Muslim politics.</p>
    
    <p>My recent book, <em>Religious Activism on Campuses in Togo and Benin</em>, examines how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi. Drawing on extensive archival research and interviews with several generations of activists, I show how these faith-based organisations emerged in the 1970s within institutions dominated by leftist and secular ideologies, and ultimately reshaped campus culture by offering students both spiritual guidance and practical support.</p>
    
    <p>A significant part of my work involves digital humanities (DH), with a focus on the <em>Islam West Africa Collection</em> (IWAC). This open-access digital database contains over 12,500 documents and 850 bibliographical references on Islam in six West African countries, comprising over 22 million words. To analyse this vast corpus, I use artificial intelligence and machine learning techniques to uncover patterns and trends in Francophone West African Muslim societies that traditional research methods might miss. This innovative approach brings fresh perspectives to the field, combining historical expertise with cutting-edge computational analysis.</p>
    
    <p>I am the author of <em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em> (Presses de l'Université Laval/Hermann, 2016) and co-editor of <em>Religiosity on University Campuses in Africa: Trends and Experiences</em> (Lit Verlag, 2023). I have also co-edited two special journal issues: "Muslim Minorities in Africa, Part 1 & Part 2" (<em>Islamic Africa</em>, 2021-22) and "​Les acteurs religieux africains à l'ère du numérique" (<em>Émulations</em>, 2017). My research has been published in eleven peer-reviewed journals and six edited volumes.</p>
    
    <p>Prior to my current position, I was a Banting Postdoctoral Fellow at the Center for African Studies at the University of Florida, and a Part-Time Professor at the University of Ottawa. I received my Ph.D. in History from the Université Laval (Canada) in 2018 with distinction.</p>
    
    <p>Since 2025, I have been working as a consultant for Communitology, a US-based company that integrates social science expertise into asylum and immigration processes. In this role, I prepare specialised Country of Origin Information (COI) reports for cases focusing on Benin, Togo, and Côte d'Ivoire.</p>
    
    <p>Through my ongoing research and DH projects, I continue to explore new approaches to understanding the dynamics of Muslim societies in Francophone West Africa, combining traditional historical methods with innovative computational techniques.</p>
    
    <a href="/files/cv.pdf" class="inline-block mt-4 mb-8 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">CV</a>
    
    <h2 class="text-2xl font-bold mt-10 mb-6">Latest activities</h2>
    
    <ul class="list-none p-0 space-y-4">
        {#each latestActivities as activity}
            <li class="border-l-4 border-gray-300 pl-4">
                <a href={activity.url} class="text-gray-900 hover:text-gray-700 font-medium">
                    {activity.title}
                </a>
                <span class="block text-sm text-gray-500 mt-1">{activity.date}</span>
            </li>
        {/each}
    </ul>
    
    <a href="/activities" class="inline-block mt-4 text-sm font-medium">
        See more
    </a>
    
    <div class="mt-6 flex flex-wrap gap-2">
        {#each years as {year, count}}
            <a href={`/activities?year=${year}`} class="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">
                {year} ({count})
            </a>
        {/each}
    </div>
</div>
