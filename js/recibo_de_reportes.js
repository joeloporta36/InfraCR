/* =============================================
   dashboard.js — InfraCR · Panel de Reportes
   ============================================= */

/* ------------------------------------------
   DATOS DE EJEMPLO
   Reemplaza este array con tu fetch a Supabase
------------------------------------------ */
const DATA = [
  { tipo: 'Hueco',      lugar: 'Av. Central',      fecha: 'Hoy',      estado: 'Pendiente', canton: 'San José'  },
  { tipo: 'Basura',     lugar: 'Mercado Central',   fecha: 'Hoy',      estado: 'Revisión',  canton: 'Heredia'   },
  { tipo: 'Semáforo',   lugar: 'Calle 2',           fecha: 'Ayer',     estado: 'Resuelto',  canton: 'Alajuela'  },
  { tipo: 'Acera',      lugar: 'Paseo Colón',       fecha: 'Hace 2d',  estado: 'Pendiente', canton: 'San José'  },
  { tipo: 'Alumbrado',  lugar: 'Zona Rosa',         fecha: 'Hace 3d',  estado: 'Revisión',  canton: 'Cartago'   },
  { tipo: 'Hueco',      lugar: 'Ruta 32',           fecha: 'Hace 4d',  estado: 'Resuelto',  canton: 'Limón'     },
  { tipo: 'Basura',     lugar: 'Parque Central',    fecha: 'Hace 5d',  estado: 'Pendiente', canton: 'Alajuela'  },
];

/* Ícono Tabler por tipo */
const TIPO_ICON = {
  Hueco:     'ti-hole',
  Basura:    'ti-trash',
  Semáforo:  'ti-traffic-lights',
  Acera:     'ti-road',
  Alumbrado: 'ti-bulb',
};

/* Estado activo de los filtros */
let filters = { tipo: 'todos', estado: 'todos', canton: 'todos' };

/* Índice del reporte abierto en modal */
let editingIndex = null;

/* ==========================================
   INICIALIZAR
========================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  buildDropdowns();
  renderTable();

  // Cierra dropdowns al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-dropdown-wrap')) closeAllDropdowns();
  });
});

/* ==========================================
   ESTADÍSTICAS
========================================== */
function renderStats() {
  const total      = DATA.length;
  const pendientes = DATA.filter(r => r.estado === 'Pendiente').length;
  const revision   = DATA.filter(r => r.estado === 'Revisión').length;
  const resueltos  = DATA.filter(r => r.estado === 'Resuelto').length;

  const pct = (n) => total ? Math.round((n / total) * 100) + '%' : '0%';

  const stats = [
    { label: 'Total reportes', value: total,      pct: '',          highlight: true  },
    { label: 'Pendientes',     value: pendientes, pct: pct(pendientes), highlight: false },
    { label: 'En revisión',    value: revision,   pct: pct(revision),   highlight: false },
    { label: 'Resueltos',      value: resueltos,  pct: pct(resueltos),  highlight: false },
  ];

  document.getElementById('stats-grid').innerHTML = stats.map(s => `
    <div class="stat-card ${s.highlight ? 'highlight' : ''}">
      <span class="stat-label">${s.label}</span>
      <span class="stat-value">${s.value}${s.pct ? `<span class="stat-pct">${s.pct}</span>` : ''}</span>
    </div>
  `).join('');
}

/* ==========================================
   DROPDOWNS DE FILTROS
========================================== */
function buildDropdowns() {
  const unique = (key) => ['todos', ...new Set(DATA.map(r => r[key]))];

  buildDrop('tipo',   unique('tipo'),   { todos: 'Todos los tipos' });
  buildDrop('estado', unique('estado'), { todos: 'Todos los estados' });
  buildDrop('canton', unique('canton'), { todos: 'Todos los cantones' });
}

function buildDrop(key, values, labels = {}) {
  const menu = document.getElementById(`drop-${key}`);
  menu.innerHTML = values.map(v => `
    <div class="drop-option ${filters[key] === v ? 'selected' : ''}"
         onclick="setFilter('${key}', '${v}')">
      ${labels[v] || v}
    </div>
  `).join('');
}

function toggleDropdown(key) {
  const menu = document.getElementById(`drop-${key}`);
  const isOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) menu.classList.add('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
}

/* ==========================================
   FILTRADO
========================================== */
function setFilter(key, value) {
  filters[key] = value;

  // Actualiza label del botón
  const labelMap = { todos: 'Todos' };
  document.getElementById(`label-${key}`).textContent = labelMap[value] || value;

  // Activa visualmente el btn
  document.getElementById(`btn-${key}`).classList.toggle('active', value !== 'todos');

  closeAllDropdowns();
  buildDropdowns(); // refresca checkmarks
  renderTable();
  renderActivePills();
}

function filteredData() {
  return DATA.filter(r =>
    (filters.tipo   === 'todos' || r.tipo   === filters.tipo)   &&
    (filters.estado === 'todos' || r.estado === filters.estado) &&
    (filters.canton === 'todos' || r.canton === filters.canton)
  );
}

/* ==========================================
   PÍLDORAS DE FILTROS ACTIVOS
========================================== */
function renderActivePills() {
  const active = Object.entries(filters).filter(([, v]) => v !== 'todos');
  const c = document.getElementById('active-pills');

  c.innerHTML = active.map(([k, v]) => `
    <span class="active-pill">
      ${v}
      <button onclick="clearFilter('${k}')" aria-label="Quitar filtro ${v}">
        <i class="ti ti-x" aria-hidden="true" style="font-size:12px"></i>
      </button>
    </span>
  `).join('');
}

function clearFilter(key) {
  setFilter(key, 'todos');
}

/* ==========================================
   TABLA
========================================== */
function estadoClass(e) {
  return e === 'Pendiente' ? 'e-pendiente' : e === 'Revisión' ? 'e-revision' : 'e-resuelto';
}

function renderTable() {
  const rows = filteredData();
  const tb = document.getElementById('tbody');

  if (!rows.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="6" class="no-results">
          <i class="ti ti-search-off" aria-hidden="true"></i>
          Sin resultados para los filtros seleccionados
        </td>
      </tr>`;
    return;
  }

  // Guardamos los índices originales para edición
  tb.innerHTML = rows.map((r, i) => {
    const origIndex = DATA.indexOf(r);
    return `
    <tr>
      <td>
        <span class="tipo-badge">
          <i class="ti ${TIPO_ICON[r.tipo] || 'ti-alert-circle'}" aria-hidden="true"></i>
          ${r.tipo}
        </span>
      </td>
      <td class="lugar">${r.lugar}</td>
      <td class="fecha">
        <i class="ti ti-calendar-event" aria-hidden="true" style="font-size:12px;margin-right:4px"></i>
        ${r.fecha}
      </td>
      <td><span class="estado-badge ${estadoClass(r.estado)}">${r.estado}</span></td>
      <td>${r.canton}</td>
      <td>
        <button class="btn-edit" onclick="openModal(${origIndex})">
          <i class="ti ti-edit" aria-hidden="true"></i> Editar
        </button>
      </td>
    </tr>`;
  }).join('');
}

/* ==========================================
   MODAL DE EDICIÓN
========================================== */
const TIPOS   = ['Hueco', 'Basura', 'Semáforo', 'Acera', 'Alumbrado'];
const ESTADOS = ['Pendiente', 'Revisión', 'Resuelto'];

function openModal(index) {
  editingIndex = index;
  const r = DATA[index];

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-field">
      <label for="edit-tipo">Tipo</label>
      <select id="edit-tipo">
        ${TIPOS.map(t => `<option ${t === r.tipo ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="modal-field">
      <label for="edit-lugar">Lugar</label>
      <input id="edit-lugar" type="text" value="${r.lugar}">
    </div>
    <div class="modal-field">
      <label for="edit-estado">Estado</label>
      <select id="edit-estado">
        ${ESTADOS.map(s => `<option ${s === r.estado ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="modal-field">
      <label for="edit-canton">Cantón</label>
      <input id="edit-canton" type="text" value="${r.canton}">
    </div>
  `;

  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  // Solo cierra si se hizo clic en el overlay (no en el box)
  if (e.target === document.getElementById('modal')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modal').classList.remove('open');
  editingIndex = null;
}

function saveEdit() {
  if (editingIndex === null) return;

  DATA[editingIndex].tipo   = document.getElementById('edit-tipo').value;
  DATA[editingIndex].lugar  = document.getElementById('edit-lugar').value.trim();
  DATA[editingIndex].estado = document.getElementById('edit-estado').value;
  DATA[editingIndex].canton = document.getElementById('edit-canton').value.trim();

  closeModalDirect();
  renderStats();
  renderTable();

  // --- EJEMPLO Supabase (descomentar cuando estés listo) ---
  // const { error } = await supabase
  //   .from('reportes')
  //   .update({ tipo, lugar, estado, canton })
  //   .eq('id', DATA[editingIndex].id);

  showToast('Reporte actualizado correctamente');
}

/* ==========================================
   TOAST
========================================== */
let toastTimer = null;

function showToast(msg = 'Acción completada') {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}