// Initialisation de la carte
var map = L.map('map').setView([48.8566, 2.3522], 13); // Centré sur Paris

// Ajouter une couche de base OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Liste des radars avec des coordonnées et des types
var radars = [
    { id: 1, lat: 48.857, lng: 2.354, type: 'classic' },
    { id: 2, lat: 48.858, lng: 2.295, type: 'big' },
    { id: 3, lat: 48.855, lng: 2.340, type: 'Unknown' },
    { id: 4, lat: 48.856, lng: 2.310, type: 'light' }
];

// Fonction pour obtenir l'URL de l'image en fonction du type de radar
function getRadarIcon(type) {
    return L.icon({
        iconUrl: `img/${type}.png`,
        iconSize: [32, 32], // Taille de l'icône
        iconAnchor: [16, 32], // Point d'ancrage de l'icône
        popupAnchor: [0, -32] // Position de la fenêtre contextuelle
    });
}

// Variable pour stocker les radars affichés sur l'itinéraire
var displayedRadars = [];

// Fonction pour filtrer les radars sur l'itinéraire
function updateRadarsOnRoute(route) {
    // Supprimer les radars précédemment affichés
    displayedRadars.forEach(marker => map.removeLayer(marker));
    displayedRadars = [];

    // Vérifier chaque radar pour voir s'il se trouve sur l'itinéraire
    radars.forEach(function(radar) {
        // Obtenir la position du radar
        var radarLatLng = L.latLng(radar.lat, radar.lng);

        // Vérifier si le radar est sur l'itinéraire
        var isOnRoute = route.some(function(segment) {
            return L.Polyline._flatLatLngs(segment).some(function(latLng) {
                return latLng.distanceTo(radarLatLng) < 100; // seuil de proximité de 100 mètres
            });
        });

        if (isOnRoute) {
            // Ajouter le radar à la carte si il est sur l'itinéraire
            var marker = L.marker([radar.lat, radar.lng], { icon: getRadarIcon(radar.type) })
                .bindPopup(`Radar ID: ${radar.id}, Type: ${radar.type}`);
            marker.addTo(map);
            displayedRadars.push(marker);
        }
    });
}

var control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    createMarker: function(i, wp, nWps) {
        return L.marker(wp.latLng, {
            draggable: true
        }).bindPopup(i === 0 ? 'Départ' : (i === nWps - 1 ? 'Arrivée' : 'Etape ' + i)).openPopup();
    }
}).addTo(map);

document.getElementById('calculate-route').addEventListener('click', function() {
    var startAddress = document.getElementById('start').value;
    var endAddress = document.getElementById('end').value;

    // Géocodage pour l'adresse de départ
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(startAddress)}`)
        .then(response => response.json())
        .then(data => {
            var startCoords = [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];

            // Géocodage pour l'adresse d'arrivée
            fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(endAddress)}`)
                .then(response => response.json())
                .then(data => {
                    var endCoords = [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]];

                    // Mise à jour de l'itinéraire
                    control.setWaypoints([
                        L.latLng(startCoords[0], startCoords[1]),
                        L.latLng(endCoords[0], endCoords[1])
                    ]);

                    // Obtenir les segments de l'itinéraire et mettre à jour les radars
                    control.getPlan().on('routesfound', function(e) {
                        var route = e.routes[0].coordinates;
                        updateRadarsOnRoute(route);
                    });
                });
        });
});
