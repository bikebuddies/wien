/* Code teilweise von Vienna mobile Beispiel */

// Zentrum Karte Objekt
let stpolten = {
    lat: 48.33001133291213,
    lng: 16.060959034595086,
    title: "Wien Zentrum"
}

// Karte initialisieren und Fullscreen Control 
let map = L.map("map", {
    fullscreenControl: true
}).setView([
    48.17, 16.38 // Koordinaten des Zentrums von Wien
], 11);

// thematische Layer
let themaLayer = {
    untenundoben: L.featureGroup(), //https://www.mobilitaetsagentur.at/touren/#unten-oben
    wienerwasser: L.featureGroup(), //https://www.mobilitaetsagentur.at/touren/#wiener-wasser
    donaustadt: L.featureGroup(), //https://www.mobilitaetsagentur.at/touren/#donaustadt
    wasserzuwein: L.featureGroup(), //https://www.mobilitaetsagentur.at/touren/#wasser-zu-wein
    wienerwald: L.featureGroup(), //https://www.mobilitaetsagentur.at/touren/#euro-velo-9-wienerwald
    forecast: L.featureGroup(),
    badeseen: L.featureGroup(),
}

//Hintergrundlayer 
//noch den schöneren von der Hauptkarte einfügen, wenn wir das geschafft haben 
let eGrundkarteWien = L.control.layers({
    "Terrain": L.tileLayer.provider("Stamen.Terrain").addTo(map),
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.DE"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "CycleTrails": L.tileLayer.provider("CyclOSM"),
}, {
    "Unten und Oben": themaLayer.untenundoben.addTo(map),
    "Wiener Wasser": themaLayer.wienerwasser.addTo(map),
    "Donaustadt": themaLayer.donaustadt.addTo(map),
    "Wasser zu Wein": themaLayer.wasserzuwein.addTo(map),
    "Wienerwald": themaLayer.wienerwald.addTo(map),
    "Wettervorhersage MET Norway": themaLayer.forecast,
    "Badeseen": themaLayer.badeseen
}).addTo(map);

// Layer beim Besuch auf der Seite ausklappen
//layerControl.expand(); //funktioniert leider nicht

// Instanz Leaflet MiniMap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
    toggleDisplay: true,
}
).addTo(map);

//Geolocation
map.locate({
    setView: false,
    maxZoom: 16,
    watch: true,
});

let circle = L.circle([0, 0], 0).addTo(map);

map.on('locationfound', function (evt) {
    let radius = Math.round(evt.accuracy);
    L.circle(evt.latlng, radius).addTo(map);
    circle.setLatLng(evt.latlng);
    circle.setRadius(radius);
}
);

var errorDisplayed = false;

map.on('locationerror', function (evt) {
    if (!errorDisplayed) {
        alert(evt.message);
        errorDisplayed = true;
    }
});

// Wettervorhersage MET Norway
async function showForecast(url, latlng) {
    let response = await fetch(url);
    let jsondata = await response.json();

    let current = jsondata.properties.timeseries[0].data.instant.details;

    let timestamp = new Date(jsondata.properties.meta.updated_at).toLocaleString();

    let timeseries = jsondata.properties.timeseries;

    let markup = `
        <h4>Wetter für ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (${timestamp})</h4>
        <table>
            <tr><td>Lufttemperatur (C)</td><td>${current.air_temperature}</td></tr>
            <tr><td>Bewölkungsgrad (%)</td><td>${current.cloud_area_fraction}</td></tr>
            <tr><td>Luftfeuchtigkeit (%)</td><td>${current.relative_humidity}</td></tr>
            <tr><td>Windrichtung (°)</td><td>${current.wind_from_direction}</td></tr>
            <tr><td>Windgeschwindigkeit (m/s)</td><td>${current.wind_speed}</td></tr>
        </table>
    `;

    // Wettersymbole hinzufügen
    for (let i = 0; i <= 24; i += 3) {
        //console.log(timeseries[i]);
        let icon = timeseries[i].data.next_1_hours.summary.symbol_code;
        let img = `icons/${icon}.svg`;
        markup += `<img src="${img}" style="width:32px;" title="${timeseries[i].time.toLocaleString()}">`
        //console.log(icon, img);
    }
    L.popup().setLatLng(latlng).setContent(markup).openOn(themaLayer.forecast);
};

// Wettervorhersage auf Kartenklick reagieren (Event via map.on)
map.on("click", function (evt) {
    console.log(evt);
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}`;
    showForecast(url, evt.latlng);
});


//GPX-Tracks
//Unten und Oben Track
var gpx = './data/5_Unten-amp-Oben.gpx';
let kamp = new L.GPX(gpx, {
    polyline_options: {
        color: '#8B008B',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.untenundoben);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
kamp.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/5_Unten-amp-Oben.gpx")
});


//Wienerwasser
var gpx = './data/6_Wiener-Wasser.gpx';
let wienerwasser = new L.GPX(gpx, {
    polyline_options: {
        color: '#FF1234',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.wienerwasser);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
wienerwasser.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/6_Wiener-Wasser.gpx")
});


//Donaustadt
var gpx = './data/donaustadt.gpx';
let donaustadt = new L.GPX(gpx, {
    polyline_options: {
        color: '#00FF00',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.donaustadt);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
donaustadt.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/donaustadt.gpx")
});


//Wasser zu Wein
var gpx = './data/Wasser-zu-Wein.gpx';
let wasserzuwein = new L.GPX(gpx, {
    polyline_options: {
        color: '#000000',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.wasserzuwein);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
wasserzuwein.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/Wasser-zu-Wein.gpx")
});


//Wienerwald
var gpx = './data/Wienerwald.gpx';
let winerwald = new L.GPX(gpx, {
    polyline_options: {
        color: '#00008B',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.wienerwald);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
wasserzuwein.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "wienerwald"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/Wienerwald.gpx")
});


//Badeseen
const BADESEEN = [
    {
        title: "Badeteich Hirschstetten", 
        lat: 48.24409868606938, 
        lng: 16.47893976489515,
    },
    {
        title: "Dechantlacke", 
        lat: 48.19111090673952,
        lng: 16.476402395256347,
    },
    {
        title: "Wienerbergteich", 
        lat: 48.161023220047774,
        lng: 16.35031677503551
    },
    {
        title: "Haderdorfer Bad", 
        lat: 48.208558890188606,  
        lng: 16.222905203752738,
    }
];

for (let badeseen of BADESEEN) {
    L.marker([badeseen.lat, badeseen.lng], {
        icon: L.icon({
            iconUrl: `icons/swimming.png`,
            popupAnchor: [0, -37],
            iconAnchor: [16, 37],
        })
    })
        .addTo(themaLayer.badeseen)
        .bindPopup(`<b>${badeseen.title}</b> <br>
    `)
};


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// //GPX-Track visualisieren -> Höhenprofile (es sind noch nicht alle)
// let controlElevation = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation.load("data/niederoesterreich/piestingtal.gpx");

// //GPX-Track visualisieren
// let controlElevation1 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation1.load("data/niederoesterreich/kamp_thaya_march.gpx")

// //GPX-Track visualisieren
// let controlElevation2 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation2.load("data/niederoesterreich/thayarunde.gpx")

// //GPX-Track visualisieren
// let controlElevation3 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation3.load("data/niederoesterreich/traisentalweg.gpx")

// //GPX-Track visualisieren
// let controlElevation4 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation4.load("triesting_goelsental.gpx")

// //GPX-Track visualisieren
// let controlElevation5 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation5.load("data/niederoesterreich/traisentalweg.gpx")

//Kommentare aus der start-Seite
/* Pulldownmenü Code
//Pulldown für Navigation
let pulldown = document.querySelector("#pulldown");
for (let etappe of ETAPPEN) {
    //console.log(etappe);
    let status = "";
    if (etappe.nr == "20") {
        status = "selected";
    }
    pulldown.innerHTML += `<option ${status} value="${etappe.user}">Etappe ${etappe.nr}: ${etappe.etappe}</option>`
}

// auf Änderungen im Pulldown reagieren
pulldown.onchange = function(evt) {
    //console.log(pulldown.value);
    let url = `https://${pulldown.value}.github.io/biketirol`;
    //console.log(url);
    window.location.href = url;
}
*/

/*
let circle = L.circle([0, 0], 0).addTo(map);
let marker = L.marker([0, 0], 0).addTo(map);

map.on('locationfound', function onLocationFound(evt) {
    console.log(evt);
    let radius = Math.round(evt.accuracy);
    marker.setLatLng(evt.latlng);
    marker.bindTooltip(`You are within ${radius} meters from this point`).openTooltip();
    circle.setLatLng(evt.latlng);
    circle.setRadius(radius);
});

map.on('locationerror', function onLocationError(evt) {
    alert(evt.message);
});
*/