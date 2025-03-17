const overpassQuery = (lat, lon, radius) => {
    // console.log(lat,lon,radius)

    const query = `[out:json];(node["amenity"="restaurant"](around:${radius},${lat},${lon}););out center;`;

    //  // Food and Bev  (including nightlife)
    // fb = [amenit = cafe,
    // amenti = restuarant,
    // amenit = bar,
    // amenit = pub]
 

    // // Arts and Entertainment 

    // ae = [amenity = library,
    // amenity = music_school,
    // amenity = cinema,
    // amenity = events_venue,
    // amenity = theatre,
    // amenity = casino,
    // tourism = gallery,
    // tourism = theme_park,
    // tourism = zoo]


    // // Services & Convenience 
    // sc = [amenity = fast_food,
    // amenity	= bank,
    // amenity	= doctors,
    // amenity	= dentist,
    // amenity	= clinic,
    // amenity	= pharmacy,
    // amenity	= post_office,
    // amenity	= place_of_worship]


    // // Parks & Rec
    // pr = [leisure = garden,
    // leisure	= dog_park,
    // leisure	= beach_resort,
    // natural	= beach,
    // leisure	= park,
    // leisure	= nature_reserve,
    // leisure	= swimming_pool,
    // leisure	= swimming_area,
    // leisure	= sports_centre,
    // landuse	= recreation_ground]

    // // Hotels
    // htl = [building = hotel,
    // tourism	= hotel,
    // tourism	= guest_house]      

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


export async function showBuildings(name, map, lat, lon, search_radius){
    let spinner_div_bldgs = "";
    if (name === "map1") {spinner_div_bldgs = "loading-spinner-left"};
    if (name === "map2") {spinner_div_bldgs = "loading-spinner-right"};

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

export async function showRestaurants(name, map, lat, lon, search_radius) {
    let spinner_div_rest = "";
    if (name === "map1") {spinner_div_rest = "loading-spinner-left"};
    if (name === "map2") {spinner_div_rest = "loading-spinner-right"};

    let spinner_rest = document.getElementById(spinner_div_rest);
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


// GET LOCATION DETAILS  ---------------------------------------------------------------

export async function getLocationDetails(lat, lon, attempts = 5, offset = 0.0005) {
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