// Allow for variables in the css 
var cssclass = document.querySelector(":root");
var mystyle = window.getComputedStyle(cssclass);

import { showBuildings, showRestaurants, getLocationDetails} from './api_calls.js';
import { search_radius, viz_type } from "./config.js";
// import { zoom_to_bounds, getZoomLevel, numberWithCommas} from './legend_controlls.js';


mapboxgl.accessToken = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNtOHMwbmJvdTA4ZnIya290M2hlbmswb2YifQ.qQZEM9FzU2J-_z0vYoSBeg';

export const map1 = new mapboxgl.Map({
    container: 'map1-id',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [12.479457320485057, 41.89756861026971], 
    zoom: 13
});

export const map2 = new mapboxgl.Map({
    container: 'map2-id',
    // style: 'mapbox://styles/mapbox/satellite-v9',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-73.95022547782283, 40.6803981302293], 
    zoom: 13
});

function addLayers_map(map){
    // Add a source for the circle
    map.on('load', async () => {

        // UPDATE ZOOM LEVEL DISPLAY
        const zoomLevelDisplay = document.getElementById('zoom-level');

        const updateZoomLevel = () => {
            const zoom = map.getZoom().toFixed(2); // Get zoom level and format to 2 decimal places
            // zoomLevelDisplay.textContent = `${Math.floor(zoom)}`;
            zoomLevelDisplay.textContent = `${zoom}`;
        };

        // Listen to zoom and move events to update zoom level
        map.on('zoom', updateZoomLevel);
        map.on('move', updateZoomLevel);
        // map.on('load', updateZoomLevel);


        map.addSource('circle', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

        map.addSource('buildings', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

        // Add a fill layer for the circle
        map.addLayer({
            id: 'circle-fill',
            type: 'fill',
            source: 'circle',
            paint: {
                'fill-color': '#2b58b3',
                'fill-opacity': 0.05
            }
        });

        // Add a fill layer for the circle
        map.addLayer({
            id: 'circle-stroke',
            type: 'line',
            source: 'circle',
            paint: {
                'line-color': '#2b58b3',
                'line-opacity': 1,
                'line-width': 2
            }
        });

        map.addSource('restaurants', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        map.addLayer({
            id: 'restaurants-layer',
            type: 'circle',
            source: 'restaurants',
            paint: {
                'circle-radius': 2,
                'circle-color': 'rgba(8,0,242,0.3)',
                // 'circle-stroke-width': 1,
                // 'circle-stroke-color': '#fff'
            }
        });

        map.addLayer({
            id: 'restaurants-heatmap',
            type: 'heatmap',
            source: 'restaurants',
            maxzoom: 15,
            paint: {
                'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13, 0.8,
                    14, 0.8
                ],
                'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13.27, 0.1,
                    13.86, 0.15,
                    14.27, 0.3
                ],
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(8,0,138,0)',
                    0.02, 'rgba(8,0,138,0.05)',
                    0.05, 'rgba(8,0,138,0.1)',
                    0.2, 'rgba(8,0,138,0.5)',
                    0.4, 'rgba(8,0,138,0.7)',

                    0.6, 'rgba(25,146,167,1)',
                    0.8, 'rgba(9,119,121,1)',
                    1, 'rgba(0,255,53,1)'
                ],
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13.27, 40,
                    13.86, 50,
                    14.27, 50
                ],
                'heatmap-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 0.6,
                    14, 0.6
                ]
            }
        });

        // map.addLayer({
        //     id: 'restaurants-heatmap',
        //     type: 'heatmap',
        //     source: 'restaurants',
        //     paint: {
        //         'heatmap-weight': 0.8,
        //         'heatmap-intensity': 0.4,
        //         'heatmap-radius': 50,
        //         'heatmap-color': [
        //             'interpolate',
        //             ['linear'],
        //             ['heatmap-density'],
        //             0, 'rgba(8,0,138,0)',
        //             0.02, 'rgba(8,0,138,0.05)',
        //             0.05, 'rgba(8,0,138,0.1)',
        //             0.2, 'rgba(8,0,138,0.5)',
        //             0.4, 'rgba(8,0,138,0.7)',
        //             0.6, 'rgba(25,146,167,1)',
        //             0.8, 'rgba(9,119,121,1)',
        //             1, 'rgba(0,255,53,1)'
        //         ],
        //         'heatmap-opacity': 0.6
        //     }
        // });


        // Add a fill layer for the buildings
        map.addLayer({
            id: 'bldg-fill',
            type: 'fill',
            source: 'buildings',
            paint: {
                'fill-color': '#000000',
                'fill-opacity': 0.9
            }
        });



    });
}

addLayers_map(map1)
addLayers_map(map2)


// Function to create a radius circle
export function createCircle(center, radiusInMeters) {
    return turf.circle(center, radiusInMeters, { steps: 64, units: 'meters' });
}


// Store state for both maps
export const mapState = {
    map1: {
        name: "map1",
        side: "left",
        center: [],
        neighborhood: "",
        city: "",
        country: "",
        map_select: false,
        map_set: false,
        instance: map1
    },
    map2: {
        name: "map2",
        side: "right",
        center: [],
        neighborhood: "",
        city: "",
        country: "",
        map_select: false,
        map_set: false,
        instance: map2
    }
};


// Add event listeners for all maps in object 'mapState'
Object.entries(mapState).forEach(([key, mapData]) => {
    let { instance, name } = mapData;
    let elementId = `${name}-set-point`;

    instance.on('click', async (e) => {
        mapData.center = [e.lngLat.lng, e.lngLat.lat];

        // Update the source with the new circle
        let circleGeoJSON = createCircle(mapData.center, search_radius);
        instance.getSource('circle').setData(circleGeoJSON);
        fitCircleToBounds(instance, mapData.center, search_radius, 50); // Zoom to that circle 

        document.getElementById(elementId).classList.add("true");
        mapData.map_select = true;

        getLocationDetails(mapData.center[1], mapData.center[0]).then(location => {
            mapData.neighborhood = location.neighborhood;
            mapData.city = location.city;
            mapData.country = location.country;
        });
    });
});

export function fitCircleToBounds(map, center, radius, padding) {
    const earthRadius = 6371000; // Earth’s radius in meters

    // Convert meters to latitude/longitude degrees
    const latDiff = (radius / earthRadius) * (180 / Math.PI);
    const lonDiff = latDiff / Math.cos(center[1] * (Math.PI / 180));

    // Define bounding box (southwest & northeast corners)
    const bounds = [
        [center[0] - lonDiff, center[1] - latDiff], // Southwest
        [center[0] + lonDiff, center[1] + latDiff]  // Northeast
    ];

    // Fit map to the bounds
    map.fitBounds(bounds, {
        padding: padding, // Add padding around the circle
        // maxZoom: 14  // Prevent zooming in too much
    });
}


function disableMapInteractions(map) {
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
}

function enableMapInteractions(map) {
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
}


// CLOSE BUTTON FUNCTIONALITY ---------------------------------------------------------------

function createCloseHandler(map, mapKey) {
    return function () {
        const state = mapState[mapKey]; // Get state for the correct map
        // Clear map sources
        map.getSource("restaurants").setData({ type: "FeatureCollection", features: [] });
        map.getSource("buildings").setData({ type: "FeatureCollection", features: [] });
        map.getSource("circle").setData({ type: "FeatureCollection", features: [] });

        // Update UI elements
        document.getElementById(mapKey + "-close-butt").classList.remove("true");
        document.getElementById(mapKey + "-id").classList.remove("true");
        document.getElementById(mapKey + "-set-point").classList.remove("hide", "true");
        document.getElementById("searchbox-container-" + state.side).classList.remove("hide");
        document.getElementById("title-block-" + state.side).classList.add("hide");

        document.getElementById("radar-chart-" + state.side).innerHTML= "";

        document.getElementById("summary-stat-" + state.side).classList.add("hide");
        document.getElementById("bldg-stat-" + state.side).classList.add("hide");
        adjustOpacity(map, 1)


        // Enable interactions on the map
        enableMapInteractions(map);

        // console.log(mapState.map1.map_set, mapState.map2.map_set)

        if (!(mapState.map1.map_set && mapState.map2.map_set)){
            document.getElementById("scale-container-id").classList.add("hide");
        }

        // Update variables (assuming these exist globally)
        mapState[mapKey].map_select = false;
        mapState[mapKey].map_set = false;

    };
}

// Attach event listeners for both maps
document.getElementById("map1-close-butt").addEventListener("click", 
    createCloseHandler(map1, "map1")
);

document.getElementById("map2-close-butt").addEventListener("click", 
    createCloseHandler(map2, "map2")
);

// SET POINT BUTTON FUNCTIONALITY ---------------------------------------------------------------

export function createSetPointHandler(map, mapKey) {
    return async function () {
        const state = mapState[mapKey]; // Get state for the correct map

        if (state.map_select) {
            fitCircleToBounds(map, state.center, search_radius, 0);
            setTimeout(() => {
                map.getSource("circle").setData({ type: "FeatureCollection", features: [] });
            }, 250);

            // Update UI elements
            document.getElementById(mapKey+"-id").classList.add("true");
            document.getElementById(mapKey + "-close-butt").classList.add("true");
            document.getElementById(mapKey + "-set-point").classList.add("hide");
            document.getElementById("searchbox-container-" + state.side).classList.add("hide");

            document.getElementById("title-block-" + state.side).querySelector('div').innerText = state.neighborhood
            document.getElementById("title-block-" + state.side).querySelectorAll('div')[1].innerText = state.city
            document.getElementById("title-block-" + state.side).classList.remove("hide");

            document.getElementById("scale-container-id").classList.remove("hide");

            // Handle visualization mode
            if (viz_type === "heatmap") {
                showRestaurants(state.name, map, state.center[1], state.center[0], search_radius);
                // state.map_select = false;   
            } 

            if (viz_type === "buildings") {
                // map.setStyle("mapbox://styles/ptrszkwcz/cm8i0b41x016201r0615u66no");
                // 
                showBuildings(state.name, map, state.center[1], state.center[0], search_radius);
                adjustOpacity(map, 0)
                
                // state.map_select = false; 
            }
            state.map_set = true;
        }
    };
}



// Attach event listeners for both maps
document.getElementById("map1-set-point").addEventListener("click", 
    createSetPointHandler(map1, "map1")
);

document.getElementById("map2-set-point").addEventListener("click", 
    createSetPointHandler(map2, "map2")
);


// SEARCH BOX

window.addEventListener('load', () => {
    function createSearchBox(map, containerId) {
        const searchBox = new MapboxSearchBox();
        searchBox.accessToken = mapboxgl.accessToken;
        searchBox.options = {
            // types: 'address,poi',
            types: 'place, poi, address',
            proximity: [-73.99209, 40.68933],
        };

        searchBox.theme = {
            variables: {
                colorBackground: 'rgba(255, 255, 255, 0.9)',
                colorText: 'rgba(8,0,242,1)',
                colorBackdrop: 'rgba(255, 255, 255, 0.9)',
                colorBackgroundHover: 'rgba(8,0,242,0.05)',
                colorPrimary: '#00b330',
                colorBorder: 'rgba(8,0,242,1)',
                borderWidth: '1px',
                colorBackgroundActive: 'rgba(0,179,48,0.8)',
                borderRadius: '5px',
                boxShadow: 'none', // Remove box shadow
                fontFamily: 'Arial, sans-serif'
            }
        };

        searchBox.marker = false; // Disable marker
        searchBox.mapboxgl = mapboxgl;

        // Append search box to the correct container
        document.getElementById(containerId).appendChild(searchBox.onAdd(map));
    }

    // Create search boxes for both maps
    createSearchBox(map1, 'searchbox-container-left');
    createSearchBox(map2, 'searchbox-container-right');
});


// SLIDERS ---------------------------------------------------------------

export function updateHeatmap() {
    // console.log(map1)
    const radius = document.getElementById('radius-slider').value;
    const intensity = document.getElementById('intensity-slider').value;

    document.getElementById('slider-value-radius').innerText = radius;
    document.getElementById('slider-value-intensity').innerText = intensity;

    map1.setPaintProperty('restaurants-heatmap', 'heatmap-radius', parseFloat(radius));
    map1.setPaintProperty('restaurants-heatmap', 'heatmap-intensity', parseFloat(intensity));

    map2.setPaintProperty('restaurants-heatmap', 'heatmap-radius', parseFloat(radius));
    map2.setPaintProperty('restaurants-heatmap', 'heatmap-intensity', parseFloat(intensity));
}

// Attach event listeners to sliders
document.getElementById('radius-slider').addEventListener('input', updateHeatmap);
document.getElementById('intensity-slider').addEventListener('input', updateHeatmap);

// // Attach event listener for show points button
// document.getElementById("points-toggle-id").addEventListener("click", 
//     // createCloseHandler(map1, "map1")
//     console.log("HERRO")
// );


document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("points-toggle-id");

    toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");

        if (map1.getLayer("restaurants-layer")) {
            const visibility = map1.getLayoutProperty("restaurants-layer", "visibility");

            if (visibility === "none") {
                map1.setLayoutProperty("restaurants-layer", "visibility", "visible");
            } else {
                map1.setLayoutProperty("restaurants-layer", "visibility", "none");
            }
        }
        if (map2.getLayer("restaurants-layer")) {
            const visibility = map2.getLayoutProperty("restaurants-layer", "visibility");

            if (visibility === "none") {
                map2.setLayoutProperty("restaurants-layer", "visibility", "visible");
            } else {
                map2.setLayoutProperty("restaurants-layer", "visibility", "none");
            }
        }
    });
});
3
export function adjustOpacity(map, opacity) {
    const layers = map.getStyle().layers; // Get current style layers

    layers.forEach(layer => {
        const layerId = layer.id;
        const layerType = layer.type;
        const layerSource = layer.source;

        if (layerId === 'bldg-fill') return;
        if (layerId === 'circle-fill') return;
        if (layerId === 'landuse') return;
        if (layerId === 'water') return;
        // if (layerSource !== 'composite') return;

        // Apply the correct opacity property based on the layer type
        if (layerType === 'fill') {
            map.setPaintProperty(layerId, 'fill-opacity', parseFloat(opacity));
        } else if (layerType === 'background') {
            map.setPaintProperty(layerId, 'background-opacity', parseFloat(opacity));
        } else if (layerType === 'line') {
            map.setPaintProperty(layerId, 'line-opacity', parseFloat(opacity));
        } else if (layerType === 'symbol') {
            map.setPaintProperty(layerId, 'text-opacity', parseFloat(opacity));
            map.setPaintProperty(layerId, 'icon-opacity', parseFloat(opacity))
        } else if (layerType === 'raster') {
            map.setPaintProperty(layerId, 'raster-opacity', parseFloat(opacity));
        } else if (layerType === 'circle') {
            map.setPaintProperty(layerId, 'circle-opacity', parseFloat(opacity));
        }
    });
}

