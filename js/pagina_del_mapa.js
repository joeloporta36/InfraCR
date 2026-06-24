/* =============================================
   map.js — InfraCR · Mapa de Reportes
   ============================================= */

/* ------------------------------------------
   DATOS DE EJEMPLO
   Reemplaza con un fetch a Supabase:

   const { data: REPORTES } = await supabase
     .from('reportes')
     .select('*');
------------------------------------------ */
const REPORTES = [
  { id: 1, tipo: 'Hueco',     lugar: 'Av. Central',       canton: 'San José',   estado: 'Pendiente', fecha: 'Hoy',      lat: 9.9320,  lng: -84.0798, descripcion: 'Hueco grande en la calzada principal, peligroso para vehículos y motocicletas.' },
  { id: 2, tipo: 'Basura',    lugar: 'Mercado Central',    canton: 'Heredia',    estado: 'Revisión',  fecha: 'Hoy',      lat: 9.9984,  lng: -84.1189, descripcion: 'Acumulación de basura en la entrada del mercado, lleva varios días sin recolección.' },
  { id: 3, tipo: 'Semáforo',  lugar: 'Calle 2',            canton: 'Alajuela',   estado: 'Resuelto',  fecha: 'Ayer',     lat: 10.0162, lng: -84.2148, descripcion: 'Semáforo dañado en la intersección con Av. 1, ya fue reparado.' },
  { id: 4, tipo: 'Acera',     lugar: 'Paseo Colón',        canton: 'San José',   estado: 'Pendiente', fecha: 'Hace 2d',  lat: 9.9351,  lng: -84.0902, descripcion: 'Acera rota y levantada por raíces de árbol, riesgo de caída para peatones.' },
  { id: 5, tipo: 'Alumbrado', lugar: 'Zona Rosa',          canton: 'Cartago',    estado: 'Revisión',  fecha: 'Hace 3d',  lat: 9.8641,  lng: -83.9196, descripcion: 'Varios postes de alumbrado apagados en la zona, zona oscura de noche.' },
  { id: 6, tipo: 'Hueco',     lugar: 'Ruta 32 km 18',      canton: 'Limón',      estado: 'Resuelto',  fecha: 'Hace 4d',  lat: 10.0041, lng: -83.5308, descripcion: 'Hueco en carretera principal ya fue atendido por el MOPT.' },
  { id: 7, tipo: 'Basura',    lugar: 'Parque Central',     canton: 'Alajuela',   estado: 'Pendiente', fecha: 'Hace 5d',  lat: 10.0180, lng: -84.2170, descripcion: 'Canecas del parque desbordadas, necesita recolección urgente.' },
  { id: 8, tipo: 'Semáforo',  lugar: 'Rotonda La Bandera', canton: 'San José',   estado: 'Revisión',  fecha: 'Hace 6d',  lat: 9.9279,  lng: -84.0525, descripcion: 'Semáforo peatonal sin sonido, afecta a personas con discapacidad visual.' },
  { id: 9, tipo: 'Acera',     lugar: 'Calle Blancos',      canton: 'Goicoechea', estado: 'Pendiente', fecha: 'Hace 7d',  lat: 9.9530,  lng: -84.0430, descripcion: 'Acera completamente bloqueada por materiales de construcción abandonados.' },
];

/* Ícono por tipo */
const TIPO_ICON = {
  Hueco:     'ti-hole',
  Basura:    'ti-trash',
  Semáforo:  'ti-traffic-lights',
  Acera:     'ti-road',
  Alumbrado: 'ti-bulb',
};

/* Color del pin por estado */
const ESTADO_COLOR = {
  Pendiente: '#EF9F27',
  Revisión:  '#378ADD',
  Resuelto:  '#2ecc40',
};

/* ==========================================
   ESTADO DE LA APP
========================================== */
let filtroEstado = 'todos';
let filtroBusqueda = '';
let marcadores = {};       // { id: L.marker }
let activeCardId = null;

/* ==========================================
   MAPA
========================================== */
const map = L.map('map', {
  center: [9.95, -84.1],
  zoom: 9,
  zoomControl: true,
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);

/* Crea un ícono SVG personalizado por color */
function crearIcono(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="sombra">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
      </filter>
      <path d="M14 0C6.3 0 0 6.3 0 14c0 9.6 14 22 14 22S28 23.6 28 14C28 6.3 21.7 0 14 0z"
        fill="${color}" filter="url(#sombra)"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

/* ==========================================
   RENDERIZAR MARCADORES EN EL MAPA
========================================== */
function renderMarcadores(lista) {
  // Eliminar todos los marcadores actuales
  Object.values(marcadores).forEach(m => map.removeLayer(m));
  marcadores = {};

  lista.forEach(r => {
    const icono = crearIcono(ESTADO_COLOR[r.estado]);
    const marker = L.marker([r.lat, r.lng], { icon: icono }).addTo(map);
    marker.on('click', () => abrirPopup(r));
    marcadores[r.id] = marker;
  });
}

/* ==========================================
   POPUP FLOTANTE
========================================== */
function abrirPopup(r) {
  const claseEstado = r.estado === 'Pendiente' ? 'popup-pendiente' : r.estado === 'Revisión' ? 'popup-revision' : 'popup-resuelto';
  const icono = TIPO_ICON[r.tipo] || 'ti-alert-circle';

  document.getElementById('popup-content').innerHTML = `
    <div class="popup-tipo">
      <i class="ti ${icono}" aria-hidden="true"></i>
      ${r.tipo}
    </div>
    <div class="popup-row"><i class="ti ti-map-pin" aria-hidden="true"></i> ${r.lugar}</div>
    <div class="popup-row"><i class="ti ti-building-community" aria-hidden="true"></i> ${r.canton}</div>
    <div class="popup-row"><i class="ti ti-calendar-event" aria-hidden="true"></i> ${r.fecha}</div>
    <div class="popup-row" style="margin-top:4px"><i class="ti ti-align-left" aria-hidden="true"></i> ${r.descripcion}</div>
    <span class="popup-estado ${claseEstado}">${r.estado}</span>
  `;

  document.getElementById('map-popup').classList.add('open');

  // Resalta la tarjeta en la lista
  activarCard(r.id);
}

document.getElementById('popup-close').addEventListener('click', () => {
  document.getElementById('map-popup').classList.remove('open');
  desactivarCards();
});

/* ==========================================
   LISTA DE REPORTES EN EL PANEL
========================================== */
function filtrarReportes() {
  return REPORTES.filter(r => {
    const coincideEstado  = filtroEstado === 'todos' || r.estado === filtroEstado;
    const coincideBusqueda = filtroBusqueda === '' ||
      r.lugar.toLowerCase().includes(filtroBusqueda) ||
      r.canton.toLowerCase().includes(filtroBusqueda) ||
      r.tipo.toLowerCase().includes(filtroBusqueda);
    return coincideEstado && coincideBusqueda;
  });
}

function renderLista() {
  const lista = filtrarReportes();
  const container = document.getElementById('report-list');
  document.getElementById('report-count').textContent = `${lista.length} reporte${lista.length !== 1 ? 's' : ''}`;

  if (!lista.length) {
    container.innerHTML = `
      <div class="no-results">
        <i class="ti ti-search-off" aria-hidden="true"></i>
        Sin resultados para los filtros actuales
      </div>`;
    renderMarcadores([]);
    return;
  }

  const dotClase = (e) => e === 'Pendiente' ? 'dot-pendiente' : e === 'Revisión' ? 'dot-revision' : 'dot-resuelto';

  container.innerHTML = lista.map(r => `
    <div class="report-card ${activeCardId === r.id ? 'active' : ''}"
         id="card-${r.id}"
         onclick="irAReporte(${r.id})">
      <div class="card-top">
        <span class="card-tipo">
          <i class="ti ${TIPO_ICON[r.tipo] || 'ti-alert-circle'}" aria-hidden="true"></i>
          ${r.tipo}
        </span>
        <span class="estado-dot ${dotClase(r.estado)}" title="${r.estado}"></span>
      </div>
      <div class="card-lugar">
        <i class="ti ti-map-pin" aria-hidden="true"></i>
        ${r.lugar}
      </div>
      <div class="card-bottom">
        <span class="card-canton">${r.canton}</span>
        <span class="card-fecha">${r.fecha}</span>
      </div>
    </div>
  `).join('');

  renderMarcadores(lista);
}

/* ==========================================
   INTERACCIÓN: ir a reporte desde la lista
========================================== */
function irAReporte(id) {
  const r = REPORTES.find(x => x.id === id);
  if (!r) return;

  map.flyTo([r.lat, r.lng], 14, { duration: 1.2 });
  abrirPopup(r);
}

function activarCard(id) {
  desactivarCards();
  activeCardId = id;
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function desactivarCards() {
  activeCardId = null;
  document.querySelectorAll('.report-card').forEach(c => c.classList.remove('active'));
}

/* ==========================================
   FILTROS DE ESTADO
========================================== */
document.getElementById('status-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.status-btn');
  if (!btn) return;

  document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtroEstado = btn.dataset.estado;

  document.getElementById('map-popup').classList.remove('open');
  desactivarCards();
  renderLista();
});

/* ==========================================
   BÚSQUEDA
========================================== */
document.getElementById('search-input').addEventListener('input', (e) => {
  filtroBusqueda = e.target.value.trim().toLowerCase();
  document.getElementById('map-popup').classList.remove('open');
  desactivarCards();
  renderLista();
});

/* ==========================================
   INIT
========================================== */
renderLista();