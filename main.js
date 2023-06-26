/* Code von Vienna mobile Beispiel */

// Zentrum Karte Objekt
let stpolten = {
    lat: 48.33001133291213,
    lng: 16.060959034595086,
    title: "St. Pölten, Niederösterreich"
}


// Karte initialisieren und Fullscreen Control 
let map = L.map("map", {
    fullscreenControl: true
}).setView([
    stpolten.lat, stpolten.lng
], 7.5);


// thematische Layer
let themaLayer = {
    kampThayaMarch: L.featureGroup(),
    piestingtal: L.featureGroup(),
    thayarunde: L.featureGroup(),
    traisental: L.featureGroup(),
    triestingGoelsental: L.featureGroup(),
    triestingau: L.featureGroup(),
    ybbstal: L.featureGroup(),
    eurovelo6: L.featureGroup(),
    eurovelo9: L.featureGroup(),
    eurovelo13: L.featureGroup(),
    forecast: L.featureGroup(),
}


// Hintergrundlayer 
//noch den schöneren von der Hauptkarte einfügen, wenn wir das geschafft haben 
let eGrundkarteWien = L.control.layers({
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.DE").addTo(map),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "CycleTrails": L.tileLayer.provider("CyclOSM"),
}, {
    "Unten und Oben": themaLayer.kampThayaMarch.addTo(map),
    "Piestingtal-Radweg": themaLayer.piestingtal.addTo(map),
    "Thayarunde": themaLayer.thayarunde.addTo(map),
    "Traisental-Radweg": themaLayer.traisental.addTo(map),
    "Triesting-Gölsental-Radweg": themaLayer.triestingGoelsental.addTo(map),
    "Wettervorhersage MET Norway": themaLayer.forecast,
}).addTo(map);


var gpx = './data/niederoesterreich/kamp_thaya_march.gpx';
new L.GPX(gpx, { async: true }, {
    //Polylinien stylen funktioniert noch nicht, marker ausschalten auch nicht
    polyline_options: [{
        color: `#76eec6`,
        opacity: 0.75,
        weight: 3
    }, {
        color: `#76eec6`,
        opacity: 0.75,
        weight: 3
    }]
}, {
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false
    }
}).on('loaded', function (e) {
    //   map.fitBounds(e.target.getBounds());
}).addTo(themaLayer.kampThayaMarch);


var gpx = './data/5_Unten-amp-Oben.gpx';
new L.GPX(gpx, { async: true }).on('loaded', function (e) {
    //   map.fitBounds(e.target.getBounds());
}).addTo(themaLayer.piestingtal);

var gpx = './data/niederoesterreich/thayarunde.gpx';
new L.GPX(gpx, { async: true }).on('loaded', function (e) {
    //   map.fitBounds(e.target.getBounds());
}).addTo(themaLayer.thayarunde);

var gpx = './data/niederoesterreich/traisentalweg.gpx';
new L.GPX(gpx, { async: true }).on('loaded', function (e) {
    //   map.fitBounds(e.target.getBounds());
}).addTo(themaLayer.traisental);

var gpx = './data/niederoesterreich/triesting_goelsental.gpx';
new L.GPX(gpx, { async: true }).on('loaded', function (e) {
    //   map.fitBounds(e.target.getBounds());
}).addTo(themaLayer.triestingGoelsental);

var gpx = './data/niederoesterreich/triestingau.gpx';
new L.GPX(gpx, { async: true }).on('loaded', function (e) {
    //   map.fitBounds(e.target.getBounds());
}).addTo(themaLayer.triestingau);

//Eurovelos erscheinen noch nicht

// Marker der größten Städte
const STAEDTE = [
    {
        title: "St. Pölten, Niederösterreich",
        lat: 48.18735,
        lng: 15.64139,
        wikipedia: "https://de.wikipedia.org/wiki/St._P%C3%B6lten"//Links raus oder anpassen?
    },
    {
        title: "Tulln",
        lat: 48.33001133291213,
        lng: 16.060959034595086,
        wikipedia: "https://de.wikipedia.org/wiki/Wien" //Links raus oder anpassen?
    },
    {
        title: "Krems a.d. Donau",
        lat: 48.41022698533108,
        lng: 15.60382006192799,
        wikipedia: "https://de.wikipedia.org/wiki/Eisenstadt"//Links raus oder anpassen?
    },
    {
        title: "Baden bei Wien",
        lat: 48.0024595018188,
        lng: 16.230795040395048,
        wikipedia: "https://de.wikipedia.org/wiki/Eisenstadt"//Links raus oder anpassen?
    },
]

for (let stadt of STAEDTE) {
    //Marker für den Stopp
    let marker = L.marker([stadt.lat, stadt.lng])
        .addTo(map)
        .bindPopup(`${stadt.title} <br>
    <a href="${stop.wikipedia}">Wikipedia</a>
    `)
};

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

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
}

// Wettervorhersage auf Kartenklick reagieren (Event via map.on)
map.on("click", function (evt) {
    console.log(evt);
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}`;
    showForecast(url, evt.latlng);
});


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