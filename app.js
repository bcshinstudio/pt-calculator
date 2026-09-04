const refrigerantSelect = document.querySelector('#refrigerant');
const saturationWrap = document.querySelector('#saturation-wrap');
const saturationSelect = document.querySelector('#saturation-point');
const temperatureInput = document.querySelector('#temperature');
const pressureInput = document.querySelector('#pressure');
const message = document.querySelector('#message');
const dataStatus = document.querySelector('#data-status');

let refrigerants = [];
let selectedRefrigerant = null;
let currentRows = [];
const cache = new Map();

function setMessage(text = '', type = 'error') {
  message.textContent = text;
  message.className = `message${text ? ` ${type}` : ''}`;
}

function setStatus(text = '') {
  dataStatus.textContent = text;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(v => v.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => row[h] = Number(values[i]));
    return row;
  }).filter(row => Object.values(row).every(Number.isFinite));
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

async function loadCsv(path) {
  if (cache.has(path)) return cache.get(path);
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  const rows = parseCsv(await response.text());
  cache.set(path, rows);
  return rows;
}

function populateRefrigerants() {
  refrigerantSelect.innerHTML = '';
  for (const r of refrigerants) {
    const option = document.createElement('option');
    option.value = r.id;
    option.textContent = r.available ? r.label : `${r.label} (data pending)`;
    option.disabled = !r.available;
    refrigerantSelect.append(option);
  }
  const preferred = refrigerants.find(r => r.id === 'R22' && r.available) || refrigerants.find(r => r.available);
  if (preferred) refrigerantSelect.value = preferred.id;
}

async function selectRefrigerant() {
  setMessage();
  temperatureInput.value = '';
  pressureInput.value = '';

  selectedRefrigerant = refrigerants.find(r => r.id === refrigerantSelect.value);
  if (!selectedRefrigerant) return;

  saturationWrap.classList.toggle('hidden', !selectedRefrigerant.glide);
  if (!selectedRefrigerant.glide) saturationSelect.value = 'dew';

  try {
    currentRows = await loadCsv(`data/${selectedRefrigerant.file}`);
    if (!currentRows.length) {
      setStatus(`${selectedRefrigerant.label}: P/T data has not yet passed source verification, so this refrigerant is disabled.`);
      return;
    }
    const qualifier = selectedRefrigerant.glide ? 'bubble/dew data' : 'saturation data';
    setStatus(`${selectedRefrigerant.label}: ${currentRows.length} source-verified CSV points loaded (${qualifier}).`);
  } catch (error) {
    console.error(error);
    currentRows = [];
    setMessage('Could not load the local refrigerant CSV file.', 'warning');
  }
}

function valueColumns() {
  if (selectedRefrigerant?.glide) {
    return {
      temp: 'temperature_f',
      pressure: saturationSelect.value === 'bubble' ? 'bubble_psig' : 'dew_psig'
    };
  }
  return { temp: 'temperature_f', pressure: 'pressure_psig' };
}

function interpolate(x, rows, xKey, yKey) {
  const points = rows
    .map(r => ({ x: Number(r[xKey]), y: Number(r[yKey]) }))
    .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
    .sort((a, b) => a.x - b.x);

  if (points.length < 2) throw new Error('Not enough P/T data points are available.');
  if (x < points[0].x || x > points[points.length - 1].x) {
    throw new RangeError(`Value is outside the available CSV range (${points[0].x} to ${points[points.length - 1].x}).`);
  }

  const exact = points.find(p => p.x === x);
  if (exact) return exact.y;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (x <= b.x) {
      const ratio = (x - a.x) / (b.x - a.x);
      return a.y + ratio * (b.y - a.y);
    }
  }
  throw new Error('Unable to interpolate this value.');
}

function round(value, digits = 1) {
  return Number(value.toFixed(digits));
}

function ensureRows() {
  if (!currentRows.length) {
    setMessage('No conversion data is available for this refrigerant yet.', 'warning');
    return false;
  }
  return true;
}

function calculatePressure() {
  setMessage();
  if (!ensureRows()) return;
  const temperature = Number(temperatureInput.value);
  if (!Number.isFinite(temperature)) {
    setMessage('Enter a valid temperature.');
    return;
  }
  try {
    const { temp, pressure } = valueColumns();
    pressureInput.value = round(interpolate(temperature, currentRows, temp, pressure));
  } catch (error) {
    setMessage(error.message, 'warning');
  }
}

function calculateTemperature() {
  setMessage();
  if (!ensureRows()) return;
  const pressureValue = Number(pressureInput.value);
  if (!Number.isFinite(pressureValue)) {
    setMessage('Enter a valid pressure.');
    return;
  }
  try {
    const { temp, pressure } = valueColumns();
    temperatureInput.value = round(interpolate(pressureValue, currentRows, pressure, temp));
  } catch (error) {
    setMessage(error.message, 'warning');
  }
}

temperatureInput.addEventListener('focus', () => { pressureInput.value = ''; setMessage(); });
pressureInput.addEventListener('focus', () => { temperatureInput.value = ''; setMessage(); });

temperatureInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); calculatePressure(); }
});
pressureInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); calculateTemperature(); }
});

refrigerantSelect.addEventListener('change', selectRefrigerant);
saturationSelect.addEventListener('change', () => {
  setMessage();
  if (temperatureInput.value !== '') calculatePressure();
  else if (pressureInput.value !== '') calculateTemperature();
});

async function initialize() {
  if (location.protocol === 'file:') {
    setMessage('This CSV version must be opened through a local web server or GitHub Pages. Double-click start.bat on Windows.', 'warning');
  }
  try {
    refrigerants = await loadJson('data/refrigerants.json');
    populateRefrigerants();
    await selectRefrigerant();
  } catch (error) {
    console.error(error);
    setMessage('The refrigerant index could not be loaded. If you opened index.html directly, use start.bat instead.', 'warning');
    setStatus('Local CSV files are loaded with fetch(), which browsers block from file:// pages for security reasons.');
  }
}

initialize();
