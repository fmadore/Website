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

<div class="prose">
    <h1 class="contact-section-title">Contact</h1>
    
    <div class="contact-section">
        <h2 class="section-title">Contact Information</h2>
        <div class="contact-info">
            <p>
                <strong>Email:</strong> 
                <a href="mailto:contact@frederickmadore.com">
                    contact@frederickmadore.com
                </a>
            </p>
            
            <p class="contact-address">
                <strong>Institutional Address:</strong><br>
                Leibniz-Zentrum Moderner Orient (ZMO)<br>
                Kirchweg 33<br>
                14129 Berlin<br>
                Germany
            </p>
        </div>
    </div>
    
    <div class="contact-section">
        <h2 class="section-title">Connect with me</h2>
        <div class="social-links-grid">
            {#each socialLinks as link}
                <a href={link.url} 
                   class="social-link-card"
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div class="social-icon">
                        <span class="social-icon-letter">{link.name.charAt(0)}</span>
                    </div>
                    <div class="social-link-content">
                        <h3>{link.name}</h3>
                        <p class="social-link-description">{link.description}</p>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div> 