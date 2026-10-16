/* =============================================================================
 * WebGIS Phương án sử dụng đất do Công ty Lâm nghiệp Thái Nguyên trả ra — xã Đại Phúc
 * Cơ quan tổ chức lập: Phòng Xây dựng, Nông nghiệp và Môi trường xã Đại Phúc
 * Đơn vị xây dựng: Công ty CP Công nghệ Tài nguyên - Môi trường Hà Nội
 * Dữ liệu:
 *   data/diachinh.geojson   — 472 thửa trên BĐĐC chính quy
 *   data/thua_bosung.geojson — 8 thửa không có trên BĐĐC (ranh bản đồ lâm nghiệp), chồng lấn BĐĐC
 * Ý kiến công khai lưu localStorage
 * ============================================================================= */

const STORAGE_KEY = 'daiphuc_pasdd_ykien_v2';
const PROJECT_NAME = 'Phương án sử dụng đất do Công ty Lâm nghiệp Thái Nguyên trả ra — xã Đại Phúc';
const ORG_NAME = 'UBND xã Đại Phúc — Phòng Xây dựng, Nông nghiệp và Môi trường';

/* Hiệu chỉnh tọa độ (độ) nếu đối chiếu điểm khống chế thấy lệch nền ảnh. Mặc định 0. */
const OFFSET = { dLat: 0, dLon: 0 };
const VN2000_TN = '+proj=tmerc +lat_0=0 +lon_0=106.5 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 ' +
  '+towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs';

const NHOM = {
  1: { short: 'Nhóm 1 – Giao Ban QLR&BTTN tỉnh', fill: '#66BB6A', stroke: '#1B5E20',
       full: 'Giao Ban QLR&BTTN tỉnh quản lý rừng phòng hộ, gắn giao rừng; Ban tiếp tục khoán BVR cho hộ; không công nhận QSDĐ cho hộ', cc: 'Điểm đ khoản 2 Điều 181 LĐĐ 2024; Luật Lâm nghiệp 2017' },
  2: { short: 'Nhóm 2 – Giao đất, giao rừng SX cho hộ', fill: '#D4E157', stroke: '#827717',
       full: 'Giao đất, giao rừng sản xuất cho hộ đang sử dụng; trong hạn mức không thu tiền, vượt hạn mức cho thuê', cc: 'Khoản 2 Điều 181; Điều 176 LĐĐ 2024' },
  3: { short: 'Nhóm 3 – Công nhận QSDĐ cho hộ', fill: '#FFB74D', stroke: '#E65100',
       full: 'Công nhận QSDĐ, cấp GCN theo hiện trạng; đất ở nộp tiền sử dụng đất theo NĐ 103/2024', cc: 'Khoản 2 Điều 181; Điều 138, 139, 141 LĐĐ 2024' },
  4: { short: 'Nhóm 4 – Giao, cho thuê tổ chức', fill: '#BA68C8', stroke: '#6A1B9A',
       full: 'Giao/cho thuê phần cơ sở theo hiện trạng cho tổ chức đang sử dụng (Trung tâm Cai nghiện ĐCN tỉnh)', cc: 'Điểm đ khoản 2 Điều 181 LĐĐ 2024' },
  5: { short: 'Nhóm 5 – Giao UBND xã quản lý', fill: '#64B5F6', stroke: '#0D47A1',
       full: 'Giao UBND xã quản lý: không có người SD, chưa rõ người SD, Ban đứng tên RSX ngoài ranh RPH, tranh chấp, vi phạm chưa xử lý xong', cc: 'Điểm e khoản 2 Điều 181 LĐĐ 2024' },
};
const NHOM_NONE = { short: 'Chưa xếp nhóm', fill: '#E0E0E0', stroke: '#616161' };
const LOAI = {
  RPH: { label: 'Đất rừng phòng hộ', fill: '#66BB6A', stroke: '#1B5E20' },
  RSX: { label: 'Đất rừng sản xuất', fill: '#D4E157', stroke: '#827717' },
  CLN: { label: 'Đất trồng cây lâu năm', fill: '#FFB74D', stroke: '#E65100' },
  ONT: { label: 'Đất ở tại nông thôn', fill: '#F48FB1', stroke: '#AD1457' },
  HNK: { label: 'Đất trồng cây hằng năm khác', fill: '#FFF176', stroke: '#F9A825' },
  NTS: { label: 'Đất nuôi trồng thủy sản', fill: '#81D4FA', stroke: '#0277BD' },
  DXH: { label: 'Đất xây dựng cơ sở xã hội', fill: '#CE93D8', stroke: '#6A1B9A' },
  TSC: { label: 'Đất xây dựng trụ sở cơ quan', fill: '#B39DDB', stroke: '#4527A0' },
  BCS: { label: 'Đất bằng chưa sử dụng', fill: '#BDBDBD', stroke: '#424242' },
};
const LOAI_OTHER = { label: 'Loại khác', fill: '#E0E0E0', stroke: '#616161' };
const LD_NAMES = {
  RPH: 'Đất rừng phòng hộ', RPT: 'Đất có rừng trồng phòng hộ', RSX: 'Đất rừng sản xuất', RST: 'Đất có rừng trồng sản xuất',
  CLN: 'Đất trồng cây lâu năm', LNC: 'Đất trồng cây lâu năm khác', LUK: 'Đất trồng lúa còn lại', LUC: 'Đất chuyên trồng lúa',
  HNK: 'Đất trồng cây hằng năm khác', BHK: 'Đất bằng trồng cây hằng năm khác', NTS: 'Đất nuôi trồng thủy sản',
  ONT: 'Đất ở tại nông thôn', 'ONT+CLN': 'Đất ở + cây lâu năm', 'ONT+LNK': 'Đất ở + cây lâu năm khác',
  TSC: 'Đất xây dựng trụ sở cơ quan', DXH: 'Đất xây dựng cơ sở xã hội', BCS: 'Đất bằng chưa sử dụng', DCS: 'Đất đồi núi chưa sử dụng',
  MNC: 'Đất có mặt nước chuyên dùng', DGT: 'Đất giao thông', DTL: 'Đất thủy lợi', SON: 'Đất sông, suối',
};
const CHU = {
  'Hộ gia đình, cá nhân': { fill: '#FFCC80', stroke: '#E65100' },
  'Ban QLR&BTTN tỉnh': { fill: '#80CBC4', stroke: '#00695C' },
  'Trung tâm Cai nghiện ĐCN tỉnh': { fill: '#CE93D8', stroke: '#6A1B9A' },
  'Chưa xác định người SD': { fill: '#E0E0E0', stroke: '#616161' },
};
const XA_ORDER = ['Phúc Tân', 'Phúc Trìu'];
const VIEWS = ['view-map', 'view-table', 'view-dashboard', 'view-report', 'view-help'];
const LN_STROKE = '#FF1744';

/* ============================================================================
 * STATE
 * ============================================================================ */
const state = {
  features: [], byId: {}, edits: {},
  map: null, layers: { dc: null, ln: null }, layerById: {}, selectedId: null,
  colorMode: 'nhom',
  filters: { nhom: new Set(['1', '2', '3', '4', '5', '0']), xa: new Set(XA_ORDER), chu: new Set(Object.keys(CHU)),
             showDc: true, showLn: true, onlyB12: false, onlyQhc: false, onlyYk: false, search: '' },
  table: { sortKey: 'tt', sortDir: 'asc', page: 1, pageSize: 50, searchText: '', filterXa: '', filterNhom: '', filterLop: '' },
};

const fmt = (n, d = 1) => (+n || 0).toLocaleString('vi-VN', { maximumFractionDigits: d });
const ha = (m2, d = 2) => ((+m2 || 0) / 10000).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nhomOf = p => NHOM[p.nhom] || NHOM_NONE;
const pct = x => (x * 100).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const isNum = v => typeof v === 'number' && isFinite(v);

function props(f) {
  const p = f.properties, ed = state.edits[p.id];
  return ed ? { ...p, yk: ed } : p;
}

/* ============================================================================
 * INIT
 * ============================================================================ */
async function init() {
  loadEdits();
  await loadData();
  if (!state.features.length) return;
  buildFilters();
  initMap();
  initNav();
  initTableControls();
  initMobileBehavior();
  fillHelp();
  updateCounts();
}

function loadEdits() {
  try { state.edits = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch (e) { state.edits = {}; }
}
function saveEdits() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.edits)); }

async function fetchJson(name) {
  for (const u of ['data/' + name, name]) {
    try { const r = await fetch(u); if (r.ok) return await r.json(); } catch (e) { /* thử tiếp */ }
  }
  return null;
}

async function loadData() {
  const loadingEl = document.getElementById('map-loading');
  const [dc, ln] = await Promise.all([fetchJson('diachinh.geojson'), fetchJson('thua_bosung.geojson')]);
  if (!dc) {
    loadingEl.innerHTML = '<div style="color:var(--danger);text-align:center">⚠️ Không tải được data/diachinh.geojson<br><small style="color:var(--text-secondary);font-weight:normal">Kiểm tra thư mục data đã upload đủ 2 file chưa</small></div>';
    return;
  }
  const all = [...dc.features, ...(ln ? ln.features : [])];
  if (OFFSET.dLat || OFFSET.dLon) {
    const shift = c => typeof c[0] === 'number' ? [c[0] + OFFSET.dLon, c[1] + OFFSET.dLat] : c.map(shift);
    all.forEach(f => f.geometry.coordinates = shift(f.geometry.coordinates));
  }
  state.features = all.sort((a, b) => a.properties.tt - b.properties.tt);
  state.features.forEach(f => state.byId[f.properties.id] = f);
  document.getElementById('total-count').textContent = fmt(state.features.length, 0);
}

/* ============================================================================
 * FILTER UI
 * ============================================================================ */
function filterRow(key, value, label, fill, stroke) {
  return `<label class="filter-row">
    <input type="checkbox" data-filter="${key}" value="${esc(value)}" checked>
    <span class="swatch" style="background:${fill};border:0.5px solid ${stroke}"></span>
    <span>${label}</span>
    <span class="count" data-count="${key}-${esc(value)}">—</span>
  </label>`;
}

function buildFilters() {
  const hasNone = state.features.some(f => !NHOM[f.properties.nhom]);
  document.getElementById('filter-nhom').innerHTML =
    Object.entries(NHOM).map(([k, v]) => filterRow('nhom', k, v.short, v.fill, v.stroke)).join('') +
    (hasNone ? filterRow('nhom', '0', NHOM_NONE.short, NHOM_NONE.fill, NHOM_NONE.stroke) : '');
  document.getElementById('filter-xa').innerHTML = XA_ORDER.map(x => filterRow('xa', x, `Xã ${x} (cũ)`, '#fff', '#999')).join('');
  document.getElementById('filter-chu').innerHTML = Object.entries(CHU).map(([k, v]) => filterRow('chu', k, k, v.fill, v.stroke)).join('');

  document.querySelectorAll('[data-filter]').forEach(cb => cb.addEventListener('change', e => {
    const { filter } = e.target.dataset;
    e.target.checked ? state.filters[filter].add(e.target.value) : state.filters[filter].delete(e.target.value);
    applyFilter();
  }));
  [['layer-dc', 'showDc'], ['layer-ln', 'showLn'], ['only-b12', 'onlyB12'], ['only-qhc', 'onlyQhc'], ['only-yk', 'onlyYk']].forEach(([id, k]) =>
    document.getElementById(id).addEventListener('change', e => { state.filters[k] = e.target.checked; applyFilter(); }));

  const si = document.getElementById('search-input');
  si.addEventListener('input', e => { state.filters.search = e.target.value.trim(); applyFilter(); });
  si.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const hit = state.features.find(passesFilter);
    if (hit) selectThua(hit.properties.id);
  });

  document.querySelectorAll('.color-mode button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.color-mode button').forEach(x => x.classList.toggle('active', x === b));
    state.colorMode = b.dataset.mode;
    restyleAll();
    renderLegend();
  }));

  document.getElementById('table-xa').innerHTML += XA_ORDER.map(x => `<option value="${x}">Xã ${x} (cũ)</option>`).join('');
  document.getElementById('table-nhom').innerHTML += Object.entries(NHOM).map(([k, v]) => `<option value="${k}">${v.short}</option>`).join('');
}

function matchSearch(p, s) {
  if (!s) return true;
  const m = s.match(/^(\d+)\s*[\/\-\s]\s*(\d+)$/);
  if (m) return (p.tbd === +m[1] && p.thua === +m[2]) || (p.to_qd === +m[1] && p.thua_qd === +m[2]);
  const hay = `${p.ten || ''} ${p.ten_bd || ''} ${p.thon || ''} ${p.ma} ${p.loai} ${p.tbd}/${p.thua}`.toLowerCase();
  return hay.includes(s.toLowerCase());
}

function passesFilter(f) {
  const p = f.properties, fl = state.filters;
  if (p.lop === 'ln' ? !fl.showLn : !fl.showDc) return false;
  if (!fl.nhom.has(String(NHOM[p.nhom] ? p.nhom : 0))) return false;
  if (!fl.xa.has(p.xa_cu)) return false;
  if (CHU[p.chu_the] && !fl.chu.has(p.chu_the)) return false;
  if (fl.onlyB12 && !p.b12) return false;
  if (fl.onlyQhc && !(p.dt_qhc > 0)) return false;
  if (fl.onlyYk && !state.edits[p.id]) return false;
  return matchSearch(p, fl.search);
}

function updateCounts() {
  const c = {};
  let b12 = 0, qhc = 0, dc = 0, ln = 0;
  state.features.forEach(f => {
    const p = f.properties;
    [['nhom', NHOM[p.nhom] ? p.nhom : 0], ['xa', p.xa_cu], ['chu', p.chu_the]].forEach(([k, v]) => c[`${k}-${v}`] = (c[`${k}-${v}`] || 0) + 1);
    if (p.b12) b12++;
    if (p.dt_qhc > 0) qhc++;
    p.lop === 'ln' ? ln++ : dc++;
  });
  document.querySelectorAll('[data-count]').forEach(el => el.textContent = fmt(c[el.dataset.count] || 0, 0));
  document.getElementById('count-b12').textContent = b12;
  document.getElementById('count-qhc').textContent = qhc;
  document.getElementById('count-dc').textContent = dc;
  document.getElementById('count-ln').textContent = ln;
  document.getElementById('count-yk').textContent = Object.keys(state.edits).filter(id => state.byId[id]).length;
}

/* ============================================================================
 * MAP
 * ============================================================================ */
function initMap() {
  if (typeof L === 'undefined') {
    document.getElementById('map-loading').innerHTML = '⚠️ Không tải được Leaflet. Kiểm tra Internet.';
    return;
  }
  state.map = L.map('map', { zoomControl: true, preferCanvas: true, fadeAnimation: false }).setView([21.55, 105.74], 13);

  const google = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { subdomains: '0123', maxZoom: 21, attribution: '© Google' });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 21, maxNativeZoom: 19, attribution: '© Esri' });
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 21, maxNativeZoom: 19, attribution: '© OpenStreetMap' });
  google.addTo(state.map);
  L.control.layers({ 'Ảnh vệ tinh + nhãn (Google)': google, 'Ảnh vệ tinh (Esri)': satellite, 'OpenStreetMap': osm }, {}, { position: 'topleft' }).addTo(state.map);
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(state.map);

  // Lớp 8 thửa nằm trên pane riêng, cao hơn lớp BĐĐC → luôn nổi bên trên, click được
  state.map.createPane('lnPane');
  state.map.getPane('lnPane').style.zIndex = 450;
  const lnRenderer = L.canvas({ pane: 'lnPane', tolerance: 3 });

  const onEach = (f, layer) => {
    state.layerById[f.properties.id] = layer;
    layer.on('click', e => { L.DomEvent.stopPropagation(e); selectThua(f.properties.id); });
    const p = f.properties;
    layer.bindTooltip(`${p.lop === 'ln' ? '⚠ ' : ''}${p.loai} - ${p.tbd}/${p.thua}`, {
      permanent: true, direction: 'center', className: 'thua-label' + (p.lop === 'ln' ? ' thua-label-ln' : ''), interactive: false,
    });
  };
  const dcFeats = state.features.filter(f => f.properties.lop !== 'ln');
  const lnFeats = state.features.filter(f => f.properties.lop === 'ln');
  state.layers.dc = L.geoJSON(dcFeats, { style: styleFor, onEachFeature: onEach }).addTo(state.map);
  state.layers.ln = L.geoJSON(lnFeats, { style: styleFor, onEachFeature: onEach, pane: 'lnPane', renderer: lnRenderer }).addTo(state.map);

  state.map.fitBounds(state.layers.dc.getBounds(), { padding: [20, 20] });
  const updLabels = () => state.map.getContainer().classList.toggle('show-labels', state.map.getZoom() >= 17);
  state.map.on('zoomend', updLabels); updLabels();

  const box = document.getElementById('coord-box');
  const hasProj = typeof proj4 !== 'undefined';
  state.map.on('mousemove', e => {
    const { lat, lng } = e.latlng;
    let s = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (hasProj) {
      const [x, y] = proj4('EPSG:4326', VN2000_TN, [lng - OFFSET.dLon, lat - OFFSET.dLat]);
      s += ` • VN-2000: X=${y.toFixed(2)} Y=${x.toFixed(2)}`;
    }
    box.textContent = s;
  });

  document.getElementById('map-loading').classList.add('hidden');
  renderLegend();
  applyFilter();
}

function colorOf(p) {
  if (state.colorMode === 'loai') return LOAI[p.loai] || LOAI_OTHER;
  if (state.colorMode === 'chu') return CHU[p.chu_the] || LOAI_OTHER;
  return nhomOf(p);
}

function styleFor(f) {
  const p = f.properties, c = colorOf(p), sel = p.id === state.selectedId;
  if (p.lop === 'ln') {
    return { fillColor: c.fill, fillOpacity: 0.35, color: sel ? '#FFEB3B' : LN_STROKE, weight: sel ? 5 : 4, opacity: 1, dashArray: null };
  }
  return {
    fillColor: c.fill, fillOpacity: 0.55,
    color: sel ? '#FFEB3B' : (p.b12 ? '#FF6D00' : c.stroke),
    weight: sel ? 3 : (p.b12 ? 1.8 : 0.8),
    dashArray: p.b12 && !sel ? '5,4' : null, opacity: 1,
  };
}

function restyleAll() {
  Object.values(state.layerById).forEach(l => l.setStyle(styleFor(l.feature)));
}

function groupOf(f) { return f.properties.lop === 'ln' ? state.layers.ln : state.layers.dc; }

function applyFilter() {
  let n = 0, a = 0;
  state.features.forEach(f => {
    const l = state.layerById[f.properties.id], g = groupOf(f);
    if (passesFilter(f)) {
      n++; a += f.properties.dt;
      if (l && !g.hasLayer(l)) { g.addLayer(l); l.setStyle(styleFor(f)); }
    } else if (l && g.hasLayer(l)) g.removeLayer(l);
  });
  document.getElementById('visible-count').textContent = fmt(n, 0);
  document.getElementById('visible-ha').textContent = ha(a);
}

function renderLegend() {
  const el = document.getElementById('map-legend');
  let title, items;
  if (state.colorMode === 'loai') { title = 'Loại đất hiện trạng'; items = Object.entries(LOAI).map(([k, v]) => [`${k} – ${v.label}`, v]); }
  else if (state.colorMode === 'chu') { title = 'Chủ thể đang quản lý, sử dụng'; items = Object.entries(CHU).map(([k, v]) => [k, v]); }
  else { title = 'Nhóm phương án'; items = Object.values(NHOM).map(v => [v.short, v]); }
  el.innerHTML = `<div style="font-weight:500;margin-bottom:4px">${title}</div>` +
    items.map(([lb, c]) => `<div class="legend-row"><span class="swatch" style="background:${c.fill};border:0.5px solid ${c.stroke}"></span>${lb}</div>`).join('') +
    `<div class="legend-row" style="margin-top:4px"><span class="swatch" style="background:rgba(255,23,68,.15);border:2.5px solid ${LN_STROKE}"></span><strong>Thửa không có trên BĐĐC</strong></div>` +
    `<div class="legend-row"><span class="swatch" style="background:transparent;border:1.5px dashed #FF6D00"></span>Sai khác lớn QĐ – BĐĐC</div>`;
}

function selectThua(id) {
  const f = state.byId[id];
  if (!f) return;
  const prev = state.selectedId;
  state.selectedId = id;
  if (prev && state.layerById[prev]) state.layerById[prev].setStyle(styleFor(state.byId[prev]));
  const layer = state.layerById[id];
  if (layer) {
    layer.setStyle(styleFor(f));
    if (groupOf(f).hasLayer(layer)) layer.bringToFront();
    state.map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 18 });
  }
  renderThuaDetail(f);
  if (isMobile()) openMobileRightbar();
}

/* ============================================================================
 * CHI TIẾT THỬA
 * ============================================================================ */
function renderThuaDetail(f) {
  const p = f.properties, ed = state.edits[p.id] || {}, nh = nhomOf(p);
  const v = x => (x === undefined || x === null || x === '') ? '<span style="color:var(--text-tertiary)">—</span>' : esc(x);
  const m2 = x => isNum(x) ? fmt(x) + ' m²' : v(x);
  const row = (label, value, full) => `<div${full ? ' class="full"' : ''}><div class="label">${label}</div><div class="value">${value}</div></div>`;
  const sec = (title, body, open) => `<details class="detail-section"${open ? ' open' : ''}><summary><h4>${title}</h4></summary><div class="detail-grid">${body}</div></details>`;

  let html = `
    <div class="thua-header">
      <div class="thua-id">Tờ ${p.tbd} — Thửa ${p.thua}</div>
      <div class="thua-loc">${esc(p.thon || '')}${p.thon ? ' • ' : ''}Xã ${esc(p.xa_cu)} (cũ), nay xã Đại Phúc</div>
      <span class="badge" style="background:${nh.fill}55;color:${nh.stroke};border:0.5px solid ${nh.stroke}">${esc(nh.short)}</span>
      ${p.lop === 'ln' ? '<span class="badge badge-ln">Không có trên BĐĐC</span>' : ''}
      ${p.b12 ? '<span class="badge badge-warn">Sai khác QĐ – BĐĐC</span>' : ''}
      ${state.edits[p.id] ? '<span class="badge badge-pa">Đã ghi ý kiến</span>' : ''}
    </div>`;

  if (p.lop === 'ln') {
    const ov = (p.chong || []).map(o => `<li>Tờ ${o.to}, thửa ${o.thua} (${esc(o.loai)}${o.ten ? ', ' + esc(o.ten) : ''}): <strong>${fmt(o.dt)} m²</strong></li>`).join('');
    html += `<div class="ln-box">
      <div class="ln-title">⚠️ Thửa không có trên bản đồ địa chính chính quy</div>
      <div>Thửa có trong phụ lục quyết định thu hồi nhưng không có trên BĐĐC. Ranh thửa tạm lấy từ <strong>bản đồ lâm nghiệp</strong> do Công ty Lâm nghiệp Thái Nguyên bàn giao (DT ranh: ${fmt(p.dt_bdln ?? p.dt_hh)} m²${p.ht_bdln ? ', hiện trạng: ' + esc(p.ht_bdln) : ''}).</div>
      ${ov ? `<div style="margin-top:6px">Chồng lấn lên thửa BĐĐC (tổng ${fmt(p.dt_chong)} m²):</div><ul>${ov}</ul>` : ''}
      <div style="margin-top:6px"><strong>Cần lấy ý kiến khi công khai</strong> để xác định ranh giới, người sử dụng; cập nhật sau khi đo đạc xác minh.</div>
    </div>`;
  }
  if (p.bi_chong) {
    html += `<div class="warn-box">⚠️ Thửa này bị thửa không có trên BĐĐC chồng lên: <strong>${p.bi_chong.join(', ')}</strong> (ranh bản đồ lâm nghiệp). Cần đối chiếu khi công khai.</div>`;
  }

  html += sec('Phương án sử dụng đất', `
      ${row('Nhóm phương án', `<strong>${esc(nh.short)}</strong>`, true)}
      ${nh.full ? row('Hình thức xử lý', esc(nh.full), true) : ''}
      ${nh.cc ? row('Căn cứ', esc(nh.cc), true) : ''}
      ${row('Mã loại đất theo PA đến 2030', `${v(p.loai_pa)}${LD_NAMES[p.loai_pa] ? ' — ' + LD_NAMES[p.loai_pa] : ''}`, true)}
      ${row('DT lập phương án', m2(p.dt_qd))}
      ${p.dt_qhc > 0 ? row('DT trong ranh QH chung', m2(+p.dt_qhc.toFixed(1))) : ''}
    `, true);

  html += sec('Theo quyết định thu hồi', `
      ${row('Quyết định', v(p.qd), true)}
      ${row('STT phụ lục', v(p.stt_qd))}
      ${row('Tờ / thửa', `${v(p.to_qd)} / ${v(p.thua_qd)}`)}
      ${row('Diện tích', m2(p.dt_qd))}
      ${row('Loại đất', v(p.loai_qd))}
    `, true);

  html += sec('Theo bản đồ địa chính', p.lop === 'ln' ? row('', '<em>Không có trên BĐĐC</em>', true) : `
      ${row('Năm thành lập BĐĐC', v(p.nam_bd))}
      ${row('Tờ / thửa', `${v(p.tbd)} / ${v(p.thua_bd)}`)}
      ${row('Diện tích', m2(p.dt_bd))}
      ${row('Loại đất', v(p.loai_bd))}
      ${row('Tên chủ sử dụng', v(p.ten), true)}
      ${row('Đối chiếu QĐ – BĐĐC', v(p.danh_gia), true)}
    `, true);

  html += sec('Hiện trạng sử dụng', `
      ${row('Chủ thể', `${v(p.chu_the)} ${p.dt_sd ? `(${esc(p.dt_sd)})` : ''}`, true)}
      ${row('Mã loại đất hiện trạng (TT 08/2024)', `${v(p.loai)}${LD_NAMES[p.loai] ? ' — ' + LD_NAMES[p.loai] : ''}`, true)}
      ${row('Địa chỉ thửa đất', v(p.dia_chi), true)}
      ${row('Thời điểm bắt đầu sử dụng', v(p.tg_sd), true)}
      ${row('Nhà, công trình', v(p.cong_trinh), true)}
      ${row('Giấy tờ', v(p.giay_to), true)}
      ${row('DT sai mục đích, lấn chiếm', m2(p.dt_vp))}
      ${row('Tranh chấp, vi phạm', v(p.tranh_chap), true)}
    `);

  html += sec('Quy hoạch – rừng', `
      ${row('Quy hoạch áp dụng', v(p.qh), true)}
      ${row('Mục đích theo quy hoạch', v(p.md_qh), true)}
      ${row('DT trong ranh RPH', m2(p.dt_rph))}
      ${row('Ranh 3 loại rừng', v(p.ranh_3lr), true)}
      ${row('Hiện trạng rừng/cây trồng', v(p.ht_rung), true)}
      ${row('Loài cây, năm trồng', v(p.cay), true)}
      ${row('Nguồn vốn trồng rừng', v(p.von), true)}
      ${row('HĐ khoán chăm sóc, BVR', v(p.hd_khoan), true)}
      ${row('Tình trạng HĐ khoán', v(p.tt_khoan), true)}
    `);

  if (p.ghi_chu) html += sec('Ghi chú', row('', esc(p.ghi_chu).replace(/; /g, '<br>• ').replace(/^/, '• '), true), true);

  if (Object.keys(ed).length) {
    let b = '';
    if (ed.y_kien) b += row('Ý kiến', esc(ed.y_kien), true);
    if (ed.noi_dung) b += row('Nội dung', esc(ed.noi_dung), true);
    if (ed.de_xuat) b += row('Đề xuất nhóm', esc((NHOM[ed.de_xuat] || {}).short || ed.de_xuat), true);
    if (ed.ranh) b += row('Ranh thửa', esc(ed.ranh), true);
    if (ed.sdt) b += row('SĐT', esc(ed.sdt));
    if (ed.nguoi) b += row('Người ghi', esc(ed.nguoi) + (ed.ngay ? ` (${esc(ed.ngay)})` : ''));
    if (ed.anh && ed.anh.length) {
      b += `<div class="full"><div class="label">Ảnh, giấy tờ (${ed.anh.length})</div><div class="img-preview-grid">` +
        ed.anh.map((x, i) => `<div class="img-item" onclick="viewImage('${p.id}',${i})">${x.type === 'application/pdf' ? `<div class="pdf-icon" title="${esc(x.name)}">📄</div>` : `<img src="${x.data}" alt="${esc(x.name)}">`}</div>`).join('') + `</div></div>`;
    }
    html += sec('Ý kiến khi công khai', b, true);
  }

  html += `<div class="detail-actions">
      <button class="btn btn-primary" onclick="openEditPanel('${p.id}')">💬 Ghi ý kiến</button>
      <button class="btn" onclick="window.print()">🖨️ In phiếu</button>
    </div>`;
  document.getElementById('thua-detail').innerHTML = html;
}

/* ============================================================================
 * NAV
 * ============================================================================ */
function showView(view) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  VIEWS.forEach(id => document.getElementById(id).classList.toggle('hidden', id !== 'view-' + view));
  if (view === 'dashboard') renderDashboard();
  if (view === 'table') renderTable();
  if (view === 'report') renderReport();
  if (view === 'map' && state.map) setTimeout(() => state.map.invalidateSize(), 50);
}
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.view === 'contact') {
      showView('map');
      showContactInRightbar();
      if (isMobile()) openMobileRightbar();
      return;
    }
    showView(btn.dataset.view);
  }));
}
function goToThua(id) { showView('map'); setTimeout(() => { state.map && state.map.invalidateSize(); selectThua(id); }, 120); }
function goToContact() { document.querySelector('.nav-btn[data-view="contact"]').click(); }

function showContactInRightbar() {
  document.getElementById('thua-detail').innerHTML = `
    <div class="contact-card">
      <div class="contact-header">
        <div class="contact-header-text">
          <div class="contact-tag">Đơn vị xây dựng</div>
          <h3 class="contact-name">CÔNG TY CỔ PHẦN CÔNG NGHỆ TÀI NGUYÊN - MÔI TRƯỜNG HÀ NỘI</h3>
        </div>
      </div>
      <div class="contact-info">
        <div class="contact-info-row"><span class="contact-icon">🏛️</span><div><div class="contact-label">Cơ quan tổ chức lập phương án</div><div class="contact-value">Phòng Xây dựng, Nông nghiệp và Môi trường — UBND xã Đại Phúc, tỉnh Thái Nguyên</div></div></div>
        <div class="contact-info-row"><span class="contact-icon">📞</span><div><div class="contact-label">Điện thoại đơn vị xây dựng</div><div class="contact-value"><a href="tel:0352937823"><strong>035.293 7823</strong></a></div></div></div>
      </div>
      <div class="contact-actions">
        <a href="tel:0352937823" class="btn btn-primary contact-btn-call">📞 Gọi 035.293 7823</a>
      </div>
      <p class="contact-note">Mọi ý kiến góp ý về số liệu, ranh giới thửa đất trong phương án xin liên hệ cơ quan tổ chức lập hoặc đơn vị xây dựng theo thông tin trên.</p>
    </div>`;
}

/* ============================================================================
 * TRA CỨU
 * ============================================================================ */
function initTableControls() {
  const t = state.table;
  document.getElementById('table-search').addEventListener('input', e => { t.searchText = e.target.value.trim(); t.page = 1; renderTable(); });
  [['table-xa', 'filterXa'], ['table-nhom', 'filterNhom'], ['table-lop', 'filterLop']].forEach(([id, k]) =>
    document.getElementById(id).addEventListener('change', e => { t[k] = e.target.value; t.page = 1; renderTable(); }));
  document.querySelectorAll('[data-sort]').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (t.sortKey === k) t.sortDir = t.sortDir === 'asc' ? 'desc' : 'asc';
    else { t.sortKey = k; t.sortDir = 'asc'; }
    renderTable();
  }));
}

function getTableData() {
  const t = state.table;
  return state.features.map(f => f.properties).filter(p => {
    if (t.filterXa && p.xa_cu !== t.filterXa) return false;
    if (t.filterNhom && String(p.nhom) !== t.filterNhom) return false;
    if (t.filterLop === 'ln' && p.lop !== 'ln') return false;
    if (t.filterLop === 'b12' && !p.b12) return false;
    if (t.filterLop === 'yk' && !state.edits[p.id]) return false;
    return matchSearch(p, t.searchText);
  }).sort((a, b) => {
    const k = t.sortKey, dir = t.sortDir === 'asc' ? 1 : -1;
    const va = a[k] ?? '', vb = b[k] ?? '';
    const r = (isNum(va) && isNum(vb)) ? va - vb : String(va).localeCompare(String(vb), 'vi');
    return dir * (r || (a.tt - b.tt));
  });
}

function renderTable() {
  const data = getTableData(), t = state.table;
  const slice = data.slice((t.page - 1) * t.pageSize, t.page * t.pageSize);
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = slice.map(p => {
    const nh = nhomOf(p);
    return `<tr data-id="${p.id}"${p.lop === 'ln' ? ' class="row-ln"' : ''}>
      <td style="white-space:nowrap">${esc(p.xa_cu)}</td><td>${p.tbd}</td><td>${p.thua}${p.lop === 'ln' ? ' ⚠' : ''}</td>
      <td>${esc(p.ten || '')}</td><td>${esc(p.thon || '')}</td><td>${esc(p.loai)}</td>
      <td class="num">${fmt(p.dt_qd)}</td><td class="num">${isNum(p.dt_bd) ? fmt(p.dt_bd) : '<small>Không có</small>'}</td>
      <td><span class="badge" style="background:${nh.fill}55;color:${nh.stroke}">${NHOM[p.nhom] ? 'Nhóm ' + p.nhom : '—'}</span></td>
      <td style="font-size:11.5px">${p.lop === 'ln' ? '<span class="badge badge-ln">Không có trên BĐĐC</span>' : (p.b12 ? `<span class="badge badge-warn">${esc(p.danh_gia || 'Sai khác')}</span>` : esc(p.danh_gia || ''))}</td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('tr[data-id]').forEach(tr => tr.addEventListener('click', () => goToThua(tr.dataset.id)));
  renderPagination(data.length);
}

function renderPagination(total) {
  const t = state.table, pages = Math.ceil(total / t.pageSize) || 1;
  if (t.page > pages) t.page = pages;
  const b = [`<button ${t.page <= 1 ? 'disabled' : ''} onclick="goPage(${t.page - 1})">‹</button>`];
  let start = Math.max(1, t.page - 3), end = Math.min(pages, start + 6);
  start = Math.max(1, end - 6);
  if (start > 1) b.push(`<button onclick="goPage(1)">1</button>${start > 2 ? '<span class="info">…</span>' : ''}`);
  for (let i = start; i <= end; i++) b.push(`<button class="${i === t.page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`);
  if (end < pages) b.push(`${end < pages - 1 ? '<span class="info">…</span>' : ''}<button onclick="goPage(${pages})">${pages}</button>`);
  b.push(`<button ${t.page >= pages ? 'disabled' : ''} onclick="goPage(${t.page + 1})">›</button>`);
  b.push(`<span class="info">Tổng: ${fmt(total, 0)} thửa</span>`);
  document.getElementById('pagination').innerHTML = b.join('');
}
function goPage(p) { state.table.page = p; renderTable(); document.getElementById('thua-table-wrap').scrollTop = 0; }

function csvEsc(s) { s = s == null ? '' : String(s); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const today = () => new Date().toISOString().slice(0, 10);

function exportFilteredCsv() {
  const data = getTableData();
  if (!data.length) return toast('Không có dữ liệu để xuất', 'err');
  const head = ['Mã thửa', 'Khu vực', 'Tờ', 'Thửa', 'Người/đơn vị đang SD', 'Thôn, xóm', 'Loại đất HT', 'DT theo QĐ (m²)', 'DT BĐĐC (m²)', 'Nhóm PA', 'Đối chiếu', 'Lớp'];
  const rows = data.map(p => [p.ma, p.xa_cu, p.tbd, p.thua, p.ten, p.thon, p.loai, p.dt_qd, isNum(p.dt_bd) ? p.dt_bd : '', p.nhom, p.danh_gia, p.lop === 'ln' ? 'Không có trên BĐĐC' : 'BĐĐC'].map(csvEsc));
  download(new Blob(['﻿' + head.join(',') + '\n' + rows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }), `tracuu_daiphuc_${today()}.csv`);
  toast('Đã xuất CSV', 'ok');
}

/* ============================================================================
 * THỐNG KÊ
 * ============================================================================ */
function renderDashboard() {
  const fs = state.features.map(f => f.properties);
  const sum = arr => arr.reduce((s, p) => s + (+p.dt || 0), 0);
  const group = keyFn => fs.reduce((g, p) => { const k = keyFn(p); (g[k] = g[k] || []).push(p); return g; }, {});
  const total = sum(fs);
  const byNhom = group(p => p.nhom);
  const ln = fs.filter(p => p.lop === 'ln'), b12 = fs.filter(p => p.b12);
  const nyk = Object.keys(state.edits).filter(id => state.byId[id]).length;

  const card = (label, value, sub, color) => `<div class="dashboard-card"><div class="label">${label}</div><div class="value"${color ? ` style="color:${color}"` : ''}>${value}</div><div class="delta">${sub}</div></div>`;
  document.getElementById('dash-cards').innerHTML =
    card('Tổng số thửa', fmt(fs.length, 0), `Phúc Tân ${fs.filter(p => p.xa_cu === 'Phúc Tân').length} • Phúc Trìu ${fs.filter(p => p.xa_cu === 'Phúc Trìu').length}`) +
    card('Tổng diện tích (theo QĐ)', ha(total) + ' ha', fmt(total) + ' m²') +
    Object.entries(NHOM).map(([k, v]) => card(v.short.split(' – ')[0], ha(sum(byNhom[k] || [])) + ' ha', `${(byNhom[k] || []).length} thửa • ${v.short.split(' – ')[1]}`, v.stroke)).join('') +
    card('Thửa không có trên BĐĐC', ln.length + ' thửa', ha(sum(ln)) + ' ha — ranh bản đồ lâm nghiệp', '#D50000') +
    card('Sai khác lớn QĐ – BĐĐC', b12.length + ' thửa', 'Biểu 12', '#E65100') +
    card('Đã ghi ý kiến', `${nyk} thửa`, `${pct(nyk / fs.length)} số thửa`);

  document.querySelector('#table-by-nhom tbody').innerHTML = Object.entries(NHOM).map(([k, v]) => {
    const a = byNhom[k] || [];
    return `<tr><td><span class="swatch-inline" style="background:${v.fill};border-color:${v.stroke}"></span>${v.short}</td><td class="num">${a.length}</td><td class="num">${ha(sum(a))}</td><td class="num">${ha(sum(a.filter(p => p.xa_cu === 'Phúc Tân')))}</td><td class="num">${ha(sum(a.filter(p => p.xa_cu === 'Phúc Trìu')))}</td><td class="num">${pct(sum(a) / total)}</td></tr>`;
  }).join('') + `<tr style="font-weight:600"><td>Tổng cộng</td><td class="num">${fs.length}</td><td class="num">${ha(total)}</td><td class="num">${ha(sum(fs.filter(p => p.xa_cu === 'Phúc Tân')))}</td><td class="num">${ha(sum(fs.filter(p => p.xa_cu === 'Phúc Trìu')))}</td><td class="num">100%</td></tr>`;

  const byLoai = group(p => p.loai);
  document.querySelector('#table-by-loai tbody').innerHTML = Object.entries(byLoai).sort((a, b) => sum(b[1]) - sum(a[1]))
    .map(([k, a]) => { const c = LOAI[k] || LOAI_OTHER; return `<tr><td><span class="swatch-inline" style="background:${c.fill};border-color:${c.stroke}"></span><strong>${esc(k)}</strong></td><td>${LD_NAMES[k] || ''}</td><td class="num">${a.length}</td><td class="num">${ha(sum(a))}</td><td class="num">${pct(sum(a) / total)}</td></tr>`; }).join('');

  const byChu = group(p => p.chu_the);
  document.querySelector('#table-by-chu tbody').innerHTML = Object.entries(byChu).sort((a, b) => sum(b[1]) - sum(a[1]))
    .map(([k, a]) => `<tr><td>${esc(k)}</td><td>${esc(a[0].dt_sd || '')}</td><td class="num">${a.length}</td><td class="num">${ha(sum(a))}</td></tr>`).join('');

  const byTo = group(p => `${p.xa_cu}|${p.tbd}`);
  document.querySelector('#table-by-to tbody').innerHTML = Object.values(byTo)
    .sort((a, b) => (XA_ORDER.indexOf(a[0].xa_cu) - XA_ORDER.indexOf(b[0].xa_cu)) || (a[0].tbd - b[0].tbd))
    .map(a => `<tr><td>${esc(a[0].xa_cu)}</td><td>${a[0].tbd}</td><td class="num">${a.length}</td><td class="num">${ha(sum(a))}</td>${[1, 2, 3, 4, 5].map(n => `<td class="num">${(() => { const s = sum(a.filter(p => p.nhom === n)); return s ? ha(s) : ''; })()}</td>`).join('')}</tr>`).join('');

  const byThon = group(p => `${p.xa_cu}|${p.thon || '(chưa ghi thôn)'}`);
  document.querySelector('#table-by-thon tbody').innerHTML = Object.entries(byThon)
    .sort((a, b) => (XA_ORDER.indexOf(a[1][0].xa_cu) - XA_ORDER.indexOf(b[1][0].xa_cu)) || sum(b[1]) - sum(a[1]))
    .map(([k, a]) => `<tr><td>${esc(k.split('|')[1])}</td><td>${esc(a[0].xa_cu)}</td><td class="num">${a.length}</td><td class="num">${ha(sum(a))}</td></tr>`).join('');

  const lnBody = document.querySelector('#table-ln tbody');
  lnBody.innerHTML = ln.map(p => `<tr class="click" data-id="${p.id}"><td><strong>${p.tbd}/${p.thua}</strong> <small>(${esc(p.xa_cu)})</small></td><td>${esc(p.loai_qd)}</td><td class="num">${fmt(p.dt_qd)}</td><td class="num">${fmt(p.dt_bdln ?? p.dt_hh)}</td><td style="white-space:normal;font-size:12px">${(p.chong || []).map(o => `${o.to}/${o.thua} ${esc(o.loai)} (${fmt(o.dt)} m²)`).join('; ') || '—'}</td></tr>`).join('');

  const bBody = document.querySelector('#table-b12 tbody');
  bBody.innerHTML = b12.sort((a, b) => a.b12 - b.b12).map(p => {
    const bd = isNum(p.dt_bd) ? p.dt_bd : (p.dt_bdln ?? p.dt_hh);
    const d = bd - p.dt_qd;
    return `<tr class="click" data-id="${p.id}"><td>${p.to_qd}/${p.thua_qd}${p.lop === 'ln' ? ' ⚠' : ''}</td><td>${esc(p.xa_cu)}</td><td class="num">${fmt(p.dt_qd)}</td><td class="num">${fmt(bd)}</td><td class="num">${(d > 0 ? '+' : '') + fmt(d)}</td><td>${esc(p.loai_qd)} / ${esc(p.loai_bd || '—')}</td><td style="white-space:normal;font-size:12px">${esc(p.danh_gia || '')}</td></tr>`;
  }).join('');
  [lnBody, bBody].forEach(b => b.querySelectorAll('tr[data-id]').forEach(tr => tr.addEventListener('click', () => goToThua(tr.dataset.id))));
}

/* ============================================================================
 * GHI Ý KIẾN
 * ============================================================================ */
const MAX_IMG_DIM = 1280, MAX_IMG_BYTES = 800000;
let pending = [], editingId = null;

function openEditPanel(id) {
  editingId = id;
  if (isMobile()) closeMobilePanels();
  const p = state.byId[id].properties, ed = state.edits[id] || {};
  document.getElementById('edit-thua-id').textContent = `(Tờ ${p.tbd} — Thửa ${p.thua}, ${p.xa_cu})`;
  document.getElementById('edit-de-xuat').innerHTML = '<option value="">— Giữ nhóm hiện tại —</option>' +
    Object.entries(NHOM).filter(([k]) => +k !== p.nhom).map(([k, v]) => `<option value="${k}">${v.short}</option>`).join('');
  const set = (elId, val) => document.getElementById(elId).value = val || '';
  set('edit-y-kien', ed.y_kien); set('edit-de-xuat', ed.de_xuat); set('edit-ranh', ed.ranh);
  set('edit-noi-dung', ed.noi_dung); set('edit-sdt', ed.sdt);
  let nguoi = ed.nguoi;
  try { nguoi = nguoi || localStorage.getItem('daiphuc_nguoi_ghi'); } catch (e) { /* bỏ qua */ }
  set('edit-nguoi', nguoi); set('edit-ngay', ed.ngay || today());
  pending = (ed.anh || []).slice();
  renderImagePreview();
  document.getElementById('edit-panel').classList.add('open');
}
function closeEditPanel() { document.getElementById('edit-panel').classList.remove('open'); pending = []; }

function saveEdit() {
  if (!editingId) return;
  const get = id => document.getElementById(id).value.trim();
  const ed = { y_kien: get('edit-y-kien'), de_xuat: get('edit-de-xuat'), ranh: get('edit-ranh'), noi_dung: get('edit-noi-dung'),
               sdt: get('edit-sdt'), nguoi: get('edit-nguoi'), ngay: get('edit-ngay'), anh: pending.slice() };
  Object.keys(ed).forEach(k => { if (ed[k] === '' || (Array.isArray(ed[k]) && !ed[k].length)) delete ed[k]; });
  const meaningful = Object.keys(ed).some(k => !['nguoi', 'ngay'].includes(k));
  const backup = state.edits[editingId];
  if (meaningful) state.edits[editingId] = ed; else delete state.edits[editingId];
  try {
    saveEdits();
    if (ed.nguoi) localStorage.setItem('daiphuc_nguoi_ghi', ed.nguoi);
  } catch (e) {
    if (backup) state.edits[editingId] = backup; else delete state.edits[editingId];
    return toast('Bộ nhớ trình duyệt đầy — bỏ bớt ảnh hoặc xuất JSON rồi xóa bớt.', 'err');
  }
  const id = editingId;
  closeEditPanel();
  toast('Đã lưu vào trình duyệt', 'ok');
  updateCounts();
  renderThuaDetail(state.byId[id]);
}

async function onPickImages(input) {
  for (const file of Array.from(input.files || [])) {
    try {
      let data;
      if (file.type === 'application/pdf') {
        if (file.size > 3 * 1024 * 1024) { toast(`${file.name} > 3MB — bỏ qua`, 'err'); continue; }
        data = await fileToBase64(file);
      } else data = await resizeImage(file, MAX_IMG_DIM);
      pending.push({ name: file.name, type: file.type, data });
    } catch (e) { toast('Lỗi xử lý file: ' + e.message, 'err'); }
  }
  input.value = '';
  renderImagePreview();
}
function fileToBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}
function resizeImage(file, maxDim) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w = Math.round(w * r); h = Math.round(h * r); }
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      let q = 0.85, out = cv.toDataURL('image/jpeg', q);
      while (out.length > MAX_IMG_BYTES && q > 0.4) { q -= 0.1; out = cv.toDataURL('image/jpeg', q); }
      res(out);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
function renderImagePreview() {
  document.getElementById('preview-anh').innerHTML = pending.map((f, i) => `<div class="img-item">${f.type === 'application/pdf' ? `<div class="pdf-icon" title="${esc(f.name)}">📄</div>` : `<img src="${f.data}" alt="${esc(f.name)}">`}<button class="del-btn" onclick="removeImage(${i})" title="Xóa">×</button></div>`).join('');
}
function removeImage(i) { pending.splice(i, 1); renderImagePreview(); }
function viewImage(id, i) {
  const f = state.edits[id]?.anh?.[i];
  if (!f) return;
  if (f.type === 'application/pdf') { const w = window.open(); if (w) w.location = f.data; return; }
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:20px';
  ov.innerHTML = `<img src="${f.data}" style="max-width:95%;max-height:95%;object-fit:contain;border-radius:6px">`;
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
}

/* ============================================================================
 * TỔNG HỢP Ý KIẾN + EXCEL
 * ============================================================================ */
function getReportData() {
  return Object.entries(state.edits).map(([id, ed]) => {
    const f = state.byId[id];
    return f ? { ...f.properties, ...ed } : null;
  }).filter(Boolean).sort((a, b) => a.tt - b.tt);
}

function renderReport() {
  const data = getReportData();
  const sumEl = document.getElementById('report-summary'), tbody = document.getElementById('report-table-body');
  if (!data.length) {
    sumEl.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px">Chưa có ý kiến nào. Click vào thửa trên bản đồ → <em>Ghi ý kiến</em>. Có thể <em>Nhập JSON</em> do cán bộ khác xuất để gộp dữ liệu.</div>';
    tbody.innerHTML = '';
    return;
  }
  const count = k => data.reduce((o, d) => (d[k] ? (o[d[k]] = (o[d[k]] || 0) + 1, o) : o), {});
  const list = o => Object.entries(o).map(([k, v]) => `${esc(k)} (${v})`).join(' • ');
  sumEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:10px">
      <div><strong>Số thửa đã ghi ý kiến:</strong> ${data.length} / ${state.features.length}</div>
      <div><strong>Đề xuất đổi nhóm:</strong> ${data.filter(d => d.de_xuat).length} thửa</div>
      <div><strong>Trong 8 thửa không có trên BĐĐC:</strong> ${data.filter(d => d.lop === 'ln').length} / 8</div>
    </div>
    ${Object.keys(count('y_kien')).length ? `<div style="font-size:12px;color:var(--text-secondary)"><strong>Ý kiến:</strong> ${list(count('y_kien'))}</div>` : ''}
    ${Object.keys(count('ranh')).length ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px"><strong>Ranh thửa:</strong> ${list(count('ranh'))}</div>` : ''}`;
  tbody.innerHTML = data.map(d => `<tr${d.lop === 'ln' ? ' class="row-ln"' : ''}>
      <td>${esc(d.xa_cu)}</td><td>${d.tbd}</td><td>${d.thua}${d.lop === 'ln' ? ' ⚠' : ''}</td><td>${esc(d.ten || '')}</td><td>${d.nhom}</td>
      <td>${esc(d.y_kien || '')}</td><td style="max-width:240px;white-space:normal">${esc(d.noi_dung || '')}</td>
      <td>${d.de_xuat ? 'Nhóm ' + esc(d.de_xuat) : ''}</td><td>${esc(d.ranh || '')}</td>
      <td>${esc(d.nguoi || '')}</td><td>${esc(d.ngay || '')}</td>
      <td><button class="btn" style="padding:3px 8px;font-size:11px" onclick="goToThua('${d.id}')">📍 Xem</button> <button class="btn" style="padding:3px 8px;font-size:11px;color:var(--danger)" onclick="deleteEdit('${d.id}')">🗑</button></td>
    </tr>`).join('');
}

function deleteEdit(id) {
  if (!confirm(`Xóa ý kiến của thửa ${id}?`)) return;
  delete state.edits[id];
  saveEdits(); updateCounts(); renderReport();
  toast('Đã xóa', 'ok');
}

function exportReportJson() {
  if (!Object.keys(state.edits).length) return toast('Chưa có dữ liệu', 'err');
  const out = { du_an: PROJECT_NAME, don_vi: ORG_NAME, ngay_xuat: new Date().toISOString(), so_thua: Object.keys(state.edits).length, edits: state.edits };
  download(new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' }), `ykien_daiphuc_${today()}.json`);
  toast('Đã xuất JSON', 'ok');
}

function importReportJson(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const edits = JSON.parse(r.result).edits || {};
      let added = 0, replaced = 0, skipped = 0;
      Object.entries(edits).forEach(([id, ed]) => {
        if (!state.byId[id]) { skipped++; return; }
        const cur = state.edits[id];
        if (cur && (cur.ngay || '') > (ed.ngay || '')) { skipped++; return; }
        cur ? replaced++ : added++;
        state.edits[id] = ed;
      });
      saveEdits(); updateCounts(); renderReport();
      toast(`Đã gộp: ${added} mới, ${replaced} cập nhật, ${skipped} bỏ qua`, 'ok');
    } catch (e) { toast('File JSON không hợp lệ', 'err'); }
  };
  r.readAsText(file);
}

function makeSheet(title, headers, rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet([[title], [ORG_NAME], [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`], [], headers, ...rows]);
  ws['!merges'] = [0, 1, 2].map(r => ({ s: { r, c: 0 }, e: { r, c: headers.length - 1 } }));
  ws['!cols'] = widths.map(w => ({ wch: w }));
  return ws;
}

function exportReportExcel() {
  const data = getReportData();
  if (!data.length) return toast('Chưa có dữ liệu', 'err');
  if (typeof XLSX === 'undefined') return toast('Thư viện Excel chưa tải', 'err');
  const headers = ['STT', 'Mã thửa', 'Khu vực', 'Tờ', 'Thửa', 'Người SD', 'Thôn, xóm', 'DT theo QĐ (m²)', 'Nhóm PA', 'Ý kiến', 'Nội dung ý kiến', 'Đề xuất nhóm', 'Ranh thửa', 'SĐT', 'Số ảnh', 'Người ghi', 'Ngày', 'Ghi chú'];
  const rows = data.map((d, i) => [i + 1, d.ma, d.xa_cu, d.tbd, d.thua, d.ten || '', d.thon || '', d.dt_qd, d.nhom, d.y_kien || '', d.noi_dung || '', d.de_xuat || '', d.ranh || '', d.sdt || '', (d.anh || []).length, d.nguoi || '', d.ngay || '', d.lop === 'ln' ? 'Không có trên BĐĐC' : '']);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet('BIỂU TỔNG HỢP Ý KIẾN KHI CÔNG KHAI PHƯƠNG ÁN SỬ DỤNG ĐẤT', headers, rows, [5, 14, 10, 5, 6, 24, 14, 12, 7, 18, 40, 9, 22, 13, 6, 18, 11, 18]), 'Ý kiến');
  XLSX.writeFile(wb, `YKien_PASDD_DaiPhuc_${today().replace(/-/g, '')}.xlsx`);
  toast('Đã xuất Excel', 'ok');
}

function exportAllExcel() {
  if (typeof XLSX === 'undefined') return toast('Thư viện Excel chưa tải', 'err');
  const fs = state.features.map(f => f.properties);
  const headers = ['TT', 'Mã thửa', 'Khu vực', 'Số QĐ thu hồi', 'Tờ QĐ', 'Thửa QĐ', 'DT QĐ (m²)', 'Loại QĐ', 'Tờ BĐĐC', 'Thửa BĐĐC', 'DT BĐĐC (m²)', 'Loại BĐĐC', 'Người/đơn vị SD', 'Thôn, xóm', 'Loại HT (TT08)', 'Nhóm PA', 'Mã loại đất PA', 'Đối chiếu QĐ–BĐĐC', 'Ghi chú', 'Ý kiến', 'Nội dung ý kiến'];
  const rows = fs.map(p => {
    const ed = state.edits[p.id] || {};
    return [p.tt, p.ma, p.xa_cu, p.qd, p.to_qd, p.thua_qd, p.dt_qd, p.loai_qd, p.lop === 'ln' ? '' : p.tbd, p.lop === 'ln' ? 'Không có' : p.thua_bd, isNum(p.dt_bd) ? p.dt_bd : '', p.loai_bd || '', p.ten || '', p.thon || '', p.loai, p.nhom, p.loai_pa || '', p.danh_gia || '', p.ghi_chu || '', ed.y_kien || '', ed.noi_dung || ''];
  });
  rows.push(['', 'TỔNG CỘNG', '', '', '', `${fs.length} thửa`, +fs.reduce((s, p) => s + p.dt_qd, 0).toFixed(1)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, makeSheet('DANH SÁCH THỬA ĐẤT CÔNG TY LÂM NGHIỆP THÁI NGUYÊN TRẢ RA – XÃ ĐẠI PHÚC', headers, rows, [5, 14, 10, 26, 6, 6, 11, 9, 6, 8, 11, 9, 24, 14, 8, 7, 8, 22, 40, 16, 30]), 'Danh sách thửa');
  XLSX.writeFile(wb, `DanhSachThua_PASDD_DaiPhuc_${today().replace(/-/g, '')}.xlsx`);
  toast('Đã xuất Excel', 'ok');
}

/* ============================================================================
 * HƯỚNG DẪN
 * ============================================================================ */
function fillHelp() {
  document.getElementById('help-nhom').innerHTML = Object.values(NHOM).map(v =>
    `<li><span class="swatch-inline" style="background:${v.fill};border-color:${v.stroke}"></span><strong>${v.short}:</strong> ${v.full} <em>(${v.cc})</em>.</li>`).join('');
}

/* ============================================================================
 * TOAST + MOBILE
 * ============================================================================ */
let toastTimer;
function toast(msg, type = '') {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }
function openMobileSidebar() { document.getElementById('sidebar').classList.add('mobile-open'); document.getElementById('mobile-backdrop').classList.add('show'); }
function openMobileRightbar() { document.getElementById('rightbar').classList.add('mobile-open'); document.getElementById('mobile-backdrop').classList.add('show'); }
function closeRightbarMobile() { document.getElementById('rightbar').classList.remove('mobile-open'); document.getElementById('mobile-backdrop').classList.remove('show'); }
function closeMobilePanels() { document.getElementById('sidebar').classList.remove('mobile-open'); closeRightbarMobile(); }
function initMobileBehavior() {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    if (!isMobile()) return;
    if (btn.dataset.view === 'contact') document.getElementById('sidebar').classList.remove('mobile-open');
    else closeMobilePanels();
  }));
}

init();
