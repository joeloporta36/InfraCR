const map = L.map('map', {
    center: [9.748917, -83.753428],
    zoom: 8
});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


navigator.geolocation.getCurrentPosition(

    (position) => {
        const lat= position.coords.latitude;
        const long = position.coords.longitude;

        console.log(long, lat)

map.setView([lat,long], 16)
L.marker([lat, long])
.addTo(map)
.bindPopup("Tu ubicación")
.openPopup();
    }
)
