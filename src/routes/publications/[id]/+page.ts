import { error } from '@sveltejs/kit';
import { allPublications } from '$lib/data/publications/index';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    const publication = allPublications.find(pub => pub.id === params.id);
    
    if (!publication) {
        throw error(404, 'Publication not found');
    }
    
    return {
        publication
    };
}; 