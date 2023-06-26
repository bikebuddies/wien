// Zentrum Karte Objekt
let noeMitte = {
    lat: 48.27032985615784,
    lng: 15.764989268344962,
    title: "Max-Schubert-Warte, Niederösterreich"
};

// Karte initialisieren und Fullscreen Control 
let map = L.map("map", {
    fullscreenControl: true
}).setView([
    noeMitte.lat, noeMitte.lng
], 8.5);

// thematische Layer
let themaLayer = {
    kampThayaMarch: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/11709,kamp-thaya-march-radroute/
    piestingtal: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/17716,piestingtal-radweg/
    thayarunde: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/84734,thayarunde-waldviertel/
    traisental: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/17634,traisental-radweg/
    triestingGoelsental: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/11703,triesting-goelsental-radweg/
    triestingau: L.featureGroup(),//https://www.outdooractive.com/r/1366729
    ybbstal: L.featureGroup(),//https://www.outdooractive.com/r/10654578
    forecast: L.featureGroup(),
    //badeseen: L.featureGroup()
};

// Hintergrundlayer 
let layerControl = L.control.layers({
    "BasemapÖsterreich": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "StamenB/W": L.tileLayer.provider("Stamen.TonerLite"),
    "CycleTrails": L.tileLayer.provider("CyclOSM"),
}, {
    "Kamp-Thaya-March-Radweg": themaLayer.kampThayaMarch.addTo(map),
    "Piestingtal-Radweg": themaLayer.piestingtal.addTo(map),
    "Thayarunde": themaLayer.thayarunde.addTo(map),
    "Traisental-Radweg": themaLayer.traisental.addTo(map),
    "Triesting-Gölsental-Radweg": themaLayer.triestingGoelsental.addTo(map),
    "Triestingau-Radweg": themaLayer.triestingau.addTo(map),
    "Ybbstal-Radweg": themaLayer.ybbstal.addTo(map),
    "Wettervorhersage MET Norway": themaLayer.forecast,
    //"Badeseen": themaLayer.badeseen
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

//GPX-Tracks
//Kamp-Thaya-March
var gpx = './data/niederoesterreich/kamp_thaya_march.gpx';
let kamp = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFD700',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.kampThayaMarch);

// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
kamp.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/kamp_thaya_march.gpx")
});


//Piestingtal
var gpx = './data/niederoesterreich/piestingtal.gpx';
let piesting = new L.GPX(gpx, {
    polyline_options: {
        color: '#EEEE00',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.piestingtal);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
piesting.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/piestingtal.gpx")
});

//Thayarunde
var gpx = './data/niederoesterreich/thayarunde.gpx';
let thaya = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFEBCD',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.thayarunde);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
thaya.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/thayarunde.gpx")
});

//Traisentalweg
var gpx = './data/niederoesterreich/traisentalweg.gpx';
let traisen = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFFACD',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.traisental);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
traisen.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/traisentalweg.gpx")
});

//Triesting Gölsental
var gpx = './data/niederoesterreich/triesting_goelsental.gpx';
let triesting = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFB90F',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.triestingGoelsental);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
triesting.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/triesting_goelsental.gpx")
});

//Triestingau
var gpx = './data/niederoesterreich/triestingau.gpx';
let triestingau = new L.GPX(gpx, {
    polyline_options: {
        color: '#B8860B',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.triestingau);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
triestingau.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/triestingau.gpx")
});

//Ybbstalweg
var gpx = './data/niederoesterreich/ybbstalradweg.gpx';
let ybbs = new L.GPX(gpx, {
    polyline_options: {
        color: '#EEDD82',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.ybbstal);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
ybbs.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/ybbstalradweg.gpx")
});

//Funktion implementieren für die GPX-Tracks
/*async function gpxTracks(gpx) {
    let routenFarben = {//Gelbtöne von https://www.farb-tabelle.de/de/farbtabelle.htm#yellow
        "Ybbstalradweg": "#EEDD82", //BlanchedAlmond 
        "Triestingau-Radweg": "#B8860B", //DarkGoldenrod
        "Triesting-Gölsental-Radweg": "#FFB90F", //DarkGoldenrod1
        "Traisentalweg": "#FFFACD", //LemonChiffon
        "Thayarunde Waldviertel": "#FFEBCD", //LightGo.denrod
        "Piestingtal-Radweg": "#EEEE00", //yellow2
        "Kamp-Thaya-March-Radroute": "#FFD700", //gold
    };
    let zuordnungLayer = {
        "Ybbstalradweg": "themaLayer.kampThayaMarch",
        "Piestingtal-Radweg": "themaLayer.piestingtal",
        "Thayarunde": "themaLayer.thayarunde",
        "Traisental-Radweg": "themaLayer.traisental",
        "Triesting-Gölsental-Radweg": "themaLayer.triestingGoelsental",
        "Triestingau-Radweg": "themaLayer.triestingau",
        "Ybbstal-Radweg": "themaLayer.ybbstal"
    };
    new L.GPX(gpx, {
        polyline_options: function (feature) {
            return {
                color: routenFarben[feature.properties.Name],//der Zugriff auf die Farben funktioniert noch nicht!
                opacity: 0.75,
                weight: 3
            };
        },
        marker_options: {
            startIconUrl: false,
            endIconUrl: false,
            shadowUrl: false,
            wptIconUrls: false
        },
    }).on('loaded', function (e) {
        //   map.fitBounds(e.target.getBounds());
    }).addTo(themaLayer);//hier noch den richtigen Themalayern zuordnen!
}

gpxTracks("data/niederoesterreich/kamp_thaya_march.gpx");
gpxTracks("data/niederoesterreich/piestingtal.gpx");
gpxTracks("data/niederoesterreich/thayarunde.gpx");
gpxTracks("data/niederoesterreich/traisentalweg.gpx");
gpxTracks("data/niederoesterreich/triesting_goelsental.gpx");
gpxTracks("data/niederoesterreich/triestinggau.gpx");
gpxTracks("data/niederoesterreich/ybbstalradweg.gpx");
*/

//Farben und Themalayer zuordnen! Popups für die Tracks erstellen bei Klick (wie in start repo)




// Marker der größten Städte
const STAEDTE = [
    {
        title: "St. Pölten, Niederösterreich",
        lat: 48.18735,
        lng: 15.64139,
        wikipedia: "https://de.wikipedia.org/wiki/St._P%C3%B6lten"
    },
    {
        title: "Tulln",
        lat: 48.33001133291213,
        lng: 16.060959034595086,
        wikipedia: "https://de.wikipedia.org/wiki/Tulln_an_der_Donau"
    },
    {
        title: "Krems a.d. Donau",
        lat: 48.41022698533108,
        lng: 15.60382006192799,
        wikipedia: "https://de.wikipedia.org/wiki/Krems_an_der_Donau"
    },
    {
        title: "Baden bei Wien",
        lat: 48.0024595018188,
        lng: 16.230795040395048,
        wikipedia: "https://de.wikipedia.org/wiki/Baden_(Nieder%C3%B6sterreich)"
    },
]

for (let stadt of STAEDTE) {
    L.marker([stadt.lat, stadt.lng])
        .addTo(map)
        .bindPopup(`<b>${stadt.title}</b> <br>
        <a href="${stadt.wikipedia}">Wikipedia</a>
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

//Badegewässer einblenden -> Daten fehlen noch
/*async function showLakes(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    //console.log(response, jsondata);
    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: "#0074D9",
                weight: 1,
                fillOpacity: 0.1,
                opacity: 0.4
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4>Adresse ${prop.ADRESSE}</h4>
            <p><i class="fa-sharp fa-solid fa-clock"></i> ${prop.ZEITRAUM || "dauerhaft"}</p>
            <p><i class="fa-sharp fa-solid fa-circle-info"></i> ${prop.AUSN_TEXT || "keine Ausnahmen"}</p>
            `)
        }
    }).addTo(themaLayer.badeseen);
}
showLakes("");*/
