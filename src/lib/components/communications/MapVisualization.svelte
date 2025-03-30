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
    import type { Map as LeafletMap, FeatureGroup as LeafletFeatureGroup } from 'leaflet'; // Import types only
    import 'leaflet/dist/leaflet.css';
    import { base } from '$app/paths'; // Import base path

    export let markersData: MarkerData[] = [];

    let mapContainer: HTMLElement;
    let map: LeafletMap | null = null;
    let markersLayer: LeafletFeatureGroup | null = null;
    let L: typeof import('leaflet') | null = null;

    // Icon paths remain static imports
    import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
    import iconUrl from 'leaflet/dist/images/marker-icon.png';
    import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

    onMount(async () => {
        L = (await import('leaflet')).default;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl,
            iconUrl,
            shadowUrl,
        });

        if (!mapContainer) {
            console.error('Map container not found.');
            return; // Exit if no container
        }

        // Initialize the map
        map = L.map(mapContainer).setView([20, 0], 2);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Initialize marker layer group
        markersLayer = L.featureGroup().addTo(map);

        // Add initial markers
        addMarkers(markersData);

        // No return needed here, onDestroy handles cleanup
    });

    // Function to add/update markers
    function addMarkers(data: MarkerData[]) {
        // Check for L, map, and markersLayer
        if (!L || !map || !markersLayer) {
            console.warn('Leaflet library or map/markers layer not ready.');
            return;
        }

        markersLayer.clearLayers();

        data.forEach(item => {
            if (item.coordinates) {
                const marker = L!.marker([item.coordinates.latitude, item.coordinates.longitude]);
                
                // Construct popup content with a link
                const linkUrl = `${base}/communications/${item.id}`;
                const popupContent = `
                    <a href="${linkUrl}" target="_self" style="text-decoration: none; color: inherit;">
                        <strong>${item.title}</strong>
                        ${item.year ? '<br><span style="font-size: 0.9em; opacity: 0.8;">(' + item.year + ')</span>' : ''}
                    </a>
                `;

                marker.bindPopup(popupContent);
                markersLayer?.addLayer(marker);
            }
        });

         if (data.length > 0 && markersLayer.getLayers().length > 0) {
            const bounds = markersLayer.getBounds();
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

<!-- No API key needed for OpenStreetMap -->
<div bind:this={mapContainer} class="map-container"></div>

<style>
    /* Similar styles as before, just no placeholder needed */
    .map-container {
        width: 100%;
        height: 400px; /* Adjust as needed */
        position: relative;
        border-radius: var(--border-radius-md, 4px);
        overflow: hidden; 
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