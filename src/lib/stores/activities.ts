import { writable } from 'svelte/store';

export type Activity = {
    id: string;           // URL-friendly ID for routing
    title: string;        // Activity title
    date: string;         // Display date
    url?: string;         // External URL if applicable
    year: number;         // Year for filtering
    description: string;  // Short description for list view
    content?: string;     // Full HTML content for detail page
    tags?: string[];      // Optional tags for categorization
    image?: string;       // Optional image path
};

// Default activities data
const defaultActivities: Activity[] = [
    {
        id: "religious-activism-on-campuses-in-togo-and-benin",
        title: "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023",
        date: "21 March 2025",
        year: 2025,
        description: "New book publication based on research conducted at Leibniz-Zentrum Moderner Orient since 2021.",
        content: `
            <p>I'm delighted to announce the publication of my new book, <em>Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023</em>, based on research conducted at Leibniz-Zentrum Moderner Orient since 2021 as part of the project "Religion, Morality and Boko in West Africa: Students Training for a Good Life" (Remoboko). It's taken a little longer than expected to complete, but I'm excited to finally share it with you. The book is in open access and the PDF can be downloaded for free.</p>
            
            <h2>Abstract</h2>
            
            <p>The interplay between religion and student activism at the universities of Abomey-Calavi (Benin) and Lomé (Togo) has often been overlooked, although faith-based organisations and student unions have coexisted since the 1970s. Based on interviews with different generations of activists, this book uncovers the neglected history of Christian and Muslim student associations on these campuses, originally strongholds of leftist and secular ideologies. It analyses the emergence of these groups under a Marxist-Leninist regime in Benin and a one-party dictatorship in Togo, and explores the implications of growing religiosity for these public universities as secular institutions.</p>
            
            <p>The history of these associations reveals the campus as a microcosm reflecting wider national socio-political life, while also highlighting the importance of translocal factors in shaping the internal dynamics of these groups. Amidst the massification of university enrolments and rising graduate unemployment, faith-based associations have come to provide more than religious guidance. Increasingly, they offer a "social curriculum", providing a space for socialisation and a set of skills, norms and moral values that complement the secular academic curriculum.</p>
        `,
        tags: ["book", "publication", "research", "universities", "togo", "benin"]
    },
    {
        id: "etablir-une-faitiere-islamique",
        title: "Établir une faîtière islamique à l'échelle nationale: le cas de 4 pays d'Afrique de l'Ouest francophone",
        date: "4 March 2025",
        year: 2025,
        description: "Comparative analysis of national Islamic umbrella organizations in four West African countries.",
        content: `
            <p>This article presents a comparative analysis of the establishment of national Islamic umbrella organizations in four Francophone West African countries: Côte d'Ivoire, Burkina Faso, Togo, and Benin. Drawing on extensive fieldwork and archival research, it explores the various models of religious governance and the dynamics of Muslim institutional representation in these countries.</p>
            
            <p>The study examines both the state initiatives to regulate Islamic affairs and the internal Muslim community efforts to create unified representative bodies. It highlights the challenges of religious governance in pluralistic societies and the complex negotiations between religious autonomy and state oversight.</p>
        `,
        tags: ["article", "research", "islam", "west africa", "religious governance"]
    },
    {
        id: "author-meets-critic-faith-based-student-activism",
        title: "Author Meets Critic. Faith-based Student Activism in Togo and Benin: Muslims and Christians on University Campuses",
        date: "9 December 2024",
        year: 2024,
        description: "Panel discussion at the American Academy of Religion annual meeting.",
        content: `
            <p>I participated in an "Author Meets Critics" session at the American Academy of Religion annual meeting in San Diego, where my book on faith-based student activism in Togo and Benin was the focus of discussion. The panel brought together scholars from religious studies, anthropology, and African studies to engage with the book's findings and implications.</p>
            
            <p>The discussion explored the significance of religious activism on secular university campuses, the methodological challenges of studying faith-based groups in academic settings, and the theoretical contributions of the book to understanding the interplay between religion, education, and politics in West Africa.</p>
            
            <p>I am grateful to the panel organizers and participants for their insightful comments and questions, which have already prompted me to think about future research directions and potential collaborations.</p>
        `,
        tags: ["conference", "book", "panel", "AAR", "discussion"]
    },
    {
        id: "guest-lecture-university-of-florida",
        title: "Guest lecture at University of Florida",
        date: "22 November 2023",
        year: 2023,
        description: "Invited lecture on Islamic activism in West Africa at the Center for African Studies.",
        content: `
            <p>I delivered a guest lecture at the Center for African Studies at the University of Florida, where I previously served as a Banting Postdoctoral Fellow. The lecture, titled "Digital Approaches to Studying Islamic Activism in West Africa," presented findings from my ongoing work with the Islam West Africa Collection.</p>
            
            <p>The talk demonstrated how computational methods and digital humanities approaches can complement traditional historical and ethnographic research on religious movements. I presented several case studies showing how text mining, network analysis, and other digital tools can reveal patterns and connections that might be missed through conventional research methods.</p>
            
            <p>The lecture was followed by a lively discussion with faculty and graduate students, which generated valuable feedback and suggestions for further developing the digital dimensions of my research.</p>
        `,
        tags: ["lecture", "digital humanities", "teaching", "islamic activism"]
    }
];

// Create a writable store with the default activities
export const activities = writable<Activity[]>(defaultActivities);

// Helper function to add a new activity
export function addActivity(activity: Activity) {
    activities.update(items => {
        return [activity, ...items];
    });
}

// Helper function to get activities by year
export function getActivitiesByYear(year: number) {
    let filteredActivities: Activity[] = [];
    
    activities.subscribe(value => {
        filteredActivities = value.filter(activity => activity.year === year);
    })();
    
    return filteredActivities;
}

// Helper function to get an activity by ID
export function getActivityById(id: string): Activity | undefined {
    let activity: Activity | undefined;
    
    activities.subscribe(value => {
        activity = value.find(a => a.id === id);
    })();
    
    return activity;
} 