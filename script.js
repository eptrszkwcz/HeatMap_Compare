// Allow for variables in the css 
var cssclass = document.querySelector(":root");
var mystyle = window.getComputedStyle(cssclass);

import { showBuildings, showRestaurants, getLocationDetails} from './api_calls.js';
import { search_radius, viz_type } from "./config.js";
// import { zoom_to_bounds, getZoomLevel, numberWithCommas} from './legend_controlls.js';


mapboxgl.accessToken = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNscGkxOHVvbjA2eW8ybG80NDJ3ajBtMWwifQ.L2qe-aJO35nls3sfd0WKPA';

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

        // map.addLayer({
        //     id: 'restaurants-heatmap',
        //     type: 'heatmap',
        //     source: 'restaurants',
        //     maxzoom: 15,
        //     // filter: ['==', ['get', 'category'], 'sc'], 
        //     filter: ['==', ['get', 'category'], 'ae'], 
        //     paint: {
        //         'heatmap-weight': [
        //             'interpolate',
        //             ['linear'],
        //             ['zoom'],
        //             13, 0.8,
        //             14, 0.8
        //         ],
        //         'heatmap-intensity': [
        //             'interpolate',
        //             ['linear'],
        //             ['zoom'],
        //             13, 0.2,
        //             14, 0.4
        //         ],
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
        //         'heatmap-radius': [
        //             'interpolate',
        //             ['linear'],
        //             ['zoom'],
        //             13, 40,
        //             14, 50
        //         ],
        //         'heatmap-opacity': [
        //             'interpolate',
        //             ['linear'],
        //             ['zoom'],
        //             10, 0.6,
        //             14, 0.6
        //         ]
        //     }
        // });

        map.addLayer({
            id: 'sc-heatmap',
            type: 'heatmap',
            source: 'restaurants',
            maxzoom: 15,
            filter: ['==', ['get', 'category'], 'sc'], 
            // filter: ['==', ['get', 'category'], 'ae'], 
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
                    13, 0.2,
                    14, 0.4
                ],
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(8,0,138,0)',
                    0.02, 'rgba(162, 194, 232,0)',
                    0.05, 'rgba(162, 194, 232,0.1)',
                    0.2, 'rgba(162, 194, 232,0.2)',
                    0.4, 'rgba(162, 194, 232,0.5)',

                    0.6, 'rgba(162, 194, 232,1)',
                    0.8, 'rgba(52, 134, 235,1)',
                    1, 'rgba(69, 152, 255,1)'
                ],
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13, 40,
                    14, 50
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

        map.addLayer({
            id: 'ae-heatmap',
            type: 'heatmap',
            source: 'restaurants',
            maxzoom: 15,
            // filter: ['==', ['get', 'category'], 'sc'], 
            filter: ['==', ['get', 'category'], 'ae'], 
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
                    13, 0.5,
                    14, 0.8
                ],
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(8,0,138,0)',
                    0.02, 'rgba(235, 164, 160,0)',
                    0.05, 'rgba(235, 164, 160,0.1)',
                    0.2, 'rgba(235, 164, 160,0.2)',
                    0.4, 'rgba(235, 164, 160,0.5)',

                    0.6, 'rgba(235, 164, 160,1)',
                    0.8, 'rgba(207, 44, 31,1)',
                    1, 'rgba(252, 24, 8,1)'
                ],
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13, 40,
                    14, 60
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

        map.addLayer({
            id: 'fb-heatmap',
            type: 'heatmap',
            source: 'restaurants',
            maxzoom: 15,
            filter: ['==', ['get', 'category'], 'fb'], 
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
                    13, 0.1,
                    14, 0.3
                ],
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(8,0,138,0)',
                    0.02, 'rgba(169, 252, 197,0)',
                    0.05, 'rgba(169, 252, 197,0.1)',
                    0.2, 'rgba(169, 252, 197,0.2)',
                    0.4, 'rgba(169, 252, 197,0.5)',

                    0.6, 'rgba(169, 252, 197,0.7)',
                    0.8, 'rgba(66, 214, 116,1)',
                    1, 'rgba(5, 242, 85,1)'
                ],
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13, 40,
                    14, 50
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
        center: [],
        neighborhood: "",
        city: "",
        country: "",
        map_select: false,
        map_set: false
    },
    map2: {
        name: "map2",
        center: [],
        neighborhood: "",
        city: "",
        country: "",
        map_select: false,
        map_set: false
    }
};



// Event listener for map click
map1.on('click', async (e) => {
    mapState.map1.center = [e.lngLat.lng, e.lngLat.lat];

    // Update the source with the new circle
    let circleGeoJSON_left = createCircle(mapState.map1.center, search_radius);
    map1.getSource('circle').setData(circleGeoJSON_left);
    fitCircleToBounds(map1, mapState.map1.center, search_radius, 50) // Zoom to that circle 

    document.getElementById("map1-set-point").classList.add("true");
    mapState.map1.map_select = true;
    
    getLocationDetails(mapState.map1.center[1], mapState.map1.center[0]).then(location => {
        mapState.map1.neighborhood = location.neighborhood;
        mapState.map1.city = location.city;
        mapState.map1.country = location.country;
    });
});

// Event listener for map click
map2.on('click', async (e) => {
    mapState.map2.center = [e.lngLat.lng, e.lngLat.lat];

    // Update the source with the new circle
    let circleGeoJSON_right = createCircle(mapState.map2.center, search_radius);
    map2.getSource('circle').setData(circleGeoJSON_right);
    fitCircleToBounds(map2, mapState.map2.center, search_radius, 50) // Zoom to that circle 

    document.getElementById("map2-set-point").classList.add("true");
    mapState.map2.map_select = true;

    getLocationDetails(mapState.map2.center[1], mapState.map2.center[0]).then(location => {
        mapState.map2.neighborhood = location.neighborhood;
        mapState.map2.city = location.city;
        mapState.map2.country = location.country;
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

function createCloseHandler(map, mapId, buttonId, setPointId, searchBoxId, titleId) {
    return function () {
        // Clear map sources
        map.getSource("restaurants").setData({ type: "FeatureCollection", features: [] });
        map.getSource("buildings").setData({ type: "FeatureCollection", features: [] });
        map.getSource("circle").setData({ type: "FeatureCollection", features: [] });

        // Update UI elements
        document.getElementById(buttonId).classList.remove("true");
        document.getElementById(mapId).classList.remove("true");
        document.getElementById(setPointId).classList.remove("hide", "true");
        document.getElementById(searchBoxId).classList.remove("hide");
        document.getElementById(titleId).classList.add("hide");

        // Enable interactions on the map
        enableMapInteractions(map);

        // Update variables (assuming these exist globally)
        if (mapId === "map1-id") {
            mapState.map1.map_select = false;
            mapState.map1.map_set = false;
        } else if (mapId === "map2-id") {
            mapState.map2.map_select = false;
            mapState.map2.map_set = false;
        }
    };
}

// Attach event listeners for both maps
document.getElementById("map1-close-butt").addEventListener("click", 
    createCloseHandler(map1, "map1-id", "map1-close-butt", "map1-set-point", "searchbox-container-left", "title-block-left")
);

document.getElementById("map2-close-butt").addEventListener("click", 
    createCloseHandler(map2, "map2-id", "map2-close-butt", "map2-set-point", "searchbox-container-right", "title-block-right")
);

// SET POINT BUTTON FUNCTIONALITY ---------------------------------------------------------------

export function createSetPointHandler(mapKey, map, mapId, buttonId, setPointId, searchBoxId, titleId) {
    return async function () {
        const state = mapState[mapKey]; // Get state for the correct map

        if (state.map_select) {
            fitCircleToBounds(map, state.center, search_radius, 0);
            map.getSource("circle").setData({ type: "FeatureCollection", features: [] });

            // Update UI elements
            document.getElementById(mapId).classList.add("true");
            document.getElementById(buttonId).classList.add("true");
            document.getElementById(setPointId).classList.add("hide");
            document.getElementById(searchBoxId).classList.add("hide");

            document.getElementById(titleId).querySelector('div').innerText = state.neighborhood
            document.getElementById(titleId).querySelectorAll('div')[1].innerText = state.city
            document.getElementById(titleId).classList.remove("hide");

            // Handle visualization mode
            if (viz_type === "heatmap") {
                showRestaurants(state.name, map, state.center[1], state.center[0], search_radius);
                // state.map_select = false;   
            } 

            if (viz_type === "buildings") {
                showBuildings(state.name, map, state.center[1], state.center[0], search_radius);
                // state.map_select = false; 
            }
            state.map_set = true;
        }
    };
}



// Attach event listeners for both maps
document.getElementById("map1-set-point").addEventListener("click", 
    createSetPointHandler("map1", map1, "map1-id", "map1-close-butt", "map1-set-point", "searchbox-container-left", "title-block-left")
);

document.getElementById("map2-set-point").addEventListener("click", 
    createSetPointHandler("map2", map2, "map2-id", "map2-close-butt", "map2-set-point", "searchbox-container-right", "title-block-right")
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

function updateHeatmap() {
    console.log(map1)
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
