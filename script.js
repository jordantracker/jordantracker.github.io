var waypoints = [];
var control;
var prevLocs = {};

var jordanIcon = L.icon({
    iconUrl: 'jordan120.png',
    iconSize: [120, 78],
    iconAnchor: [100, 60],
    popupAnchor: [-50,-60]
});

var bedIcon = L.icon({
    iconUrl: 'bed.png',
    iconSize: [50,50],
    iconAnchor: [25,25],
    popupAnchor: [-50,-50]
});

fetch(
    "https://opensheet.elk.sh/1cC8Uyel5C20MYKRhzgqrWAc9QtFiVKj_ZPSIOIX-XoQ/2"
  )
    .then((res) => res.json())
    .then((data) => {
        prevLocs = data;
        data.forEach((row, key, arr) => {
            waypoints.push(L.latLng(row['Lat'],row['Long']));
            if (!Object.is(arr.length - 1, key)) {
                L.marker([row['Lat'],row['Long']],{icon: bedIcon}).addTo(map);
            }
        });
        console.log(waypoints);
        control = L.Routing.control({
            waypoints: waypoints,
            dragableWaypoints: false,
            routeWhileDragging: false,
            show: false,
            lineOptions: {
                addWaypoints: false
            },
            createMarker: function() {return null;}
            // geocoder: L.Control.Geocoder.nominatim()
        }).addTo(map);
        currentLocMarker.setLatLng(waypoints[waypoints.length-1]).setZIndexOffset(2);
        map.setView(waypoints[waypoints.length-1],13,{zoom: {animate: true}, pan: {animate: true, duration: 2, easeLinearity: 0.5}});
    });

var map = L.map('map').setView([-31.9078188,115.8118231], 13);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}').addTo(map);

currentLocMarker = L.marker([-31.9078188,115.8118231], {icon: jordanIcon});
currentLocMarker.bindPopup("<b>Where is Jordan now?</b><br>Here he is!")
currentLocMarker.addTo(map);