var waypoints = [];
var currentLoc;
var control;
var prevLocs = {};
var currentDateTime = new Date();
var etdep;
var etarr;
var prevWaypointIndex;
var timeSincePrevWaypoint;
var currentlyTravelling = false;

var jordanIcon = L.icon({
    iconUrl: 'icons/jordanIcon.png',
    iconSize: [120, 77],
    iconAnchor: [100, 60],
    popupAnchor: [-50,-60]
});

const icon_urls = {
    beer: 'icons/beer.png',
    binoculars: 'icons/binoculars.png',
    carrot: 'icons/carrot.png',
    cheese: 'icons/cheese.png',
    cheescake: 'icons/cheesecake.png',
    cliff: 'icons/cliff.png',
    coffee: 'icons/coffee.png',
    cooked_chook: 'icons/cooked_chook.png',
    crab: 'icons/crab.png',
    cupcake: 'icons/cupcake.png',
    dog_heart: 'icons/dog_heart.png',
    dog_pee: 'icons/dog_pee.png',
    dog_run: 'icons/dog_run.png',
    flat_tire: 'icons/flat_tire.png',
    french_fries: 'icons/french_fries.png',
    hamburger: 'icons/hamburger.png',
    icecream_cone: 'icons/icecream_cone.png',
    lost: 'icons/lost.png',
    milkshake: 'icons/milkshake.png',
    pizza: 'icons/pizza.png',
    rest_stop_toilets: 'icons/rest_stop_toilets.png',
    rice_bowl: 'icons/rice_bowl.png',
    sleep: 'icons/sleep.png',
    spinach: 'icons/spinach.png',
    swimming: 'icons/swimming.png',
    tomato: 'icons/tomato.png',
    trees: 'icons/trees.png',
    walk: 'icons/walk.png',
    watermelon: 'icons/watermelon.png',
    waves: 'icons/waves.png',
    wine: 'icons/wine.png',
    flag: 'icons/flag.png'
}

var icons = {};

for (var [key, value] of Object.entries(icon_urls)) {
    icons[key] = L.icon({
        iconUrl: value,
        iconSize: [25,25],
        iconAnchor: [13,13],
        popupAnchor: [0,-13]
    });
}

fetch(
    "https://opensheet.elk.sh/1V0RjANEotzZ9Bv8i7i4CF5bYSx4a_vEY21odED62l1Q/1"
  )
    .then((res) => res.json())
    .then((data) => {
        prevLocs = data;
        let nextWaypointFound = false;
        data.forEach((row, key, arr) => {
            let arrivalDateTime = new Date(row['Arrival_date']+' '+row['Arrival_time']);
            let departureDateTime = new Date(row['Departure_date']+' '+row['Departure_time']);
            //console.log(data[key+1], key, data.length);
            let nextArrivalDateTime = departureDateTime;
            if (key < data.length - 1) {
                nextArrivalDateTime = new Date(data[key+1]['Arrival_date']+' '+data[key+1]['Arrival_time']);
            }
            //console.log(currentDateTime, arrivalDateTime, departureDateTime, nextArrivalDateTime);
            if (currentDateTime >= departureDateTime) {
                if (row['Icon'] != 'NO_ICON') {
                    L.marker([row['Lat'],row['Long']],{icon: icons[row['Icon']]}).bindPopup(row['Text_address']).addTo(map);
                }
                waypoints.push(L.latLng(row['Lat'],row['Long']));
                prevWaypointIndex = key;
                etdep = departureDateTime;
            }
            if (currentDateTime >= arrivalDateTime && currentDateTime < departureDateTime) {
                if (row['Icon'] != 'NO_ICON') {
                    L.marker([row['Lat'],row['Long']],{icon: icons[row['Icon']]}).bindPopup(row['Text_address']).addTo(map);
                }
                currentLoc = L.latLng(row['Lat'],row['Long']);
                waypoints.push(L.latLng(row['Lat'],row['Long']));
                etarr = arrivalDateTime;
                currentlyTravelling = false;
                console.log("At destination");
            } else if (currentDateTime >= departureDateTime && currentDateTime < nextArrivalDateTime && nextWaypointFound == false) {
            //else if (currentDateTime >= etdep && currentDateTime < arrivalDateTime && nextWaypointFound == false) {
                etarr = nextArrivalDateTime;
                nextWaypointFound = true;
                waypoints.push(L.latLng(row['Lat'],row['Long']));
                waypoints.push(L.latLng(data[key+1]['Lat'],data[key+1]['Long']));
                currentlyTravelling = true;
                currentLoc = L.latLng(data[key+1]['Lat'],data[key+1]['Long']);
                L.marker([data[key+1]['Lat'],data[key+1]['Long']],{icon: icons.flag}).bindPopup('Travelling to:' + data[key+1]['Text_address']).addTo(map);
                console.log('travelling to next destination');
            }
        });
        timeSincePrevWaypoint = (currentDateTime - etdep)/1000;
        console.log(waypoints, timeSincePrevWaypoint);
        control = L.Routing.control({
            waypoints: waypoints,
            dragableWaypoints: false,
            routeWhileDragging: false,
            show: false,
            fitSelectedRoutes: false,
            lineOptions: {
                addWaypoints: false
            },
            createMarker: function() {return null;}
        });
        control.on('routesfound', function(e){
            if (currentlyTravelling == true) {
                var routes = e.routes;
                var summary = routes[0].summary;
                console.log(routes[0]);
                let timeForLegs = 0;
                for (const [arrIndex, el] of routes[0].instructions.entries()) {
                    if (el.index >= routes[0].waypointIndices[prevWaypointIndex]) {
                        timeForLegs += el.time;
                    }
                    if (timeForLegs >= timeSincePrevWaypoint) {
                        let overshotIndex = routes[0].instructions[arrIndex+1].index;
                        let indexesBetween = overshotIndex - el.index;
                        let extraTimeNeeded = timeSincePrevWaypoint - (timeForLegs - el.time);
                        let percentageOfLastLeg = extraTimeNeeded/el.time;
                        approxCurrentIndexOutOfDifference = Math.floor(percentageOfLastLeg*indexesBetween);
                        approxCurrentIndex = el.index + approxCurrentIndexOutOfDifference;

                        currentLoc = routes[0].coordinates[approxCurrentIndex];
                        console.log("Current location should be " + currentLoc);
                        break;
                    }
                }
            }
            //console.log('Total distance is ' + summary.totalDistance / 1000 + ' km and total time is ' + summary.totalTime / 60 + ' minutes');
            
            currentLocMarker.setLatLng(currentLoc).setZIndexOffset(2);
            map.setView(currentLoc,11,{zoom: {animate: true}, pan: {animate: true, duration: 2, easeLinearity: 0.5}});
        });
        control.addTo(map);
        
    });

var baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}');
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {
    center: [-31.9078188,115.8118231],
    zoom: 13,
    layers: [satelliteLayer, baseLayer]
});

baseMaps = {
    'Esri imagery': satelliteLayer,
    'Esri worldmap': baseLayer
}

L.control.layers(baseMaps).addTo(map);

currentLocMarker = L.marker([-31.9078188,115.8118231], {icon: jordanIcon});
currentLocMarker.bindPopup("<b>Where is Jordan now?</b><br>Here he is!")
currentLocMarker.addTo(map);