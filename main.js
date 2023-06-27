// Zentrum Karte Objekt
let wien = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Wien Zentrum"
}

// Karte initialisieren und Fullscreen Control 
let map = L.map("map", {
    fullscreenControl: true
}).setView([
    wien.lat, wien.lng
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
let layerControl = L.control.layers({
    "BasemapÖsterreich": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "StamenB/W": L.tileLayer.provider("Stamen.TonerLite"),
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
layerControl.expand();

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

let errorDisplayed = false;

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
        let icon = timeseries[i].data.next_1_hours.summary.symbol_code;
        let img = `icons/${icon}.svg`;
        markup += `<img src="${img}" style="width:32px;" title="${timeseries[i].time.toLocaleString()}">`
    };
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
        color: '#E9967A',
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
        theme: "unten_oben"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/5_Unten-amp-Oben.gpx")
});


//Wienerwasser
var gpx = './data/6_Wiener-Wasser.gpx';
let wienerwasser = new L.GPX(gpx, {
    polyline_options: {
        color: '#FF8247',
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
        theme: "wiener_wasser"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/6_Wiener-Wasser.gpx")
});


//Donaustadt
var gpx = './data/donaustadt.gpx';
let donaustadt = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFA500',
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
        theme: "donaustadt"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/donaustadt.gpx")
});


//Wasser zu Wein
var gpx = './data/Wasser-zu-Wein.gpx';
let wasserzuwein = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFDAB9',
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
        theme: "wasser_wein"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/Wasser-zu-Wein.gpx")
});


//Wienerwald
var gpx = './data/Wienerwald.gpx';
let wienerwald = new L.GPX(gpx, {
    polyline_options: {
        color: '#EED5B7',
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
wienerwald.on("click", function (evt) {
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