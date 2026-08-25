/**
 * FastAPI ML Studio - Client Application Script
 * ---------------------------------------------
 * Powers the California Housing Machine Learning valuation engine,
 * Batch CSV processing, and FastAPI learning modules.
 */

// API Base URL management (Supports localhost & GitHub Pages deployment)
let apiBaseUrl = window.location.origin.includes('http') ? window.location.origin : 'http://127.0.0.1:8000';
if (window.location.protocol === 'file:' || window.location.hostname.includes('github.io')) {
  apiBaseUrl = 'http://127.0.0.1:8000';
}

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('dev-api-url');
  if (urlInput) urlInput.value = apiBaseUrl;
  
  updateMedIncHint();
  checkBackendHealth();
  setupDragAndDrop();
});

function updateCustomApiUrl(val) {
  if (val && val.trim()) {
    apiBaseUrl = val.trim().replace(/\/+$/, '');
    testConnection();
  }
}

// =========================================================================
// Navigation Management
// =========================================================================
function goTo(pageId) {
  const pages = ['home', 'ml-predict', 'batch-upload', 'students', 'loans', 'customers', 'model-info'];
  
  pages.forEach(id => {
    const desktopLink = document.getElementById(`nl-${id}`);
    if (desktopLink) {
      if (id === pageId) desktopLink.classList.add('active');
      else desktopLink.classList.remove('active');
    }

    const mobileLink = document.getElementById(`mnl-${id}`);
    if (mobileLink) {
      if (id === pageId) mobileLink.classList.add('active');
      else mobileLink.classList.remove('active');
    }
  });

  document.querySelectorAll('.page').forEach(p => {
    if (p.id === `page-${pageId}`) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleCollapsible(elementId, button) {
  const body = document.getElementById(elementId);
  if (body) body.classList.toggle('open');
  if (button) button.classList.toggle('open');
}

// =========================================================================
// Health & Backend Connection Test
// =========================================================================
async function checkBackendHealth() {
  const dot = document.getElementById('status-dot');
  const label = document.getElementById('status-label');

  try {
    const res = await fetch(`${apiBaseUrl}/health`);
    if (res.ok) {
      const data = await res.json();
      if (dot) {
        dot.style.backgroundColor = 'var(--green)';
        dot.className = 'status-dot pulse-green';
      }
      if (label) label.textContent = 'Model Online';
      updateDevConsole('GET', '/health', null, res.status, data, 10);
    } else {
      if (dot) {
        dot.style.backgroundColor = 'var(--amber)';
        dot.className = 'status-dot pulse-amber';
      }
      if (label) label.textContent = 'Degraded';
    }
  } catch (err) {
    if (dot) {
      dot.style.backgroundColor = 'var(--red)';
      dot.className = 'status-dot pulse-red';
    }
    if (label) label.textContent = 'Backend Offline';
  }
}

function testConnection() {
  checkBackendHealth();
}

// =========================================================================
// 1. Machine Learning Housing Predictor
// =========================================================================
const housingPresets = {
  sf_bay: {
    MedInc: 8.3252,
    HouseAge: 41.0,
    AveRooms: 6.9841,
    AveBedrms: 1.0238,
    Population: 322.0,
    AveOccup: 2.5555,
    Latitude: 37.88,
    Longitude: -122.23
  },
  silicon_valley: {
    MedInc: 9.4215,
    HouseAge: 26.0,
    AveRooms: 7.2105,
    AveBedrms: 1.0412,
    Population: 1050.0,
    AveOccup: 2.7200,
    Latitude: 37.44,
    Longitude: -122.16
  },
  beverly_hills: {
    MedInc: 6.8520,
    HouseAge: 35.0,
    AveRooms: 6.5400,
    AveBedrms: 1.0920,
    Population: 780.0,
    AveOccup: 2.8500,
    Latitude: 34.07,
    Longitude: -118.40
  },
  central_valley: {
    MedInc: 2.4510,
    HouseAge: 19.0,
    AveRooms: 4.8500,
    AveBedrms: 1.1200,
    Population: 2450.0,
    AveOccup: 3.6500,
    Latitude: 36.74,
    Longitude: -119.78
  }
};

function applyHousingPreset(key) {
  const p = housingPresets[key];
  if (!p) return;

  document.getElementById('h-medinc').value = p.MedInc;
  document.getElementById('h-age').value = p.HouseAge;
  document.getElementById('h-rooms').value = p.AveRooms;
  document.getElementById('h-bedrms').value = p.AveBedrms;
  document.getElementById('h-pop').value = p.Population;
  document.getElementById('h-occup').value = p.AveOccup;
  document.getElementById('h-lat').value = p.Latitude;
  document.getElementById('h-long').value = p.Longitude;

  updateMedIncHint();
  doHousePredict();
}

function updateMedIncHint() {
  const val = parseFloat(document.getElementById('h-medinc').value) || 0;
  const approxUsd = Math.round(val * 10000);
  const hint = document.getElementById('medinc-usd-hint');
  if (hint) hint.textContent = `≈ $${approxUsd.toLocaleString()} / yr`;
}

async function doHousePredict() {
  const btn = document.getElementById('btn-predict-house');
  const resultDiv = document.getElementById('ml-result-container');

  const payload = {
    MedInc: parseFloat(document.getElementById('h-medinc').value) || 0,
    HouseAge: parseFloat(document.getElementById('h-age').value) || 0,
    AveRooms: parseFloat(document.getElementById('h-rooms').value) || 0,
    AveBedrms: parseFloat(document.getElementById('h-bedrms').value) || 0,
    Population: parseFloat(document.getElementById('h-pop').value) || 0,
    AveOccup: parseFloat(document.getElementById('h-occup').value) || 0,
    Latitude: parseFloat(document.getElementById('h-lat').value) || 0,
    Longitude: parseFloat(document.getElementById('h-long').value) || 0
  };

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Running Inference...');

  const endpoint = '/predict';
  const { status, data, time } = await performRequest('POST', endpoint, payload);

  setLoadingState(btn, false, '<i class="fas fa-calculator"></i> Compute House Price Prediction');
  updateDevConsole('POST', endpoint, payload, status, data, time);

  if (status === 200 && data.predicted_price) {
    const rawVal = data.raw_price_usd || 0;
    const meterPercent = Math.min(100, Math.max(5, Math.round((rawVal / 600000) * 100)));

    resultDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge badge-green"><i class="fas fa-check-circle"></i> Random Forest Valuation</span>
        <span style="font-size: 0.76rem; color: var(--text-3); font-family: 'JetBrains Mono';">${time}ms latency</span>
      </div>

      <div style="margin-top: 12px;">
        <div style="font-size: 0.8rem; color: var(--text-3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Predicted Property Value</div>
        <div class="hero-prediction-price text-green">${data.predicted_price}</div>
        <div class="price-range-badge">
          <i class="fas fa-arrows-left-right"></i> Model Range: ${data.evidence_range}
        </div>
      </div>

      <div style="margin-top: 18px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-2); margin-bottom: 4px;">
          <span>California Market Percentile</span>
          <span style="font-family: 'JetBrains Mono'; font-weight: 700;">${meterPercent}% Index</span>
        </div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: ${meterPercent}%;"></div>
        </div>
      </div>

      <div class="feature-summary-grid">
        <div class="fs-item">
          <div class="fs-label">Median Income</div>
          <div class="fs-value">$${Math.round(payload.MedInc * 10000).toLocaleString()}</div>
        </div>
        <div class="fs-item">
          <div class="fs-label">House Age</div>
          <div class="fs-value">${payload.HouseAge} yrs</div>
        </div>
        <div class="fs-item">
          <div class="fs-label">Avg Rooms</div>
          <div class="fs-value">${payload.AveRooms.toFixed(2)}</div>
        </div>
        <div class="fs-item">
          <div class="fs-label">Coordinates</div>
          <div class="fs-value">${payload.Latitude.toFixed(2)}°, ${payload.Longitude.toFixed(2)}°</div>
        </div>
      </div>
    `;
  } else {
    let errorMsg = 'Failed to obtain prediction from FastAPI server.';
    if (data && data.detail) {
      errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
    resultDiv.innerHTML = `
      <div class="result-error">
        <strong>Prediction Error (HTTP ${status})</strong>
        <p style="margin-top: 4px;">${errorMsg}</p>
        <p style="font-size: 0.78rem; color: var(--text-3); margin-top: 6px;">Ensure your FastAPI backend is running locally at ${apiBaseUrl}.</p>
      </div>
    `;
  }
}

// =========================================================================
// 2. Batch CSV Processing & Upload
// =========================================================================
let selectedBatchFile = null;

function setupDragAndDrop() {
  const dropZone = document.getElementById('csv-drop-zone');
  if (!dropZone) return;

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelected(files);
  });
}

function handleFileSelected(files) {
  if (!files || files.length === 0) return;
  const file = files[0];

  if (!file.name.endsWith('.csv')) {
    alert('Please select a valid .csv file.');
    return;
  }

  selectedBatchFile = file;
  const infoBox = document.getElementById('file-info-box');
  const nameEl = document.getElementById('file-name-display');
  const sizeEl = document.getElementById('file-size-display');

  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) sizeEl.textContent = `${Math.round(file.size / 1024)} KB`;
  if (infoBox) infoBox.style.display = 'flex';
}

async function doBatchPredict() {
  if (!selectedBatchFile) return;

  const btn = document.getElementById('btn-batch-process');
  const resultDiv = document.getElementById('result-batch');

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Processing CSV...');

  const formData = new FormData();
  formData.append('file', selectedBatchFile);

  const start = performance.now();
  const url = `${apiBaseUrl}/predict-file`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const elapsed = Math.round(performance.now() - start);

    if (res.ok) {
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = `predicted_${selectedBatchFile.name}`;

      setLoadingState(btn, false, '<i class="fas fa-bolt"></i> Process Batch Predictions');
      updateDevConsole('POST', '/predict-file', `[FormData: ${selectedBatchFile.name}]`, res.status, { message: 'File streamed successfully', size_bytes: blob.size }, elapsed);

      resultDiv.innerHTML = `
        <div class="result-success" style="margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong>✓ Batch Processing Complete!</strong>
              <p style="font-size: 0.84rem; color: var(--text-1); margin-top: 2px;">
                Predictions computed and formatted for every row in <strong>${selectedBatchFile.name}</strong> (${elapsed}ms).
              </p>
            </div>
            <a href="${downloadUrl}" download="${filename}" class="btn btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <i class="fas fa-download"></i> Download ${filename}
            </a>
          </div>
        </div>
      `;
    } else {
      let errData = await res.json().catch(() => ({ detail: 'Failed to process CSV file' }));
      setLoadingState(btn, false, '<i class="fas fa-bolt"></i> Process Batch Predictions');
      updateDevConsole('POST', '/predict-file', `[FormData: ${selectedBatchFile.name}]`, res.status, errData, elapsed);

      resultDiv.innerHTML = `
        <div class="result-error" style="margin-top: 16px;">
          <strong>Batch Prediction Failed (HTTP ${res.status})</strong>
          <p style="margin-top: 2px;">${errData.detail || 'Make sure required feature columns are present in your CSV.'}</p>
        </div>
      `;
    }
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    setLoadingState(btn, false, '<i class="fas fa-bolt"></i> Process Batch Predictions');
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top: 16px;">
        <strong>Network Error</strong>
        <p style="margin-top: 2px;">Could not connect to FastAPI server: ${err.message}</p>
      </div>
    `;
  }
}

// =========================================================================
// 3. Student Marks Management
// =========================================================================
function quickFind(id) {
  document.getElementById('s-find-id').value = id;
  doFindStudent();
}

function setStudentMarksTest(marks, subject) {
  document.getElementById('s-upd-marks').value = marks;
  document.getElementById('s-upd-subj').value = subject;
  doUpdateMarks();
}

async function doFindStudent() {
  const idInput = document.getElementById('s-find-id');
  const resultDiv = document.getElementById('result-find');
  const btn = document.getElementById('btn-find');

  if (!idInput || !resultDiv || !btn) return;
  const studentId = idInput.value.trim();

  if (!studentId) {
    resultDiv.innerHTML = `<div class="result-error" style="margin-top: 12px;">Please enter a Student ID.</div>`;
    return;
  }

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Searching...');

  const endpoint = `/students/${encodeURIComponent(studentId)}`;
  const { status, data, time } = await performRequest('GET', endpoint);

  setLoadingState(btn, false, '<i class="fas fa-search"></i> Query Student Record');
  updateDevConsole('GET', endpoint, null, status, data, time);

  if (status === 200) {
    resultDiv.innerHTML = `
      <div class="result-success" style="margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 1rem; color: #fff;">${data.name}</strong>
          <span class="badge badge-green">Grade ${data.grade}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-2); margin-top: 6px;">
          <span>Academic Marks:</span>
          <span style="font-family: 'JetBrains Mono'; font-weight: 700; color: #fff;">${data.marks} / 100</span>
        </div>
        <div class="score-bar-track" style="margin-top: 6px;">
          <div class="score-bar-fill" style="width: ${Math.min(100, Math.max(0, data.marks))}%;"></div>
        </div>
      </div>
    `;
  } else {
    let errorText = data && data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : `Student "${studentId}" not found.`;
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top: 12px;">
        <strong>Student Not Found (HTTP ${status})</strong>
        <p style="margin-top: 2px;">${errorText}</p>
      </div>
    `;
  }
}

async function doUpdateMarks() {
  const id = document.getElementById('s-upd-id').value.trim();
  const subject = document.getElementById('s-upd-subj').value.trim();
  const marks = parseInt(document.getElementById('s-upd-marks').value, 10);
  const resultDiv = document.getElementById('result-update');
  const btn = document.getElementById('btn-update');

  const payload = { student_id: id, subject: subject, marks: isNaN(marks) ? 0 : marks };

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Submitting...');

  const endpoint = '/submit-marks';
  const { status, data, time } = await performRequest('POST', endpoint, payload);

  setLoadingState(btn, false, '<i class="fas fa-check"></i> Submit Marks Update');
  updateDevConsole('POST', endpoint, payload, status, data, time);

  if (status === 200) {
    resultDiv.innerHTML = `
      <div class="result-success" style="margin-top: 12px;">
        <strong>✓ Marks Updated Successfully</strong>
        <p style="margin-top: 2px;">${data.student} scored ${data.marks} in ${data.subject}.</p>
      </div>
    `;
  } else {
    let errText = 'Submission failed.';
    let fixText = '';
    if (data && data.detail) {
      if (typeof data.detail === 'object') {
        errText = data.detail.error || JSON.stringify(data.detail);
        if (data.detail.fix) fixText = data.detail.fix;
      } else {
        errText = data.detail;
      }
    }
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top: 12px;">
        <strong>Validation Failed (HTTP ${status})</strong>
        <p style="margin-top: 2px;">${errText}</p>
        ${fixText ? `<p style="margin-top: 4px; color: var(--amber); font-weight: 600;">Fix: ${fixText}</p>` : ''}
      </div>
    `;
  }
}

// =========================================================================
// 4. Loan Eligibility Evaluation
// =========================================================================
function loanPreset(name, income, emp, age, amount) {
  document.getElementById('l-name').value = name;
  document.getElementById('l-income').value = income;
  document.getElementById('l-emp').value = emp;
  document.getElementById('l-age').value = age;
  document.getElementById('l-amount').value = amount;
  doLoanCheck();
}

async function doLoanCheck() {
  const btn = document.getElementById('btn-loan');
  const resultDiv = document.getElementById('result-loan');

  const payload = {
    name: document.getElementById('l-name').value.trim() || 'Applicant',
    age: parseInt(document.getElementById('l-age').value, 10) || 0,
    income: parseFloat(document.getElementById('l-income').value) || 0,
    loan_amount: parseFloat(document.getElementById('l-amount').value) || 0,
    employment_years: parseInt(document.getElementById('l-emp').value, 10) || 0
  };

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Evaluating...');

  const endpoint = '/predict-loan';
  const { status, data, time } = await performRequest('POST', endpoint, payload);

  setLoadingState(btn, false, '<i class="fas fa-calculator"></i> Evaluate Loan Application');
  updateDevConsole('POST', endpoint, payload, status, data, time);

  if (status === 200) {
    const eligible = data.decision === 'approved';
    resultDiv.innerHTML = `
      <div class="card" style="border-color: ${eligible ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #fff;">Application Decision</strong>
          <span class="badge ${eligible ? 'badge-green' : 'badge-amber'}">${data.decision.toUpperCase()}</span>
        </div>

        <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="fs-item"><div class="fs-label">Income</div><div class="fs-value">$${data.income.toLocaleString()}</div></div>
          <div class="fs-item"><div class="fs-label">Employment</div><div class="fs-value">${data.employment_years} yrs</div></div>
          <div class="fs-item"><div class="fs-label">Age</div><div class="fs-value">${data.age} yrs</div></div>
          <div class="fs-item"><div class="fs-label">Requested</div><div class="fs-value">$${data.loan_amount.toLocaleString()}</div></div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-2); margin-top: 12px;">
          ${eligible ? '✓ Meets income (&gt; $50k), age (&ge; 21), and employment (&gt; 2 yrs) requirements.' : '✗ Does not fulfill all minimum risk parameters.'}
        </p>
      </div>
    `;
  } else {
    resultDiv.innerHTML = `<div class="result-error">Evaluation failed with HTTP ${status}.</div>`;
  }
}

// =========================================================================
// 5. Customer Queries & Risk Profiles
// =========================================================================
function customerPreset(city, risk) {
  document.getElementById('c-city').value = city;
  document.getElementById('c-risk').value = risk;
  doSearchCustomers();
}

async function doSearchCustomers() {
  const city = document.getElementById('c-city').value;
  const risk = document.getElementById('c-risk').value;
  const resultDiv = document.getElementById('result-customers');
  const btn = document.getElementById('btn-customers');

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Filtering...');

  const endpoint = `/customers?city=${encodeURIComponent(city)}&risk_level=${encodeURIComponent(risk)}`;
  const { status, data, time } = await performRequest('GET', endpoint);

  setLoadingState(btn, false, '<i class="fas fa-search"></i> Search Customer Records');
  updateDevConsole('GET', endpoint, null, status, data, time);

  if (status === 200) {
    const list = data.results || [];
    if (list.length === 0) {
      resultDiv.innerHTML = `<div class="result-neutral" style="margin-top: 12px; text-align: center; color: var(--text-3);">No matching customer records in ${city}.</div>`;
    } else {
      resultDiv.innerHTML = `
        <div style="margin-top: 14px;">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-3); text-transform: uppercase;">Found ${data.count} Match(es)</div>
          <div class="customer-grid">
            ${list.map(c => `
              <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px;">
                <strong style="color: #fff; font-size: 0.92rem;">${c.name}</strong>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 0.78rem; color: var(--text-2);">
                  <span><i class="fas fa-location-dot"></i> ${c.city}</span>
                  <span class="badge ${c.risk_level === 'low' ? 'badge-green' : c.risk_level === 'medium' ? 'badge-amber' : 'badge-red'}">${c.risk_level}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  } else {
    resultDiv.innerHTML = `<div class="result-error" style="margin-top: 12px;">Query failed with HTTP ${status}.</div>`;
  }
}

function riskPreset(id) {
  document.getElementById('c-id').value = id;
  doViewRisk();
}

async function doViewRisk() {
  const idInput = document.getElementById('c-id');
  const resultDiv = document.getElementById('result-risk');
  const btn = document.getElementById('btn-risk');

  const customerId = parseInt(idInput.value, 10);
  if (isNaN(customerId)) {
    resultDiv.innerHTML = `<div class="result-error" style="margin-top: 12px;">Enter a numeric ID.</div>`;
    return;
  }

  setLoadingState(btn, true, '<i class="fas fa-spinner fa-spin"></i> Fetching...');

  const endpoint = `/customer/${customerId}`;
  const { status, data, time } = await performRequest('GET', endpoint);

  setLoadingState(btn, false, '<i class="fas fa-shield-halved"></i> Fetch Risk Profile');
  updateDevConsole('GET', endpoint, null, status, data, time);

  if (status === 200 && !data.error) {
    const percent = Math.round((data.score || 0) * 100);
    const badgeColor = data.risk_level === 'low' ? 'badge-green' : data.risk_level === 'medium' ? 'badge-amber' : 'badge-red';

    resultDiv.innerHTML = `
      <div class="result-neutral" style="margin-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.74rem; color: var(--text-3); font-family: 'JetBrains Mono';">Customer ID #${data.customer_id}</span>
            <h4 style="font-size: 1rem; color: #fff; margin-top: 2px;">${data.name}</h4>
          </div>
          <span class="badge ${badgeColor}">${data.risk_level.toUpperCase()} RISK</span>
        </div>
        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-2); margin-bottom: 4px;">
            <span>Risk Index Score: ${data.score}</span>
            <span>${percent}%</span>
          </div>
          <div class="score-bar-track">
            <div class="score-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      </div>
    `;
  } else {
    resultDiv.innerHTML = `<div class="result-error" style="margin-top: 12px;">Customer #${customerId} profile not found.</div>`;
  }
}

// =========================================================================
// General Request & Developer Console Helpers
// =========================================================================
async function performRequest(method, endpoint, payload = null) {
  const url = `${apiBaseUrl}${endpoint}`;
  const start = performance.now();

  try {
    const opts = {
      method: method,
      headers: { 'Accept': 'application/json' }
    };

    if (payload) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(payload);
    }

    const res = await fetch(url, opts);
    const elapsed = Math.round(performance.now() - start);

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { raw: await res.text() };
    }

    return { status: res.status, data: data, time: elapsed };
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    return {
      status: 0,
      data: { error: 'Network Error', detail: err.message },
      time: elapsed
    };
  }
}

function setLoadingState(btn, isLoading, htmlContent) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = htmlContent;
}

let currentCurl = '';

function updateDevConsole(method, endpoint, body, status, responseData, elapsed) {
  const badge = document.getElementById('dev-badge');
  const summary = document.getElementById('dev-summary');
  const latency = document.getElementById('dev-latency');
  const curlBox = document.getElementById('dev-curl');
  const resBox = document.getElementById('dev-response');

  if (badge) {
    badge.textContent = `${method} · HTTP ${status}`;
    badge.className = `badge ${status >= 200 && status < 300 ? 'badge-green' : 'badge-red'}`;
  }

  if (summary) {
    summary.innerHTML = `<strong>${method}</strong> <code>${endpoint}</code> &rarr; Status <strong>${status}</strong>`;
  }

  if (latency) latency.textContent = `${elapsed}ms`;

  let curl = `curl -X ${method} "${apiBaseUrl}${endpoint}"`;
  if (body) {
    curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`;
  }
  currentCurl = curl;

  if (curlBox) curlBox.textContent = curl;
  if (resBox) {
    resBox.textContent = JSON.stringify(responseData, null, 2);
    resBox.style.color = status >= 200 && status < 300 ? '#86efac' : '#f87171';
  }
}

function devCopyCurl() {
  if (currentCurl) {
    navigator.clipboard.writeText(currentCurl);
    const btn = document.getElementById('btn-copy-curl');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check text-green"></i> Copied';
      setTimeout(() => { btn.innerHTML = orig; }, 1400);
    }
  }
}
