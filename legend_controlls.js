import { search_radius, setSearchRadius, viz_type, setVizType } from "./config.js";
import { map1, map2, mapState, createCircle, fitCircleToBounds, createSetPointHandler, updateHeatmap, adjustOpacity } from "./script.js";
import { showBuildings, showRestaurants } from "./api_calls.js";


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

        setVizType(selectedValue);

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
        if(mapState.map1.map_set){
            if (viz_type === "heatmap") {
                document.getElementById("bldg-stat-left").classList.add("hide");
                showRestaurants(mapState.map1.name, map1, mapState.map1.center[1], mapState.map1.center[0], search_radius)
                adjustOpacity(map1, 1)
                mapState.map1.map_select = false;   
            } 
            if (viz_type === "buildings") {
                document.getElementById("summary-stat-left").classList.add("hide");
                showBuildings(mapState.map1.name, map1, mapState.map1.center[1], mapState.map1.center[0], search_radius)
                adjustOpacity(map1, 0)
                mapState.map1.map_select = false; 
            }
        }
        if(mapState.map2.map_set){
            if (viz_type === "heatmap") {
                document.getElementById("bldg-stat-right").classList.add("hide");
                showRestaurants(mapState.map2.name, map2, mapState.map2.center[1], mapState.map2.center[0], search_radius)
                adjustOpacity(map2, 1)
                mapState.map2.map_select = false;   
            } 
            if (viz_type === "buildings") {
                document.getElementById("summary-stat-right").classList.add("hide");
                showBuildings(mapState.map2.name, map2, mapState.map2.center[1], mapState.map2.center[0], search_radius)
                adjustOpacity(map2, 0)
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
        
        // update the scale at left
        document.getElementById("scale-label-id").textContent = (selectedValue_rad*2)+"m";

        // update radius and intensity slider values

        const heatmap_settings = {
            500: {radius: 50, intensity: 0.3},
            750: {radius: 50, intensity: 0.3},
            1000: {radius: 50, intensity: 0.15},
            1500: {radius: 40, intensity: 0.1}
        }

        document.getElementById("radius-slider").value = heatmap_settings[selectedValue_rad].radius;
        document.getElementById("slider-value-radius").textContent = heatmap_settings[selectedValue_rad].radius;

        document.getElementById("intensity-slider").value = heatmap_settings[selectedValue_rad].intensity;
        document.getElementById("slider-value-intensity").textContent = heatmap_settings[selectedValue_rad].intensity;

        updateHeatmap();


        document.getElementById("dropdownContent-rad").classList.remove("show");
        setSearchRadius(selectedValue_rad)
        // search_radius = selectedValue_rad

        if (mapState.map1.map_select){
            let circleGeoJSON_left = createCircle(mapState.map1.center, search_radius);
            map1.getSource('circle').setData(circleGeoJSON_left);
            fitCircleToBounds(map1, mapState.map1.center, search_radius, 50) // Zoom to that circle 
        }

        if (mapState.map1.map_set){
            map1.getSource('circle').setData({ type: "FeatureCollection", features: [] });
            fitCircleToBounds(map1, mapState.map1.center, search_radius, 0) // Zoom to that circle 
            // createSetPointHandler("map1", map1, "map1-id", "map1-close-butt", "map1-set-point", "searchbox-container-left", "title-block-left")()
            createSetPointHandler(map1,"map1",)()
        }

        if (mapState.map2.map_select){
            let circleGeoJSON_right = createCircle(mapState.map2.center, search_radius);
            map2.getSource('circle').setData(circleGeoJSON_right);
            fitCircleToBounds(map2, mapState.map2.center, search_radius, 50) // Zoom to that circle 
        }

        if (mapState.map2.map_set){
            map2.getSource('circle').setData({ type: "FeatureCollection", features: [] });
            fitCircleToBounds(map2, mapState.map2.center, search_radius, 0) // Zoom to that circle 
            // createSetPointHandler("map2", map2, "map2-id", "map2-close-butt", "map2-set-point", "searchbox-container-right", "title-block-right")();
            createSetPointHandler(map2,"map2",)()
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
    document.getElementById("settingsMenu").classList.remove("hide");
    document.getElementById("legend-subcontainer-id").classList.add("hide");
});

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {
    if (!event.target.closest(".legend-container")) {
        document.getElementById("settingsMenu").classList.add("hide");
        document.getElementById("legend-subcontainer-id").classList.remove("hide");
    }
});
