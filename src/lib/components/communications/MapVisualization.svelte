<script context="module" lang="ts">
    // Define the structure for marker data (reused from previous version)
    export type MarkerData = {
        id: string;
        title: string;
        coordinates: { latitude: number; longitude: number };
        year?: number; // Optional year for potential popups or styling
        activityType?: string; // Optional type for styling markers/clusters
        image?: string; // Optional image path
    };
</script>

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import type { Map as LeafletMap, FeatureGroup as LeafletFeatureGroup, MarkerClusterGroup, TileLayerOptions, TileLayer } from 'leaflet'; // Import types only
    import { base } from '$app/paths'; // Import base path
    import { MapPin } from 'lucide-svelte'; // Import a Lucide icon

    // Map configuration props with defaults
    export let markersData: MarkerData[] = [];
    export let initialView: [number, number] = [20, 0];
    export let initialZoom: number = 2;
    export let maxZoom: number = 19;
    export let maxClusterZoom: number = 18;
    export let preferDarkMode: boolean | null = null; // Optional override for dark mode preference
    export let restrictBounds: boolean = true; // Whether to restrict map bounds

    // Maximum bounds for the map (to prevent dragging to empty areas)
    const MAX_BOUNDS: [number, number][] = [
        [-85, -180], // Southwest corner
        [85, 180]    // Northeast corner
    ];

    // Map tile options (light and dark themes)
    const tileOptions = {
        light: {
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        },
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        },
        // Fallback to standard OSM
        default: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    };

    let mapContainer: HTMLElement;
    let map: LeafletMap | null = null;
    let clusterLayer: MarkerClusterGroup | null = null;
    let L: typeof import('leaflet') | null = null;
    let importError: string | null = null;
    let currentTileLayer: TileLayer | null = null;
    let currentThemeIsDark: boolean | null = null; // Track the currently applied theme state
    let mobileMenuObserver: MutationObserver | null = null;

    // Function to detect dark mode from system or CSS
    function detectDarkMode(): boolean {
        if (preferDarkMode !== null) return preferDarkMode;
        if (!browser) return false;
        
        // Check for dark mode using CSS variables if available
        const bodyStyles = window.getComputedStyle(document.body);
        const isDarkTheme = bodyStyles.getPropertyValue('--is-dark-theme')?.trim();
        const colorScheme = bodyStyles.getPropertyValue('color-scheme')?.trim();
        const backgroundColor = bodyStyles.getPropertyValue('background-color')?.trim();
        
        console.log('Theme detection:', { 
            isDarkTheme, 
            colorScheme, 
            backgroundColor,
            mediaQuery: window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
        });
        
        // If there's an explicit dark theme flag
        if (isDarkTheme === 'true') return true;
        if (isDarkTheme === 'false') return false;
        
        // Try color-scheme property
        if (colorScheme === 'dark') return true;
        if (colorScheme === 'light') return false;
        
        // Try to infer from background color (rough estimate)
        if (backgroundColor) {
            // Check if it's a dark color - crude check for dark backgrounds
            try {
                if (backgroundColor.includes('rgb')) {
                    // Parse RGB values
                    const rgb = backgroundColor.match(/\d+/g);
                    if (rgb && rgb.length >= 3) {
                        const [r, g, b] = rgb.map(Number);
                        // Calculate perceived brightness using common formula
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        return brightness < 128; // Dark if brightness is low
                    }
                }
            } catch (e) {
                console.error('Error parsing background color:', e);
            }
        }
        
        // Fallback to system preference
        return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
    }

    // Function to update tile layer based on theme
    function updateTileLayer() {
        if (!map || !L) return;
        
        const newDarkMode = detectDarkMode();
        // console.log('Map theme update check:', { currentThemeIsDark, newDarkMode }); // Keep for debugging if needed

        // Only update if the theme has actually changed or hasn't been set yet
        if (newDarkMode !== currentThemeIsDark) {
            // console.log('Applying theme change:', newDarkMode ? 'dark' : 'light'); // Keep for debugging if needed
            const tileSet = newDarkMode ? tileOptions.dark : tileOptions.light;
            
            // Remove current tile layer if it exists
            if (currentTileLayer) {
                map.removeLayer(currentTileLayer);
            }
            
            // Add new tile layer
            currentTileLayer = L.tileLayer(tileSet.url, {
                attribution: tileSet.attribution,
                maxZoom: maxZoom
            }).addTo(map);

            currentThemeIsDark = newDarkMode; // Update the tracked state
        }
        // else {
        //    console.log('Theme already up-to-date.'); // Keep for debugging if needed
        // }
    }

    // Setup mobile menu observation to help with z-index issues
    function setupMobileMenuObserver() {
        if (!browser) return;
        
        // Find the mobile menu element
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenu) {
            // Create a mutation observer to watch for class changes
            mobileMenuObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.attributeName === 'class') {
                        const isActive = mobileMenu.classList.contains('active');
                        if (isActive) {
                            document.body.classList.add('mobile-menu-open');
                        } else {
                            document.body.classList.remove('mobile-menu-open');
                        }
                    }
                }
            });
            
            // Start observing
            mobileMenuObserver.observe(mobileMenu, { attributes: true });
            
            // Set initial state
            if (mobileMenu.classList.contains('active')) {
                document.body.classList.add('mobile-menu-open');
            }
        }
    }

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
            map = L.map(mapContainer, {
                center: initialView,
                zoom: initialZoom,
                maxZoom: maxZoom,
                minZoom: 2, // Prevent zooming out too far
                maxBoundsViscosity: 1.0, // Makes bounds completely solid
                bounceAtZoomLimits: false, // Don't bounce when hitting zoom limits
                worldCopyJump: true, // Allows seamless horizontal panning
                // Set maximum bounds if restricted
                ...(restrictBounds ? { maxBounds: MAX_BOUNDS } : {})
            });

            // Initialize with theme-aware tiles
            updateTileLayer();
            
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

            // Set up theme change detection
            if (window.matchMedia) {
                const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                
                // Modern browsers
                if (darkModeMediaQuery.addEventListener) {
                    darkModeMediaQuery.addEventListener('change', () => updateTileLayer());
                }
                // Safari & older browsers
                else if (darkModeMediaQuery.addListener) {
                    darkModeMediaQuery.addListener(() => updateTileLayer());
                }
            }
            
            // Watch for theme changes using MutationObserver
            const bodyObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
                        updateTileLayer();
                        break;
                    }
                }
            });
            
            bodyObserver.observe(document.body, { attributes: true });
            
            // Setup mobile menu observer after DOM is ready
            setTimeout(() => {
                setupMobileMenuObserver();
            }, 500);
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
                
                // Conditionally add image HTML
                const imageHtml = item.image ? 
                    `<img src="${base}/${item.image}" alt="${item.title}" class="map-popup-image">` 
                    : '';
                    
                const popupContent = `
                    <a href="${linkUrl}" target="_self" class="map-popup-link">
                        ${imageHtml} 
                        <div class="map-popup-content-text">
                            <strong>${item.title}</strong>
                            ${item.year ? '<br><span class="map-popup-year">(' + item.year + ')</span>' : ''}
                        </div>
                    </a>
                `;

                marker.bindPopup(popupContent, { 
                    className: 'map-popup', 
                    minWidth: 150 // Allow popup to be wider if needed for image
                 });
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

    // Reactive statement for markers: Update only when markersData changes (and map is ready)
    $: if (browser && L && map && clusterLayer) {
        // console.log('Reactively updating markers due to markersData change.'); // Keep for debugging if needed
        addMarkers(markersData);
    }

    // Reactive statement for theme preference: Re-check theme when preferDarkMode changes (and map is ready)
    $: if (browser && L && map) {
        // Check if preferDarkMode is accessed to ensure reactivity
        const _pref = preferDarkMode;
        // console.log('Reactively checking theme due to preferDarkMode change:', _pref); // Keep for debugging if needed
        updateTileLayer();
    }

    onDestroy(() => {
        // Clean up observer
        if (mobileMenuObserver) {
            mobileMenuObserver.disconnect();
        }
        
        // Clean up map
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
    /* Map Container Base Styles */
    .map-container {
        width: 100%;
        height: 400px; /* Adjust as needed */
        position: relative;
        border-radius: var(--border-radius-md, 4px);
        overflow: hidden; 
        /* Add z-index to ensure map stays below site navigation */
        z-index: 1;
        /* Add isolation to create a new stacking context */
        isolation: isolate;
    }

    /* Force Leaflet controls to stay below header/navigation */
    :global(.leaflet-top), 
    :global(.leaflet-bottom), 
    :global(.leaflet-control),
    :global(.leaflet-control-container) {
        z-index: 8 !important;
    }
    
    :global(.leaflet-pane), 
    :global(.leaflet-overlay-pane),
    :global(.leaflet-marker-pane),
    :global(.leaflet-tooltip-pane),
    :global(.leaflet-popup-pane),
    :global(.leaflet-map-pane svg),
    :global(.leaflet-map-pane canvas) {
        z-index: 2 !important;
    }
    
    /* Override Leaflet's internal z-index stacking */
    :global(.leaflet-control-zoom) {
        z-index: 7 !important;
    }
    
    :global(.leaflet-control-attribution) {
        z-index: 7 !important;
    }
    
    :global(.leaflet-popup) {
        z-index: 6 !important;
    }
    
    /* Important: Remove map from the stacking context when modal/menu is open */
    :global(body.mobile-menu-open .map-container) {
        z-index: 0;
    }

    /* Extreme fix: If the above doesn't work, force the popup elements to be hidden when menu open */
    :global(body.mobile-menu-open .leaflet-control),
    :global(body.mobile-menu-open .leaflet-control-container),
    :global(body.mobile-menu-open .leaflet-pane),
    :global(body.mobile-menu-open .leaflet-popup) {
        visibility: hidden !important;
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
        border-radius: var(--border-radius-lg); /* Match card radius */
        box-shadow: var(--shadow-md); /* Match card shadow */
        padding: 0; /* Remove padding, handle internally */
        overflow: hidden; /* Ensure image corners are rounded */
    }

    :global(.map-popup .leaflet-popup-content) {
        margin: 0; /* Remove default margins */
        line-height: 1.4;
        font-size: var(--font-size-sm, 0.875rem);
        display: flex; /* Use flex for layout */
        flex-direction: column;
    }

    :global(.map-popup img.map-popup-image) {
        width: 100%;
        height: 80px; /* Fixed height for popup image */
        object-fit: cover;
        display: block;
        border-bottom: 1px solid var(--color-border, #eee); /* Separator */
    }
    
    :global(.map-popup .map-popup-content-text) {
        padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem); /* Padding for text */
    }

    :global(.map-popup .leaflet-popup-tip-container) {
         width: 20px; /* Make tip slightly smaller if desired */
         height: 10px;
    }
    
    :global(.map-popup .leaflet-popup-tip) {
        background-color: var(--color-background, white);
        box-shadow: none; 
        border-left: 1px solid var(--color-border, #eee);
        border-right: 1px solid var(--color-border, #eee);
        border-bottom: 1px solid var(--color-border, #eee);
        margin-top: -1px; /* Adjust position to connect smoothly */
    }

    :global(.map-popup a.leaflet-popup-close-button) {
        color: var(--color-text-light, #777);
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        top: 5px;
        right: 5px;
        font-size: 1.1em;
        transition: background-color 0.2s, color 0.2s;
    }
    
    :global(.map-popup a.leaflet-popup-close-button:hover) {
        color: var(--color-text, #333);
        background-color: rgba(255, 255, 255, 1);
    }

    /* Style link inside popup */
    :global(.map-popup .map-popup-link) {
        color: var(--color-text); /* Use standard text color */
        text-decoration: none;
        display: block;
    }
    
    :global(.map-popup .map-popup-link strong) {
         color: var(--color-primary); /* Title color */
    }

    :global(.map-popup .map-popup-link:hover strong) {
        text-decoration: underline;
    }

    :global(.map-popup .map-popup-year) {
        font-size: 0.9em;
        opacity: 0.8;
        color: var(--color-text-light); /* Muted year text */
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