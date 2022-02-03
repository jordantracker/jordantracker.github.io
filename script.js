var waypoints = [];
var currentLoc;
var control;
var prevLocs = {};
var currentDateTime = new Date();

console.log(currentDateTime);


var jordanIcon = L.icon({
    iconUrl: 'icons/jordanIcon.png',
    iconSize: [120, 77],
    iconAnchor: [100, 60],
    popupAnchor: [-50,-60]
});

// var bedIcon = L.icon({
//     iconUrl: 'icons/sleep.png',
//     iconSize: [30,30],
//     iconAnchor: [15,15],
//     popupAnchor: [0,-15]
// });

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
    wine: 'icons/wine.png'
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
        data.forEach((row, key, arr) => {
            //console.log(row['Arrival_date']+' '+row['Arrival_time']);
            let arrivalDateTime = new Date(row['Arrival_date']+' '+row['Arrival_time']);
            let departureDateTime = new Date(row['Departure_date']+' '+row['Departure_time']);
            //console.log(arrivalDateTime);
            //if (!Object.is(arr.length - 1, key)) {
            if (currentDateTime >= departureDateTime) {
                if (row['Icon'] != 'NO_ICON') {
                    L.marker([row['Lat'],row['Long']],{icon: icons[row['Icon']]}).bindPopup(row['Text_address']).addTo(map);
                }
                waypoints.push(L.latLng(row['Lat'],row['Long']));
            } else if (currentDateTime >= arrivalDateTime && currentDateTime < departureDateTime) {
                currentLoc = L.latLng(row['Lat'],row['Long']);
                waypoints.push(L.latLng(row['Lat'],row['Long']));
            }
        });
        console.log(waypoints);
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
            // geocoder: L.Control.Geocoder.nominatim()
        }).addTo(map);
        currentLocMarker.setLatLng(currentLoc).setZIndexOffset(2);
        map.setView(currentLoc,11,{zoom: {animate: true}, pan: {animate: true, duration: 2, easeLinearity: 0.5}});
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