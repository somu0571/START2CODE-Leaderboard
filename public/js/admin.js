// Admin Client Script for START2CODE
(function () {
  // 1. Initialize Firebase Auth if on Login Page
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    if (window.firebase && window.__FIREBASE_CONFIG__ && window.__FIREBASE_CONFIG__.apiKey) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.__FIREBASE_CONFIG__);
        }
      } catch (e) {
        console.warn('Firebase client init:', e);
      }
    }

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      const errorText = document.getElementById('login-error-text');

      if (!window.__FIREBASE_CONFIG__ || !window.__FIREBASE_CONFIG__.apiKey) {
        errorDiv.classList.remove('hidden');
        errorText.textContent = 'Firebase Web SDK credentials are not configured. Please set FIREBASE_API_KEY in your .env file.';
        return;
      }

      if (!window.firebase || !firebase.auth) {
        errorDiv.classList.remove('hidden');
        errorText.textContent = 'Firebase SDK failed to load. Please check your network connection.';
        return;
      }
      const submitBtn = document.getElementById('login-btn');
      const spinner = document.getElementById('login-spinner');
      const btnText = document.getElementById('login-btn-text');

      errorDiv.classList.add('hidden');
      submitBtn.disabled = true;
      spinner.classList.remove('hidden');
      btnText.textContent = 'Verifying...';

      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken(true);

        // Store session cookie for server-side verification
        document.cookie = `__session=${token}; path=/; max-age=86400; SameSite=Lax`;

        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } catch (err) {
        console.error('Login error:', err);
        errorDiv.classList.remove('hidden');
        errorText.textContent = err.message || 'Failed to authenticate. Please check your credentials.';
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        btnText.textContent = 'Sign In to Admin Portal';
      }
    });
  }

  // 2. Admin Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      document.cookie = '__session=; path=/; max-age=0; SameSite=Lax';
      if (window.firebase && firebase.auth) {
        try {
          await firebase.auth().signOut();
        } catch (_) {}
      }
      window.location.href = '/admin/login';
    });
  }
})();

// Helper function for API calls
async function postAdmin(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data || {})
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Request failed');
  }
  return body;
}

// 3. Quick Resync Modal
function openResyncModal() {
  document.getElementById('resync-modal')?.classList.remove('hidden');
  document.getElementById('resync-pr-input')?.focus();
}

function closeResyncModal() {
  document.getElementById('resync-modal')?.classList.add('hidden');
}

async function submitResync() {
  const prInput = document.getElementById('resync-pr-input');
  const prNumber = parseInt(prInput.value, 10);
  if (!prNumber || prNumber < 1) {
    alert('Please enter a valid PR number');
    return;
  }

  const btn = document.getElementById('submit-resync-btn');
  btn.disabled = true;
  btn.textContent = 'Resyncing...';

  try {
    const res = await postAdmin('/admin/resync', { prNumber });
    alert(`PR #${prNumber} resynced successfully! Awarded points: ${res.pointsAwarded || 0}`);
    window.location.reload();
  } catch (err) {
    alert(`Resync failed: ${err.message}`);
    btn.disabled = false;
    btn.textContent = 'Resync PR';
  }
}

async function resyncSinglePR(prNumber) {
  if (!confirm(`Are you sure you want to resync PR #${prNumber} from GitHub?`)) return;
  try {
    const res = await postAdmin('/admin/resync', { prNumber });
    alert(`PR #${prNumber} resynced successfully! Awarded points: ${res.pointsAwarded || 0}`);
    window.location.reload();
  } catch (err) {
    alert(`Resync failed: ${err.message}`);
  }
}

document.getElementById('quick-resync-btn')?.addEventListener('click', openResyncModal);

// 4. Contribution Management: Approve, Reject, Adjust
async function approveContribution(id) {
  if (!confirm('Approve this contribution and award calculated points?')) return;
  try {
    await postAdmin(`/admin/contributions/${id}/approve`);
    window.location.reload();
  } catch (err) {
    alert(`Approval failed: ${err.message}`);
  }
}

async function rejectContribution(id) {
  const reason = prompt('Enter a reason for rejecting this contribution (optional):', 'Violates contribution rules');
  if (reason === null) return;
  try {
    await postAdmin(`/admin/contributions/${id}/reject`, { reason });
    window.location.reload();
  } catch (err) {
    alert(`Rejection failed: ${err.message}`);
  }
}

// Adjust Points Modal
function openAdjustModal(id, currentPoints, username) {
  const modal = document.getElementById('adjust-modal');
  const sub = document.getElementById('adjust-modal-sub');
  const idInput = document.getElementById('adjust-contrib-id');
  const ptsInput = document.getElementById('adjust-points-input');
  const reasonInput = document.getElementById('adjust-reason-input');

  if (!modal) return;
  idInput.value = id;
  sub.textContent = `Contributor: @${username} (Current PR Points: ${currentPoints})`;
  ptsInput.value = '';
  reasonInput.value = '';
  modal.classList.remove('hidden');
  ptsInput.focus();
}

function closeAdjustModal() {
  document.getElementById('adjust-modal')?.classList.add('hidden');
}

async function submitAdjustment() {
  const id = document.getElementById('adjust-contrib-id').value;
  const adjustment = parseInt(document.getElementById('adjust-points-input').value, 10);
  const reason = document.getElementById('adjust-reason-input').value.trim();

  if (isNaN(adjustment) || adjustment === 0) {
    alert('Please enter a valid non-zero adjustment point value');
    return;
  }

  if (!reason) {
    alert('Please provide a reason for the audit trail');
    return;
  }

  const btn = document.getElementById('submit-adjust-btn');
  btn.disabled = true;
  btn.textContent = 'Applying...';

  try {
    await postAdmin(`/admin/contributions/${id}/adjust`, { adjustment, reason });
    alert('Adjustment applied successfully!');
    window.location.reload();
  } catch (err) {
    alert(`Adjustment failed: ${err.message}`);
    btn.disabled = false;
    btn.textContent = 'Apply Adjustment';
  }
}

// 5. Point Rules Modal
function openRuleModal() {
  document.getElementById('rule-modal-title').textContent = 'Add Point Rule';
  document.getElementById('rule-label-input').value = '';
  document.getElementById('rule-label-input').disabled = false;
  document.getElementById('rule-points-input').value = '10';
  document.getElementById('rule-description-input').value = '';
  document.getElementById('rule-active-input').checked = true;
  document.getElementById('rule-modal')?.classList.remove('hidden');
}

function editRule(label, points, desc, active) {
  document.getElementById('rule-modal-title').textContent = `Edit Rule: ${label}`;
  const labelInput = document.getElementById('rule-label-input');
  labelInput.value = label;
  labelInput.disabled = true;
  document.getElementById('rule-points-input').value = points;
  document.getElementById('rule-description-input').value = desc || '';
  document.getElementById('rule-active-input').checked = active;
  document.getElementById('rule-modal')?.classList.remove('hidden');
}

function closeRuleModal() {
  document.getElementById('rule-modal')?.classList.add('hidden');
}

async function submitRuleForm(e) {
  e.preventDefault();
  const label = document.getElementById('rule-label-input').value.trim().toLowerCase();
  const points = parseInt(document.getElementById('rule-points-input').value, 10);
  const description = document.getElementById('rule-description-input').value.trim();
  const active = document.getElementById('rule-active-input').checked;

  if (!label || isNaN(points)) {
    alert('Label and valid points value are required');
    return;
  }

  const btn = document.getElementById('save-rule-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    await postAdmin('/admin/point-rules', { label, points, description, active });
    alert(`Rule for "${label}" saved successfully!`);
    window.location.reload();
  } catch (err) {
    alert(`Failed to save rule: ${err.message}`);
    btn.disabled = false;
    btn.textContent = 'Save Rule';
  }
}
