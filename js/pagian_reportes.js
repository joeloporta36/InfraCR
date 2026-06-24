/* ═══════════════════════════════════════════════
    report.js  –  InfraCR  |  Crear Reporte
   ═══════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
    1. MAPA (Leaflet)
───────────────────────────────────────────── */
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true
}).setView([9.9281, -84.0907], 13); // Costa Rica, San José

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
}).addTo(map);

// Marcador personalizado con el verde del proyecto
const greenIcon = L.divIcon({
    className: '',
    html: `
        <div style="
            position: relative;
            width: 32px;
            height: 32px;
        ">
            <div style="
                width: 28px;
                height: 28px;
                background: #2ecc40;
                border: 3px solid #040d07;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 10px rgba(46,204,64,.60);
            "></div>
            <div style="
                position: absolute;
                top: 7px;
                left: 7px;
                width: 10px;
                height: 10px;
                background: #040d07;
                border-radius: 50%;
                transform: rotate(-45deg);
            "></div>
        </div>
    `,
    iconSize:   [32, 32],
    iconAnchor: [14, 32]
});

let marker = null;

/**
 * Coloca o mueve el marcador en el mapa y actualiza las coordenadas.
 * @param {L.LatLng} latlng
 */
function setMarker(latlng) {
    if (marker) {
        marker.setLatLng(latlng);
    } else {
        marker = L.marker(latlng, { icon: greenIcon, draggable: true }).addTo(map);

        // Actualizar coordenadas al arrastrar
        marker.on('dragend', function (e) {
            updateCoords(e.target.getLatLng());
        });
    }
    updateCoords(latlng);
}

/**
 * Muestra lat/lng en los recuadros de coordenadas y avanza el progreso.
 * @param {L.LatLng} latlng
 */
function updateCoords(latlng) {
    document.getElementById('lat-val').textContent = latlng.lat.toFixed(6);
    document.getElementById('lng-val').textContent = latlng.lng.toFixed(6);
    refreshProgress();
}

// Clic en el mapa → mover marcador
map.on('click', function (e) {
    setMarker(e.latlng);
});

// Geolocalización al cargar la página
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
            map.setView(latlng, 15);
            setMarker(latlng);
        },
        function () {
            // Sin permiso: dejar vista por defecto de San José
        }
    );
}

/* ─────────────────────────────────────────────
    2. GEOCODING (búsqueda de dirección)
───────────────────────────────────────────── */
let searchTimer;

document.getElementById('ubicacion').addEventListener('input', function () {
    clearTimeout(searchTimer);
    const query = this.value.trim();
    if (query.length < 4) return;

    searchTimer = setTimeout(async function () {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Costa Rica')}&limit=1`;
            const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
            const data = await res.json();

            if (data.length > 0) {
                const latlng = L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
                map.setView(latlng, 16);
                setMarker(latlng);
            }
        } catch (_) {
            // Fallo silencioso: el usuario puede colocar el marcador manualmente
        }
    }, 650);
});

/* ─────────────────────────────────────────────
    3. CATEGORÍAS
───────────────────────────────────────────── */
document.querySelectorAll('.cat-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
        document.querySelectorAll('.cat-option').forEach(function (o) {
            o.classList.remove('selected');
        });
        this.classList.add('selected');
        document.getElementById('categoria').value = this.dataset.value;
        refreshProgress();
    });
});

/* ─────────────────────────────────────────────
    4. PRIORIDAD
───────────────────────────────────────────── */
document.querySelectorAll('.priority-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.priority-btn').forEach(function (b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
        document.getElementById('prioridad').value = this.dataset.priority;
    });
});

/* ─────────────────────────────────────────────
    5. UPLOAD DE IMAGEN
───────────────────────────────────────────── */
const uploadZone      = document.getElementById('upload-zone');
const fileInput       = document.getElementById('imagen');
const previewContainer = document.getElementById('preview-container');
const previewImg      = document.getElementById('preview-img');
const removeImgBtn    = document.getElementById('remove-img');

/**
 * Procesa un archivo de imagen: valida, lee y muestra la vista previa.
 * @param {File} file
 */
function handleImageFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('⚠️ Solo se permiten imágenes (JPG, PNG, WEBP)');
        return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
        showToast('⚠️ La imagen supera el límite de 10 MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        previewImg.src         = e.target.result;
        previewContainer.style.display = 'block';
        uploadZone.style.display       = 'none';
        refreshProgress();
    };
    reader.readAsDataURL(file);
}

// Input de archivo
fileInput.addEventListener('change', function () {
    handleImageFile(this.files[0]);
});

// Drag & Drop
uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', function () {
    this.classList.remove('dragover');
});

uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
});

// Botón de eliminar imagen
removeImgBtn.addEventListener('click', function () {
    previewContainer.style.display = 'none';
    uploadZone.style.display       = 'block';
    previewImg.src                 = '';
    fileInput.value                = '';
    refreshProgress();
});

/* ─────────────────────────────────────────────
    6. BARRA DE PROGRESO
───────────────────────────────────────────── */
/**
 * Actualiza los puntos de la barra de progreso según el estado del formulario.
 */
function refreshProgress() {
    const hasLocation = marker !== null;
    const hasCategory = document.getElementById('categoria').value !== '';
    const hasImage    = previewContainer.style.display === 'block';

    setDot('dot-1', hasLocation ? 'done' : 'active');
    setDot('dot-2', hasCategory && hasLocation ? 'done' : hasLocation ? 'active' : '');
    setDot('dot-3', hasImage ? 'done' : hasCategory ? 'active' : '');
}

/**
 * Asigna el estado visual a un punto de progreso.
 * @param {string} id
 * @param {string} state  'done' | 'active' | ''
 */
function setDot(id, state) {
    const el = document.getElementById(id);
    el.className = 'step-dot' + (state ? ' ' + state : '');
}

/* ─────────────────────────────────────────────
    7. TOAST DE NOTIFICACIONES
───────────────────────────────────────────── */
let toastTimer;

/**
 * Muestra un mensaje de notificación temporal.
 * @param {string}  message
 * @param {number}  [duration=3500]  ms antes de ocultarse
 */
function showToast(message, duration) {
    duration = duration || 3500;
    const toast = document.getElementById('toast');

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');

    toastTimer = setTimeout(function () {
        toast.classList.remove('show');
    }, duration);
}

/* ─────────────────────────────────────────────
    8. ENVÍO DEL FORMULARIO
───────────────────────────────────────────── */
document.getElementById('submit-btn').addEventListener('click', function () {
    // Validaciones
    if (!marker) {
        showToast('📍 Por favor marcá la ubicación en el mapa');
        return;
    }

    const categoria = document.getElementById('categoria').value;
    if (!categoria) {
        showToast('📂 Seleccioná una categoría');
        return;
    }

    // Construir payload
    const latlng = marker.getLatLng();
    const payload = {
        ubicacion:   document.getElementById('ubicacion').value.trim(),
        latitud:     latlng.lat,
        longitud:    latlng.lng,
        categoria:   categoria,
        descripcion: document.getElementById('descripcion').value.trim(),
        prioridad:   document.getElementById('prioridad').value,
        // imagen: se envía desde fileInput a Supabase Storage por separado
    };

    console.log('📦 Reporte listo para enviar a Supabase:', payload);

    // ── TODO: conectar con Supabase ──────────────────
    // Ejemplo de inserción en tabla "reportes":
    //
    // const { data, error } = await supabase
    //     .from('reportes')
    //     .insert([payload]);
    //
    // Si hay imagen:
    // const { data: imgData, error: imgError } = await supabase.storage
    //     .from('evidencias')
    //     .upload(reportes/${Date.now()}.jpg, fileInput.files[0]);
    // ─────────────────────────────────────────────────

    showToast('✅ Reporte enviado correctamente', 4000);
});

// Cancelar
document.getElementById('cancel-btn').addEventListener('click', function () {
    window.history.back();
});