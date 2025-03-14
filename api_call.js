


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