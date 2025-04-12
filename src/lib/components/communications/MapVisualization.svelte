<script context="module" lang="ts">
    // Define the structure for marker data (reused from previous version)
    export type MarkerData = {
        id: string;
        title: string;
        coordinates: { latitude: number; longitude: number };
        year?: number; // Optional year for potential popups or styling
        activityType?: string; // Optional type for styling markers/clusters
    };
</script>

<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { browser } from '$app/environment';
    import type { Map as LeafletMap, FeatureGroup as LeafletFeatureGroup, MarkerClusterGroup, TileLayerOptions } from 'leaflet'; // Import types only
    import { base } from '$app/paths'; // Import base path
    import { MapPin } from 'lucide-svelte'; // Import a Lucide icon

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
                disableClusteringAtZoom: maxClusterZoom,
                iconCreateFunction: function(cluster) {
                    const markers = cluster.getAllChildMarkers();
                    const count = cluster.getChildCount();
                    let clusterType = 'default'; // Default type

                    // Check for different marker types using simple names
                    const hasLecture = markers.some(marker => 
                        marker.options.icon?.options.className?.includes('marker-type-lecture')
                    );
                    const hasEvent = markers.some(marker => 
                        marker.options.icon?.options.className?.includes('marker-type-event')
                    );
                     // Add checks for other types if needed, e.g., workshop
                     const hasWorkshop = markers.some(marker => 
                        marker.options.icon?.options.className?.includes('marker-type-workshop') // Example if you add workshop type back
                     );

                    // Set clusterType based on priority (adjust as needed)
                    if (hasLecture) {
                        clusterType = 'lecture'; // Priority 1: Lecture (Accent)
                    }
                    if (hasEvent) {
                        clusterType = 'event';   // Priority 2: Event (Highlight)
                    }
                    // Example: Add workshop back if needed
                    // if (hasWorkshop) {
                    //    clusterType = 'workshop'; // Priority 3: Workshop (Success)
                    // }

                    // Default is primary color

                    // Adjust cluster size/class based on count for better visual hierarchy
                    let clusterSizeClass = 'marker-cluster-small';
                    if (count < 10) {
                        clusterSizeClass = 'marker-cluster-small';
                    } else if (count < 100) {
                        clusterSizeClass = 'marker-cluster-medium';
                    } else {
                        clusterSizeClass = 'marker-cluster-large';
                    }

                    const c = `marker-cluster ${clusterSizeClass} marker-cluster-${clusterType}`;
                    const size = L!.point(40, 40); // Keep base size, CSS will adjust inner div

                    // You can customize the HTML further, perhaps adding a small icon inside
                    const html = `<div><span>${count}</span></div>`;

                    return L!.divIcon({ html: html, className: c, iconSize: size });
                }
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
                // Create HTML for the Lucide icon
                // Note: This direct HTML rendering bypasses Svelte reactivity for the icon itself.
                // For more complex interactions within the icon, a different approach might be needed.
                const iconHtml = `
                    <div class="custom-marker-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                `;

                const typeClass = item.activityType ? `marker-type-${item.activityType}` : ''; // Use simple type name
                
                // Debugging: Log the activity type and resulting class
                // console.log(`Marker ID: ${item.id}, Activity Type: ${item.activityType}, Generated Class: ${typeClass}`);

                const customIcon = L!.divIcon({
                    html: iconHtml,
                    className: `clear-leaflet-default-icon-style ${typeClass}`, // Add type class to the icon's wrapper
                    iconSize: [32, 32], // Increased size
                    iconAnchor: [16, 32], // Adjust anchor (center bottom)
                    popupAnchor: [0, -36] // Adjust popup anchor relative to new size
                });

                const marker = L!.marker([item.coordinates.latitude, item.coordinates.longitude], { icon: customIcon });

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

    /* Remove default Leaflet styles from divIcon */
    :global(.clear-leaflet-default-icon-style) {
        background: none;
        border: none;
    }

    /* Style the custom marker icon container */
    :global(.custom-marker-icon) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px; /* Match increased iconSize */
        height: 32px; /* Match increased iconSize */
    }

    /* Style the SVG icon itself */
    :global(.custom-marker-icon svg) {
        width: 100%;
        height: 100%;
        color: var(--color-primary); /* Stroke color */
        fill: var(--color-background); /* Fill color for contrast */
        fill-opacity: 0.9;
        stroke-width: 1.5; /* Slightly thinner stroke */
        filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.4)); /* Drop shadow for depth */
        /* Add transition for potential hover effects */
        transition: transform 0.2s ease-in-out, color 0.2s ease-in-out, fill 0.2s ease-in-out;
    }

    :global(.custom-marker-icon:hover svg) {
        transform: scale(1.1); /* Example hover effect */
    }

    /* Style based on actual simple activityType values */
    /* Select parent with type class, then find svg */
    :global(.clear-leaflet-default-icon-style.marker-type-lecture .custom-marker-icon svg) {
        color: var(--color-accent); /* Use accent color for lectures */
        /* fill is inherited or set by default rule */
    }
    :global(.clear-leaflet-default-icon-style.marker-type-event .custom-marker-icon svg) {
        color: var(--color-highlight); /* Use highlight color for events */
        /* fill is inherited or set by default rule */
    }
    /* Example: Add style for workshop if you re-introduce that type */
    /*
    :global(.clear-leaflet-default-icon-style.marker-type-workshop .custom-marker-icon svg) {
        color: var(--color-success);
    }
    */

    /* --- Marker Cluster Styles --- */

    /* Base cluster style */
    :global(.marker-cluster) {
        background-clip: padding-box;
        border-radius: 50%;
        transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out; /* Animation */
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid rgba(0, 0, 0, 0.2); /* Add a subtle border */
    }

    :global(.marker-cluster div) {
        width: 30px;
        height: 30px;
        margin-left: 5px;
        margin-top: 5px;
        text-align: center;
        border-radius: 50%;
        font-size: 12px;
        font-weight: bold;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.3s ease-in-out; /* Animation */
    }

    :global(.marker-cluster span) {
        line-height: inherit; /* Inherit line height from parent div */
    }

    /* Default cluster color */
    :global(.marker-cluster-default div) {
        background-color: rgba(var(--color-primary-rgb, 43, 108, 176), 0.8); /* Use primary color with alpha */
    }
    :global(.marker-cluster-default:hover div) {
        background-color: rgba(var(--color-primary-rgb, 43, 108, 176), 1); 
    }

    /* Lecture cluster color */
    :global(.marker-cluster-lecture div) {
        background-color: rgba(var(--color-accent-rgb), 0.8);
    }
     :global(.marker-cluster-lecture:hover div) {
        background-color: rgba(var(--color-accent-rgb), 1);
    }

    /* Event cluster color */
    :global(.marker-cluster-event div) {
        background-color: rgba(var(--color-highlight-rgb), 0.8);
    }
    :global(.marker-cluster-event:hover div) {
        background-color: rgba(var(--color-highlight-rgb), 1);
    }

    /* Example: Workshop cluster color */
    /*
    :global(.marker-cluster-workshop div) {
        background-color: rgba(var(--color-success-rgb), 0.8);
    }
    :global(.marker-cluster-workshop:hover div) {
        background-color: rgba(var(--color-success-rgb), 1);
    }
    */

    /* --- End Marker Cluster Styles --- */

    :global(.marker-cluster-small div) { width: 30px; height: 30px; line-height: 30px; }
    :global(.marker-cluster-medium div) { width: 40px; height: 40px; line-height: 40px; font-size: 14px; margin-left: 0px; margin-top: 0px; }
    :global(.marker-cluster-large div) { width: 50px; height: 50px; line-height: 50px; font-size: 16px; margin-left: -5px; margin-top: -5px; }
</style> 