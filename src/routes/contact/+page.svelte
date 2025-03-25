<script>
    // Social media links
    const socialLinks = [
        { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/in/username', description: 'Connect with me on LinkedIn' },
        { name: 'GitHub', icon: 'github', url: 'https://github.com/username', description: 'View my code repositories' },
        { name: 'ORCID', icon: 'orcid', url: 'https://orcid.org/0000-0000-0000-0000', description: 'View my ORCID profile' },
        { name: 'Bluesky', icon: 'bluesky', url: 'https://bluesky.com/username', description: 'Follow me on Bluesky' },
        { name: 'Mastodon', icon: 'mastodon', url: 'https://mastodon.social/@username', description: 'Follow me on Mastodon' },
        { name: 'Google Scholar', icon: 'google-scholar', url: 'https://scholar.google.com/citations?user=userid', description: 'View my publications on Google Scholar' },
        { name: 'ResearchGate', icon: 'researchgate', url: 'https://researchgate.net/profile/username', description: 'Follow my research on ResearchGate' },
        { name: 'Knowledge Commons', icon: 'commons', url: 'https://knowledgecommons.org/username', description: 'View my shared research' },
        { name: 'Academia.edu', icon: 'academia', url: 'https://academia.edu/username', description: 'Follow me on Academia.edu' }
    ];
</script>

<div class="prose prose-lg max-w-none">
    <h1 class="text-4xl font-bold mb-8">Contact</h1>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Contact Information</h2>
        <div class="space-y-3">
            <p>
                <strong>Email:</strong> 
                <a href="mailto:contact@frederickmadore.com" class="text-blue-600 hover:text-blue-800">
                    contact@frederickmadore.com
                </a>
            </p>
            
            <p>
                <strong>Institutional Address:</strong><br>
                Leibniz-Zentrum Moderner Orient (ZMO)<br>
                Kirchweg 33<br>
                14129 Berlin<br>
                Germany
            </p>
        </div>
    </div>
    
    <div class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Connect with me</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each socialLinks as link}
                <a href={link.url} 
                   class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <span class="text-gray-600">{link.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">{link.name}</h3>
                        <p class="text-sm text-gray-600">{link.description}</p>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div> 