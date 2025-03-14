mapboxgl.accessToken = 'pk.eyJ1IjoicHRyc3prd2N6IiwiYSI6ImNscGkxOHVvbjA2eW8ybG80NDJ3ajBtMWwifQ.L2qe-aJO35nls3sfd0WKPA';

const map1 = new mapboxgl.Map({
    container: 'map1-id',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [12.479457320485057, 41.89756861026971], 
    zoom: 13
});

const map2 = new mapboxgl.Map({
    container: 'map2-id',
    // style: 'mapbox://styles/mapbox/satellite-v9',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-73.95022547782283, 40.6803981302293], 
    zoom: 13
});

var search_radius = 750;

// var view_mode_left = false;
// var view_mode_right = false;

let viz_type = "heatmap";

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
                    13, 0.2,
                    14, 0.4
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
function createCircle(center, radiusInMeters) {
    return turf.circle(center, radiusInMeters, { steps: 64, units: 'meters' });
}

// var center_left = [];
// var center_right = [];

// Store state for both maps
const mapState = {
    map1: {
        center: [],
        neighborhood: "",
        city: "",
        country: "",
        map_select: false,
        map_set: false
    },
    map2: {
        center: [],
        neighborhood: "",
        city: "",
        country: "",
        map_select: false,
        map_set: false
    }
};

// const mapState = {
//     map_select_left: false,
//     map_select_right: false,
//     map_set_left: false,
//     map_set_right: false
// };

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



const overpassQuery = (lat, lon, radius) => {
    // console.log(lat,lon,radius)

    const query = `[out:json];(node["amenity"="restaurant"](around:${radius},${lat},${lon}););out center;`;
    return `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
};

const fetchRestaurants = async (lat, lon, radius) => {
    try {
        const response = await fetch(overpassQuery(lat, lon, radius));
        const data = await response.json();

        function convertToGeoJSON(data) {
            const pois = [];
        
            if (!data || !data.elements) {
                console.error("Invalid API response format.");
                return { type: "FeatureCollection", features: [] };
            }
        
            for (const element of data.elements) {
                if (!element.tags || !element.tags.name) {
                    continue; // Skip elements without a name
                }
        
                // Extract coordinates
                const poiCoords = [element.lon, element.lat];
                const name = element.tags.name;
        
                const feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: poiCoords
                    },
                    properties: {
                        name: name,
                        // OSM_category: category,
                        // OSM_subcat: subcategory,
                        lat: poiCoords[1],
                        lon: poiCoords[0],
                        geo_type: element.type
                    }
                };
        
                pois.push(feature);
            }
        
            return { type: "FeatureCollection", features: pois };
        }

        let formatted_response = convertToGeoJSON(data)
        // console.log(formatted_response)
        return formatted_response

        
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};


function fitCircleToBounds(map, center, radius, padding) {
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

async function fetchBuildingFootprints(lat, lon, radius = 750) {
    const query = `
        [out:json];
        (
            way["building"](around:${radius}, ${lat}, ${lon});
            relation["building"](around:${radius}, ${lat}, ${lon});
        );
        out body;
        >;
        out skel qt;
    `;
    
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data from Overpass API");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching building footprints:", error);
        return null;
    }
}

function convertToGeoJSON(overpassData) {
    if (!overpassData || !overpassData.elements) return null;
    
    const nodes = {};
    const ways = {};
    const relations = [];
    
    overpassData.elements.forEach(element => {
        if (element.type === "node") {
            nodes[element.id] = [element.lon, element.lat];
        } else if (element.type === "way") {
            ways[element.id] = element.nodes.map(nodeId => nodes[nodeId]).filter(Boolean);
        } else if (element.type === "relation") {
            relations.push(element);
        }
    });
    
    const features = [];
    
    // Process ways into polygons
    Object.values(ways).forEach(coordinates => {
        if (coordinates.length < 3) return; // Ignore invalid geometries
        coordinates.push(coordinates[0]); // Close the polygon
        
        features.push({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [coordinates]
            },
            properties: {}
        });
    });
    
    // Process relations
    relations.forEach(relation => {
        const outerRings = [];
        
        relation.members.forEach(member => {
            if (member.type === "way" && ways[member.ref] && member.role === "outer") {
                outerRings.push(ways[member.ref]);
            }
        });
        
        if (outerRings.length > 0) {
            features.push({
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: outerRings
                },
                properties: relation.tags || {}
            });
        }
    });
    
    return {
        type: "FeatureCollection",
        features
    };
}

function convertToGeoJSON_old(overpassData) {
    if (!overpassData || !overpassData.elements) return null;
    
    const nodes = {};
    overpassData.elements.forEach(element => {
        if (element.type === "node") {
            nodes[element.id] = [element.lon, element.lat];
        }
    });
    
    const features = overpassData.elements
        .filter(element => element.type === "way" && element.nodes)
        .map(way => {
            const coordinates = way.nodes.map(nodeId => nodes[nodeId]).filter(Boolean);
            if (coordinates.length < 3) return null; // Ignore invalid geometries
            coordinates.push(coordinates[0]); // Close the polygon

            return {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [coordinates]
                },
                properties: way.tags || {}
            };
        }).filter(Boolean);
    
    return {
        type: "FeatureCollection",
        features
    };
}

async function getBuildingGeoJSON(lat, lon, radius = 750) {
    const overpassData = await fetchBuildingFootprints(lat, lon, radius);
    if (!overpassData) return null;
    return convertToGeoJSON_old(overpassData);
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

function createSetPointHandler(mapKey, map, mapId, buttonId, setPointId, searchBoxId, titleId) {
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
                showRestaurants(map, state.center[1], state.center[0], search_radius);
                // state.map_select = false;   
            } 

            if (viz_type === "buildings") {
                showBuildings(map, state.center[1], state.center[0], search_radius);
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



// async function showBuildings(map, lat, lon, search_radius){
//     map.getSource('restaurants').setData({ type: "FeatureCollection", features: [] });
//     const bldgData = await getBuildingGeoJSON(lat, lon, search_radius)
//     map.getSource('buildings').setData(bldgData);
// }

// async function showRestaurants(map, lat, lon, search_radius){
//     map.getSource('buildings').setData({ type: "FeatureCollection", features: [] });
//     const restaurantData = await fetchRestaurants(lat, lon, search_radius)
//     map.getSource('restaurants').setData(restaurantData);
// }

async function showBuildings(map, lat, lon, search_radius){
    let spinner_div_bldgs = "";
    if (map === map1) {spinner_div_bldgs = "loading-spinner-left"};
    if (map === map2) {spinner_div_bldgs = "loading-spinner-right"};

    let spinner_bldgs = document.getElementById(spinner_div_bldgs);
    spinner_bldgs.style.display = "block"; // Show spinner

    try {
        map.getSource('restaurants').setData({ type: "FeatureCollection", features: [] });
        const bldgData = await getBuildingGeoJSON(lat, lon, search_radius)
        map.getSource('buildings').setData(bldgData);

    } catch (error) {
        console.error("Error fetching building data:", error);
    } finally {
        spinner_bldgs.style.display = "none"; // Hide spinner when done
    }

    
}

async function showRestaurants(map, lat, lon, search_radius) {
    let spinner_div_rest = "";
    if (map === map1) {spinner_div_rest = "loading-spinner-left"};
    if (map === map2) {spinner_div_rest = "loading-spinner-right"};

    console.log(spinner_div_rest)
    let spinner_rest = document.getElementById(spinner_div_rest);
    console.log(spinner_rest)
    spinner_rest.style.display = "block"; // Show spinner

    try {
        map.getSource('buildings').setData({ type: "FeatureCollection", features: [] });

        const restaurantData = await fetchRestaurants(lat, lon, search_radius);
        map.getSource('restaurants').setData(restaurantData);
    } catch (error) {
        console.error("Error fetching restaurant data:", error);
    } finally {
        spinner_rest.style.display = "none"; // Hide spinner when done
    }
}




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


// CLICK TO CHANGE VIZ TYPE ---------------------------------------------------------------

document.getElementById("dropdownButton").addEventListener("click", function() {
    document.getElementById("dropdownContent").classList.toggle("show");
});

document.getElementById("dropdownContent").querySelectorAll(".dropdown-content div").forEach(item => {
    item.addEventListener("click", function() {
        let selectedText = this.textContent;
        let selectedValue = this.getAttribute("data-value");

        // document.getElementById("dropdownButton").textContent = selectedText;
        document.getElementById("dropdownButton").innerHTML = ``;
        document.getElementById("dropdownButton").innerHTML = 
            `<div>${selectedText}</div>
            <img src="./assets/icons/Icon_arrowDown.svg" class = "arrowDown">`;

        viz_type = selectedValue;

        // toggle between legend types
        if (viz_type === "heatmap") {
            document.getElementById("legend-amenDen").classList.remove("hide");
            document.getElementById("legend-landUse").classList.add("hide");
        }
        if (viz_type === "buildings") {
            document.getElementById("legend-amenDen").classList.add("hide");
            document.getElementById("legend-landUse").classList.remove("hide");
        }

        // change state of map(s)
        console.log(mapState.map1.map_set, mapState.map2.map_set, viz_type)
        if(mapState.map1.map_set){
            if (viz_type === "heatmap") {
                showRestaurants(map1, mapState.map1.center[1], mapState.map1.center[0], search_radius)
                mapState.map1.map_select = false;   
            } 
            if (viz_type === "buildings") {
                showBuildings(map1, mapState.map1.center[1], mapState.map1.center[0], search_radius)
                mapState.map1.map_select = false; 
            }
        }
        if(mapState.map2.map_set){
            if (viz_type === "heatmap") {
                showRestaurants(map2, mapState.map2.center[1], mapState.map2.center[0], search_radius)
                mapState.map2.map_select = false;   
            } 
            if (viz_type === "buildings") {
                showBuildings(map2, mapState.map2.center[1], mapState.map2.center[0], search_radius)
                mapState.map2.map_select = false; 
            }
        }

        document.getElementById("dropdownContent").classList.remove("show");
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {
    if (!event.target.closest(".dropdown")) {
        document.getElementById("dropdownContent").classList.remove("show");
    }
});



// GET LOCATION DETAILS  ---------------------------------------------------------------

async function getLocationDetails(lat, lon, attempts = 5, offset = 0.0005) {
    const url = (lat, lon) => 
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

    for (let i = 0; i < attempts; i++) {
        // Slightly modify lat/lon for new attempts
        let newLat = lat + (Math.random() - 0.5) * offset;
        let newLon = lon + (Math.random() - 0.5) * offset;

        try {
            const response = await fetch(url(newLat, newLon));
            const data = await response.json();

            if (data.error) {
                console.warn(`Attempt ${i + 1}: No data found for ${newLat}, ${newLon}`);
                continue;
            }

            // Try to get the best available neighborhood equivalent
            const neighborhood = data.address.neighbourhood ||
                                 data.address.city_district ||
                                 data.address.quarter ||
                                 data.address.suburb || 'N/A';

            const city = data.address.city || data.address.town || data.address.village || 'N/A';
            const country = data.address.country || 'N/A';

            if (neighborhood !== 'N/A') {
                return { neighborhood, city, country };
            }
        } catch (error) {
            console.error(`Attempt ${i + 1}: Error fetching location`, error);
        }
    }

    console.warn('No suitable neighborhood found after multiple attempts.');
    return { neighborhood: 'N/A', city: 'N/A', country: 'N/A' };
}

// Example usage:
// const lat = 50.0;
// const lon = 8.6;

// getLocationDetails(lat, lon).then(location => {
//     console.log(`Neighborhood: ${location.neighborhood}`);
//     console.log(`City: ${location.city}`);
//     console.log(`Country: ${location.country}`);
// });


// Example usage:
// const lat = 50.0;
// const lon = 8.6;


// SLIDERS ---------------------------------------------------------------

function updateHeatmap() {
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



// CLICK TO CHANGE RADIUS TYPE ---------------------------------------------------------------

document.getElementById("dropdownButton-rad").addEventListener("click", function() {
    document.getElementById("dropdownContent-rad").classList.toggle("show");
});

document.getElementById("dropdownContent-rad").querySelectorAll(".dropdown-content div").forEach(item => {
    
    item.addEventListener("click", function() {
        let selectedText_rad = this.textContent;
        let selectedValue_rad = this.getAttribute("data-value");

        // document.getElementById("dropdownButton").textContent = selectedText;
        document.getElementById("dropdownButton-rad").innerHTML = ``;
        document.getElementById("dropdownButton-rad").innerHTML = 
            `<div>${selectedText_rad}</div>
            <img src="./assets/icons/Icon_arrowDown.svg" class = "arrowDown">`;


        document.getElementById("dropdownContent-rad").classList.remove("show");
        search_radius = selectedValue_rad;

        if (mapState.map1.map_select){
            let circleGeoJSON_left = createCircle(mapState.map1.center, search_radius);
            map1.getSource('circle').setData(circleGeoJSON_left);
            fitCircleToBounds(map1, mapState.map1.center, search_radius, 50) // Zoom to that circle 
        }

        if (mapState.map1.map_set){
            map1.getSource('circle').setData({ type: "FeatureCollection", features: [] });
            fitCircleToBounds(map1, mapState.map1.center, search_radius, 0) // Zoom to that circle 
            createSetPointHandler("map1", map1, "map1-id", "map1-close-butt", "map1-set-point", "searchbox-container-left", "title-block-left")();
        }

        if (mapState.map2.map_select){
            let circleGeoJSON_right = createCircle(mapState.map2.center, search_radius);
            map2.getSource('circle').setData(circleGeoJSON_right);
            fitCircleToBounds(map2, mapState.map2.center, search_radius, 50) // Zoom to that circle 
        }

        if (mapState.map2.map_set){
            map2.getSource('circle').setData({ type: "FeatureCollection", features: [] });
            fitCircleToBounds(map2, mapState.map2.center, search_radius, 0) // Zoom to that circle 
            createSetPointHandler("map2", map2, "map2-id", "map2-close-butt", "map2-set-point", "searchbox-container-right", "title-block-right")();
        }
        
    });
});

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {
    if (!event.target.closest(".dropdown")) {
        document.getElementById("dropdownContent-rad").classList.remove("show");
    }
});


document.getElementById("settingsButton").addEventListener("click", function() {
    document.getElementById("settingsMenu").classList.toggle("hide");
});
