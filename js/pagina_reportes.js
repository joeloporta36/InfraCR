// Inicializar mapa
const map = L.map('map').setView([9.7489, -83.7534], 8); // Centro de Costa Rica

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

// Capturar clic en el mapa
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng).addTo(map);
    }
    
    document.getElementById('latitud').value = lat;
    document.getElementById('longitud').value = lng;
    
    // Geocodificación inversa opcional
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('ubicacion').value = data.display_name || `${lat}, ${lng}`;
        })
        .catch(() => {
            document.getElementById('ubicacion').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        });
});

// Preview de imagen
document.getElementById('imagen').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Envío a Supabase
document.getElementById('reporteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const imagen = formData.get('imagen');
    
    // Aquí integras tu cliente de Supabase
    // Ejemplo:
    // const { data, error } = await supabase
    //     .from('reportes')
    //     .insert([{
    //         ubicacion: formData.get('ubicacion'),
    //         latitud: parseFloat(formData.get('latitud')),
    //         longitud: parseFloat(formData.get('longitud')),
    //         categoria: formData.get('categoria'),
    //         descripcion: formData.get('descripcion'),
    //         // imagen: await subirAStorage(imagen)
    //     }]);
    
    console.log('Datos listos para Supabase:', {
        ubicacion: formData.get('ubicacion'),
        latitud: formData.get('latitud'),
        longitud: formData.get('longitud'),
        categoria: formData.get('categoria'),
        descripcion: formData.get('descripcion'),
        imagen: imagen.name
    });
});