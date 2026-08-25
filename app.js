/**
 * FastAPI Studio - Client Application Script
 * Clean, structured layout with clear state indicators and robust API handling
 */

let apiBaseUrl = window.location.origin.includes('http') ? window.location.origin : 'http://127.0.0.1:8000';
if (window.location.protocol === 'file:' || window.location.hostname.includes('github.io')) {
  apiBaseUrl = 'http://127.0.0.1:8000';
}

document.addEventListener('DOMContentLoaded', () => {
  checkBackendHealth();
});

// =========================================================================
// Navigation & Collapsible Management
// =========================================================================
function goTo(pageId) {
  // Update desktop navigation links
  const navIds = ['home', 'students', 'loans', 'customers', 'risk', 'concepts'];
  navIds.forEach(id => {
    const link = document.getElementById(`nl-${id}`);
    if (link) {
      if (id === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }

    const mobLink = document.getElementById(`mnl-${id}`);
    if (mobLink) {
      if (id === pageId) {
        mobLink.classList.add('active');
      } else {
        mobLink.classList.remove('active');
      }
    }
  });

  // Switch visible page
  document.querySelectorAll('.page').forEach(page => {
    if (page.id === `page-${pageId}`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleCollapsible(elementId, button) {
  const body = document.getElementById(elementId);
  if (body) {
    body.classList.toggle('open');
  }
  if (button) {
    button.classList.toggle('open');
  }
}

// =========================================================================
// Health Check
// =========================================================================
async function checkBackendHealth() {
  const dot = document.getElementById('status-dot');
  const label = document.getElementById('status-label');

  try {
    const res = await fetch(`${apiBaseUrl}/students/S001`);
    if (res.ok) {
      if (dot) {
        dot.style.backgroundColor = 'var(--green)';
        dot.className = 'pulse-green';
      }
      if (label) label.textContent = 'Online';
    } else {
      if (dot) {
        dot.style.backgroundColor = 'var(--amber)';
        dot.className = 'pulse-amber';
      }
      if (label) label.textContent = 'Degraded';
    }
  } catch (err) {
    if (dot) {
      dot.style.backgroundColor = 'var(--red)';
      dot.className = 'pulse-red';
    }
    if (label) label.textContent = 'Offline';
  }
}

// =========================================================================
// Student Functions
// =========================================================================
function quickFind(id) {
  const input = document.getElementById('s-find-id');
  if (input) {
    input.value = id;
    doFindStudent();
  }
}

async function doFindStudent() {
  const idInput = document.getElementById('s-find-id');
  const resultDiv = document.getElementById('result-find');
  const btn = document.getElementById('btn-find');

  if (!idInput || !resultDiv || !btn) return;
  const studentId = idInput.value.trim();

  if (!studentId) {
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top:12px;font-size:0.85rem;">
        <strong>Validation Error</strong>
        <p style="margin-top:2px;color:var(--text-1);">Please enter a student ID.</p>
      </div>`;
    return;
  }

  setLoadingState(btn, true, 'Finding Student...');

  const endpoint = `/students/${encodeURIComponent(studentId)}`;
  const { status, data, time } = await performRequest('GET', endpoint);

  setLoadingState(btn, false, '<i class="fas fa-search" style="font-size:.8rem;"></i> Find Student');
  updateDevConsole('GET', endpoint, null, status, data, time);

  if (status === 200) {
    resultDiv.innerHTML = `
      <div class="result-success" style="margin-top:12px;font-size:0.85rem;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;color:var(--text-1);">${data.name}</span>
          <span class="badge badge-green">Grade ${data.grade}</span>
        </div>
        <div style="display:flex;justify-content:space-between;color:var(--text-2);font-size:0.82rem;margin-top:4px;">
          <span>Academic Marks:</span>
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--text-1);">${data.marks} / 100</span>
        </div>
        <div class="score-bar-track" style="margin-top:2px;">
          <div class="score-bar-fill" style="width:${Math.min(100, Math.max(0, data.marks))}%; background-color:var(--green);"></div>
        </div>
      </div>
    `;
  } else {
    let errorText = `Could not find student "${studentId}". Please check the ID and try again.`;
    if (data && data.detail) {
      errorText = typeof data.detail === 'string' ? data.detail : (data.detail.error || JSON.stringify(data.detail));
    }
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top:12px;font-size:0.85rem;">
        <strong>Student Not Found</strong>
        <p style="margin-top:2px;color:var(--text-1);">${errorText}</p>
        <button onclick="toggleCollapsible('dev-body', document.getElementById('dev-toggle-btn'))" style="margin-top:6px;background:none;border:none;color:var(--text-2);text-decoration:underline;font-size:0.75rem;cursor:pointer;">View technical details</button>
      </div>
    `;
  }
}

async function doUpdateMarks() {
  const idInput = document.getElementById('s-upd-id');
  const subjectInput = document.getElementById('s-upd-subj');
  const marksInput = document.getElementById('s-upd-marks');
  const resultDiv = document.getElementById('result-update');
  const btn = document.getElementById('btn-update');

  if (!idInput || !subjectInput || !marksInput || !resultDiv || !btn) return;

  const studentId = idInput.value.trim();
  const subject = subjectInput.value.trim();
  const marksVal = parseInt(marksInput.value, 10);

  const payload = {
    student_id: studentId,
    subject: subject,
    marks: isNaN(marksVal) ? 0 : marksVal
  };

  setLoadingState(btn, true, 'Submitting...');

  const endpoint = '/submit-marks';
  const { status, data, time } = await performRequest('POST', endpoint, payload);

  setLoadingState(btn, false, '<i class="fas fa-check" style="font-size:.8rem;"></i> Submit Marks');
  updateDevConsole('POST', endpoint, payload, status, data, time);

  if (status === 200) {
    resultDiv.innerHTML = `
      <div class="result-success" style="margin-top:12px;font-size:0.85rem;">
        <strong>✓ Marks Updated Successfully</strong>
        <p style="margin-top:2px;color:var(--text-1);">${data.student} scored ${data.marks} in ${data.subject}.</p>
      </div>
    `;
  } else {
    let errorText = 'Unable to submit marks. Please make sure the student exists and score is between 0 and 100.';
    let fixText = '';
    if (data && data.detail) {
      if (typeof data.detail === 'object') {
        errorText = data.detail.error || JSON.stringify(data.detail);
        if (data.detail.fix) {
          fixText = data.detail.fix;
        }
      } else {
        errorText = data.detail;
      }
    }
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top:12px;font-size:0.85rem;">
        <strong>Submission Failed (HTTP ${status})</strong>
        <p style="margin-top:2px;color:var(--text-1);">${errorText}</p>
        ${fixText ? `<p style="margin-top:4px;color:var(--amber);font-weight:600;"><i class="fas fa-lightbulb"></i> Fix: ${fixText}</p>` : ''}
        <button onclick="toggleCollapsible('dev-body', document.getElementById('dev-toggle-btn'))" style="margin-top:6px;background:none;border:none;color:var(--text-2);text-decoration:underline;font-size:0.75rem;cursor:pointer;">View raw error</button>
      </div>
    `;
  }
}

// =========================================================================
// Loan Functions
// =========================================================================
function loanPreset(income, employment, age) {
  document.getElementById('l-income').value = income;
  document.getElementById('l-emp').value = employment;
  document.getElementById('l-age').value = age;
  doLoanCheck();
}

async function doLoanCheck() {
  const nameInput = document.getElementById('l-name');
  const ageInput = document.getElementById('l-age');
  const empInput = document.getElementById('l-emp');
  const incomeInput = document.getElementById('l-income');
  const amountInput = document.getElementById('l-amount');
  const resultDiv = document.getElementById('result-loan');
  const btn = document.getElementById('btn-loan');

  if (!nameInput || !ageInput || !empInput || !incomeInput || !amountInput || !resultDiv || !btn) return;

  const payload = {
    name: nameInput.value.trim() || 'Applicant',
    age: parseInt(ageInput.value, 10) || 0,
    income: parseFloat(incomeInput.value) || 0,
    loan_amount: parseFloat(amountInput.value) || 0,
    employment_years: parseInt(empInput.value, 10) || 0
  };

  setLoadingState(btn, true, 'Checking...');

  const endpoint = '/predict';
  const { status, data, time } = await performRequest('POST', endpoint, payload);

  setLoadingState(btn, false, '<i class="fas fa-calculator" style="font-size:.8rem;"></i> Check Eligibility');
  updateDevConsole('POST', endpoint, payload, status, data, time);

  if (status === 200) {
    const eligible = data.decision === 'approved';
    resultDiv.innerHTML = `
      <div class="card" style="border-color:${eligible ? 'var(--green)' : 'var(--amber)'};">
        <div style="display:flex;align-items:center;justify-content:between;gap:8px;">
          <div style="font-size:0.95rem;font-weight:700;color:var(--text-1);flex:1;">Eligibility Result</div>
          <span class="badge ${eligible ? 'badge-green' : 'badge-amber'}">${eligible ? 'Eligible' : 'Not Eligible'}</span>
        </div>
        <div class="stat-row">
          <div class="stat-item">
            <div class="stat-label">Decision</div>
            <div class="stat-value" style="color:${eligible ? 'var(--green)' : 'var(--amber)'};">${data.decision.toUpperCase()}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Applicant Age</div>
            <div class="stat-value">${data.age} yrs</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Annual Income</div>
            <div class="stat-value">$${data.income?.toLocaleString()}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Employment</div>
            <div class="stat-value">${data.employment_years} yrs</div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-2);margin-top:12px;line-height:1.5;">
          ${eligible 
            ? '✓ The applicant meets all background verification and income criteria.' 
            : '✗ The applicant does not satisfy the minimum criteria rules.'}
        </p>
      </div>
    `;
  } else {
    resultDiv.innerHTML = `
      <div class="result-error">
        <strong>Error checking eligibility</strong>
        <p style="margin-top:2px;">FastAPI server returned HTTP ${status}.</p>
      </div>
    `;
  }
}

// =========================================================================
// Customer Search & Risk Functions
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

  if (!city || !risk || !resultDiv || !btn) return;

  setLoadingState(btn, true, 'Searching...');

  const endpoint = `/customers?city=${encodeURIComponent(city)}&risk_level=${encodeURIComponent(risk)}`;
  const { status, data, time } = await performRequest('GET', endpoint);

  setLoadingState(btn, false, '<i class="fas fa-search" style="font-size:.8rem;"></i> Search Customers');
  updateDevConsole('GET', endpoint, null, status, data, time);

  if (status === 200) {
    const list = data.results || [];
    const count = data.count || list.length;

    if (list.length === 0) {
      resultDiv.innerHTML = `
        <div class="result-neutral" style="margin-top:14px;">
          <p style="text-align:center;font-size:0.85rem;color:var(--text-2);">No customers match those criteria in ${city}.</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
          <div style="font-size:0.8rem;color:var(--text-3);font-weight:600;">FOUND ${count} MATCHING CUSTOMERS</div>
          <div class="customer-grid">
            ${list.map(c => `
              <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;">
                <div style="font-weight:700;font-size:0.88rem;color:var(--text-1);">${c.name}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
                  <span style="font-size:0.75rem;color:var(--text-2);"><i class="fas fa-location-dot"></i> ${c.city}</span>
                  <span class="badge ${c.risk_level === 'low' ? 'badge-green' : c.risk_level === 'medium' ? 'badge-amber' : 'badge-red'}">${c.risk_level}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  } else {
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top:14px;">
        <strong>Search Failed</strong>
        <p style="margin-top:2px;">Query failed with status HTTP ${status}.</p>
      </div>
    `;
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

  if (!idInput || !resultDiv || !btn) return;
  const customerId = parseInt(idInput.value, 10);

  if (isNaN(customerId)) {
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top:12px;">
        <strong>Validation Error</strong>
        <p style="margin-top:2px;">Please enter a valid numeric ID.</p>
      </div>`;
    return;
  }

  setLoadingState(btn, true, 'Loading Profile...');

  const endpoint = `/customer/${customerId}`;
  const { status, data, time } = await performRequest('GET', endpoint);

  setLoadingState(btn, false, '<i class="fas fa-id-card" style="font-size:.8rem;"></i> View Profile');
  updateDevConsole('GET', endpoint, null, status, data, time);

  if (status === 200 && !data.error) {
    const percent = data.score !== undefined ? Math.round(data.score * 100) : null;
    const badgeColor = data.risk_level === 'low' ? 'badge-green' : data.risk_level === 'medium' ? 'badge-amber' : 'badge-red';

    resultDiv.innerHTML = `
      <div class="result-neutral" style="margin-top:12px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-size:0.75rem;color:var(--text-3);font-family:'JetBrains Mono';">ID ${data.customer_id}</span>
            <h4 style="font-size:0.95rem;font-weight:700;color:var(--text-1);margin-top:1px;">${data.name}</h4>
          </div>
          <span class="badge ${badgeColor}">${data.risk_level.toUpperCase()} RISK</span>
        </div>
        ${percent !== null ? `
          <div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-2);">
              <span>Risk Score Index</span>
              <span style="font-weight:700;color:var(--text-1);font-family:'JetBrains Mono';">${data.score} (${percent}%)</span>
            </div>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width:${percent}%; background-color:${data.risk_level === 'low' ? 'var(--green)' : data.risk_level === 'medium' ? 'var(--amber)' : 'var(--red)'};"></div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    resultDiv.innerHTML = `
      <div class="result-error" style="margin-top:12px;">
        <strong>Customer Profile Not Found</strong>
        <p style="margin-top:2px;color:var(--text-1);">ID ${customerId} was not found in the risk profiles database.</p>
      </div>
    `;
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

function setLoadingState(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = text;
}

let currentCurl = '';

function updateDevConsole(method, endpoint, body, status, responseData, elapsed) {
  const badge = document.getElementById('dev-badge');
  const summary = document.getElementById('dev-summary');
  const timeEl = document.getElementById('dev-console-time');
  const curlBox = document.getElementById('dev-curl');
  const resBox = document.getElementById('dev-response');

  if (badge) {
    badge.textContent = `${method} · HTTP ${status}`;
    badge.className = `badge ${status >= 200 && status < 300 ? 'badge-green' : 'badge-red'}`;
  }

  if (summary) {
    summary.innerHTML = `<span class="method-${method.toLowerCase()}">${method}</span> <span style="font-family:'JetBrains Mono';">${endpoint}</span> &rarr; HTTP ${status}`;
  }

  if (timeEl) {
    timeEl.textContent = `${elapsed}ms`;
  }

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
      btn.innerHTML = '<i class="fas fa-check text-emerald-400"></i> Copied';
      setTimeout(() => { btn.innerHTML = orig; }, 1200);
    }
  }
}
