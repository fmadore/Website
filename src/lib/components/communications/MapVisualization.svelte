<script context="module" lang="ts">
    // Define the structure for marker data (reused from previous version)
    export type MarkerData = {
        id: string;
        title: string;
        coordinates: { latitude: number; longitude: number };
        year?: number; // Optional year for potential popups or styling
    };
</script>

<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { browser } from '$app/environment';
    import type { Map as LeafletMap, FeatureGroup as LeafletFeatureGroup, MarkerClusterGroup, TileLayerOptions } from 'leaflet'; // Import types only
    import { base } from '$app/paths'; // Import base path

    // Map configuration props with defaults
    export let markersData: MarkerData[] = [];
    export let initialView: [number, number] = [20, 0];
    export let initialZoom: number = 2;
    export let tileLayerUrl: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    export let tileLayerAttribution: string = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    export let maxZoom: number = 19;
    export let maxClusterZoom: number = 18;

    let mapContainer: HTMLElement;
    let map: LeafletMap | null = null;
    let clusterLayer: MarkerClusterGroup | null = null;
    let L: typeof import('leaflet') | null = null;
    let importError: string | null = null;

    onMount(async () => {
        if (!browser) return;
        
        try {
            // Dynamically import Leaflet
            L = (await import('leaflet')).default;
            
            // Then dynamically import the marker cluster plugin
            await import('leaflet.markercluster');
            
            // Import CSS only on client-side
            await import('leaflet/dist/leaflet.css');
            await import('leaflet.markercluster/dist/MarkerCluster.css');
            await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
            
            // Fix icon paths (needs to be after Leaflet import)
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            
            // Dynamic import of icon assets
            const iconRetinaUrl = (await import('leaflet/dist/images/marker-icon-2x.png')).default;
            const iconUrl = (await import('leaflet/dist/images/marker-icon.png')).default;
            const shadowUrl = (await import('leaflet/dist/images/marker-shadow.png')).default;
            
            L.Icon.Default.mergeOptions({
                iconRetinaUrl,
                iconUrl,
                shadowUrl,
            });

            if (!mapContainer) {
                throw new Error('Map container not found');
            }

            // Initialize the map with configurable options
            map = L.map(mapContainer).setView(initialView, initialZoom);

            // Add tile layer with configurable options
            L.tileLayer(tileLayerUrl, {
                attribution: tileLayerAttribution,
                maxZoom: maxZoom
            }).addTo(map);
            
            // Initialize marker cluster layer group with options
            clusterLayer = L.markerClusterGroup({
                maxClusterRadius: 50,
                disableClusteringAtZoom: maxClusterZoom
            }).addTo(map);

            // Add initial markers
            addMarkers(markersData);
        } catch (error) {
            console.error('Error initializing map:', error);
            importError = error instanceof Error ? error.message : 'Unknown error loading map';
        }
    });

    // Function to add/update markers
    function addMarkers(data: MarkerData[]) {
        // Check for L, map, and clusterLayer
        if (!L || !map || !clusterLayer) {
            console.warn('Leaflet library, map, or cluster layer not ready.');
            return;
        }

        clusterLayer.clearLayers(); // Clear the cluster layer

        data.forEach(item => {
            if (item.coordinates) {
                const marker = L!.marker([item.coordinates.latitude, item.coordinates.longitude]);
                
                const linkUrl = `${base}/communications/${item.id}`;
                const popupContent = `
                    <a href="${linkUrl}" target="_self" class="map-popup-link">
                        <strong>${item.title}</strong>
                        ${item.year ? '<br><span class="map-popup-year">(' + item.year + ')</span>' : ''}
                    </a>
                `;

                marker.bindPopup(popupContent, { className: 'map-popup' });
                clusterLayer?.addLayer(marker); // Add marker to cluster layer
            }
        });

         if (data.length > 0 && clusterLayer.getLayers().length > 0) {
            const bounds = clusterLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
            }
        }
    }

    // Use afterUpdate to handle prop changes
    afterUpdate(() => {
        // Ensure L is loaded and map exists before updating markers
        if (L && map && markersData) {
            addMarkers(markersData);
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
            map = null;
        }
    });
</script>

<div bind:this={mapContainer} class="map-container">
    {#if importError}
    <div class="map-error">
        <p>Error loading map: {importError}</p>
    </div>
    {/if}
</div>

<style>
    /* Similar styles as before, just no placeholder needed */
    .map-container {
        width: 100%;
        height: 400px; /* Adjust as needed */
        position: relative;
        border-radius: var(--border-radius-md, 4px);
        overflow: hidden; 
    }

    .map-error {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 0, 0, 0.1);
        color: #d32f2f;
        padding: var(--spacing-4, 1rem);
        text-align: center;
    }

    /* Custom Popup Styles */
    :global(.map-popup .leaflet-popup-content-wrapper) {
        background-color: var(--color-background, white);
        color: var(--color-text, #333);
        border-radius: var(--border-radius-md, 4px);
        box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
        padding: var(--spacing-1, 0.25rem); /* Reduce default padding */
    }

    :global(.map-popup .leaflet-popup-content) {
        margin: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem); /* Adjust internal margins */
        line-height: 1.4;
        font-size: var(--font-size-sm, 0.875rem);
    }

    :global(.map-popup .leaflet-popup-tip) {
        background-color: var(--color-background, white);
        box-shadow: none; /* Remove default tip shadow if desired */
    }

    :global(.map-popup a.leaflet-popup-close-button) {
        color: var(--color-text-muted, #777);
        padding: var(--spacing-1, 0.25rem) var(--spacing-1, 0.25rem) 0 0;
        font-size: 1.2em;
    }
    
    :global(.map-popup a.leaflet-popup-close-button:hover) {
        color: var(--color-text, #333);
        background-color: transparent;
    }

    /* Style link inside popup */
    :global(.map-popup .map-popup-link) {
        color: var(--color-primary, #2b6cb0); /* Link color */
        text-decoration: none;
    }
    
    :global(.map-popup .map-popup-link:hover) {
        text-decoration: underline;
    }

    :global(.map-popup .map-popup-year) {
        font-size: 0.9em;
        opacity: 0.8;
        color: var(--color-text-secondary, #555);
    }

    /* Ensure Leaflet controls are visible/styled if needed */
    /* Example: */
    :global(.leaflet-control-zoom a) {
        background-color: white;
        color: black;
        border: 1px solid var(--color-gray-300, #ccc);
    }
     :global(.leaflet-control-zoom a:hover) {
        background-color: #f4f4f4;
    }
</style> 