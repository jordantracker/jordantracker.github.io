var waypoints = [];
var control;
var prevLocs = {};

var jordanIcon = L.icon({
    iconUrl: 'jordanIcon.png',
    iconSize: [120, 77],
    iconAnchor: [100, 60],
    popupAnchor: [-50,-60]
});

var bedIcon = L.icon({
    iconUrl: 'sleep.png',
    iconSize: [30,30],
    iconAnchor: [15,15],
    popupAnchor: [0,-15]
});

fetch(
    "https://opensheet.elk.sh/1V0RjANEotzZ9Bv8i7i4CF5bYSx4a_vEY21odED62l1Q/1"
  )
    .then((res) => res.json())
    .then((data) => {
        prevLocs = data;
        data.forEach((row, key, arr) => {
            waypoints.push(L.latLng(row['Lat'],row['Long']));
            if (!Object.is(arr.length - 1, key)) {
                L.marker([row['Lat'],row['Long']],{icon: bedIcon}).bindPopup(row['Text_address']).addTo(map);
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
        currentLocMarker.setLatLng(waypoints[waypoints.length-1]).setZIndexOffset(2);
        map.setView(waypoints[waypoints.length-1],11,{zoom: {animate: true}, pan: {animate: true, duration: 2, easeLinearity: 0.5}});
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