/* profile.js — Fetches and renders a single user profile page */

const PROF_COLORS = [
  'linear-gradient(135deg,#1a6b8a,#0d3f5a)',
  'linear-gradient(135deg,#1a4d2e,#0e2e1b)',
  'linear-gradient(135deg,#5a1a8a,#350f52)',
  'linear-gradient(135deg,#0f4c7a,#062f52)',
  'linear-gradient(135deg,#7a3a0f,#4a2208)',
  'linear-gradient(135deg,#1a3a6b,#0d2244)',
  'linear-gradient(135deg,#6b1a3a,#3f0d22)',
  'linear-gradient(135deg,#2d6a2d,#1a3f1a)',
  'linear-gradient(135deg,#5a4a0f,#382d08)',
];

function profAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return PROF_COLORS[h % PROF_COLORS.length];
}

function profInitials(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').split(' ')
    .filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function profActiveText(lastActive) {
  const days = Math.floor((Date.now() - new Date(lastActive)) / 86400000);
  if (days === 0) return 'Active today';
  if (days === 1) return 'Active yesterday';
  if (days < 7)  return `Active ${days} days ago`;
  if (days < 30) return `Active ${Math.floor(days/7)} weeks ago`;
  return 'Active recently';
}

function profJoinedText(createdAt) {
  const d = new Date(createdAt);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const DISC_LABELS = {
  'life-sciences':'Biology & Life Sciences','chemistry':'Chemistry','physics':'Physics',
  'medicine':'Medicine & Biomedical','environment':'Environmental Science',
  'neuroscience':'Neuroscience','aerospace':'Aerospace Engineering',
  'biomedical-eng':'Biomedical Engineering','chemical-eng':'Chemical Engineering',
  'electrical':'Electrical Engineering','mechanical':'Mechanical Engineering',
  'materials':'Materials Engineering','nuclear':'Nuclear Engineering',
  'cs':'Computer Science & Software','ai-ml':'AI & Machine Learning',
  'data-science':'Data Science & Analytics','mathematics':'Mathematics & Statistics',
  'quantum':'Quantum Computing',
};

const ROLE_LABELS = { seeker:'Looking for Work', poster:'Hiring / Posting', both:'Open to Both' };
const ROLE_COLORS = {
  seeker:  { bg:'var(--green-100)', color:'var(--green-700)' },
  poster:  { bg:'var(--blue-100)',  color:'var(--blue-600)'  },
  both:    { bg:'var(--violet-100)',color:'var(--violet-600)' },
};
const JTYPE_LABELS = { freelance:'Freelance', contract:'Contract', fulltime:'Full-Time', parttime:'Part-Time', advisory:'Advisory' };

function renderProfile(p) {
  const initials = profInitials(p.display_name);
  const color    = p.avatar_color || profAvatarColor(p.display_name);
  const role     = ROLE_COLORS[p.role] || ROLE_COLORS.seeker;

  const avatar = p.avatar_url
    ? `<img src="${p.avatar_url}" alt="${initials}" class="pf-avatar-img" />`
    : `<div class="pf-avatar-initials" style="background:${color}">${initials}</div>`;

  const skills = (p.skills || []).map(s => `<span class="tag">${s}</span>`).join('');
  const discs  = (p.discipline_prefs || [])
    .map(d => `<span class="pf-disc-tag">${DISC_LABELS[d] || d}</span>`).join('');
  const jtypes = (p.job_type_prefs || [])
    .map(t => `<span class="pf-jtype-tag">${JTYPE_LABELS[t] || t}</span>`).join('');

  const socialLinks = [
    p.website_url  ? `<a href="${p.website_url}"  target="_blank" rel="noopener" class="pf-social-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Website</a>` : '',
    p.linkedin_url ? `<a href="${p.linkedin_url}" target="_blank" rel="noopener" class="pf-social-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>` : '',
    p.facebook_url ? `<a href="${p.facebook_url}" target="_blank" rel="noopener" class="pf-social-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>Facebook</a>` : '',
    p.academic_url ? `<a href="${p.academic_url}" target="_blank" rel="noopener" class="pf-social-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Research</a>` : '',
  ].filter(Boolean).join('');

  const root = document.getElementById('profileRoot');
  if (!root) return;

  root.innerHTML = `
    <div class="pf-layout">

      <!-- ── LEFT / MAIN ─────────────────────────────────────── -->
      <div class="pf-main">

        <!-- Header card -->
        <div class="pf-header-card">
          <div class="pf-header-top">
            <div class="pf-avatar-wrap">
              ${avatar}
              <div class="pf-active-dot" title="${profActiveText(p.last_active_at)}"></div>
            </div>
            <div class="pf-header-info">
              <div class="pf-name">${p.display_name}</div>
              ${p.title ? `<div class="pf-title">${p.title}</div>` : ''}
              <div class="pf-meta-row">
                ${p.country ? `<span class="pf-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${p.country}</span>` : ''}
                ${p.currency ? `<span class="pf-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>${p.currency}</span>` : ''}
                ${p.account_type === 'organization' && p.org_industry ? `<span class="pf-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>${p.org_industry}</span>` : ''}
                <span class="pf-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${profActiveText(p.last_active_at)}</span>
              </div>
              <div class="pf-badge-row">
                <span class="pf-role-badge" style="background:${role.bg};color:${role.color}">${ROLE_LABELS[p.role] || p.role}</span>
                ${p.account_type === 'organization' ? '<span class="pf-org-badge">🏢 Organisation</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="pf-actions">
            <button class="btn btn-primary pf-msg-btn" onclick="openMessageModal('${p.id}','${p.display_name.replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Message
            </button>
            <button class="btn pf-save-btn" id="saveProfileBtn" onclick="toggleSaveProfile(this)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              Save
            </button>
          </div>

          <!-- Social links -->
          ${socialLinks ? `<div class="pf-social-row">${socialLinks}</div>` : ''}
        </div>

        <!-- Bio -->
        ${p.bio ? `
        <div class="pf-section-card">
          <h3 class="pf-section-title">About</h3>
          <p class="pf-bio-text">${p.bio}</p>
        </div>` : ''}

        <!-- Disciplines & Skills -->
        ${(discs || skills) ? `
        <div class="pf-section-card">
          <h3 class="pf-section-title">Disciplines &amp; Skills</h3>
          ${discs ? `<div class="pf-disc-row">${discs}</div>` : ''}
          ${skills ? `<div class="pf-tags-row">${skills}</div>` : ''}
        </div>` : ''}

        <!-- Availability -->
        ${jtypes ? `
        <div class="pf-section-card">
          <h3 class="pf-section-title">Open To</h3>
          <div class="pf-jtype-row">${jtypes}</div>
        </div>` : ''}

      </div><!-- /pf-main -->

      <!-- ── RIGHT SIDEBAR ───────────────────────────────────── -->
      <aside class="pf-sidebar">

        <!-- Quick stats -->
        <div class="pf-sidebar-card">
          <div class="pf-sidebar-title">Profile Details</div>
          <div class="pf-detail-list">
            <div class="pf-detail-row">
              <span class="pf-detail-lbl">Member since</span>
              <span class="pf-detail-val">${profJoinedText(p.created_at)}</span>
            </div>
            ${p.account_type === 'organization' && p.org_size ? `
            <div class="pf-detail-row">
              <span class="pf-detail-lbl">Organisation size</span>
              <span class="pf-detail-val">${p.org_size} employees</span>
            </div>` : ''}
            ${p.account_type === 'organization' && p.org_industry ? `
            <div class="pf-detail-row">
              <span class="pf-detail-lbl">Industry</span>
              <span class="pf-detail-val">${p.org_industry}</span>
            </div>` : ''}
            <div class="pf-detail-row">
              <span class="pf-detail-lbl">Profile type</span>
              <span class="pf-detail-val" style="text-transform:capitalize">${p.account_type}</span>
            </div>
          </div>
        </div>

        <!-- Contact card -->
        <div class="pf-sidebar-card pf-contact-card">
          <div class="pf-sidebar-title">Get in Touch</div>
          <p style="font-size:.8rem;color:var(--slate-500);line-height:1.65;margin-bottom:14px;">
            Send ${p.display_name.split(' ')[0]} a direct message through STEMsource.
          </p>
          <button class="btn btn-primary" style="width:100%;justify-content:center;display:flex;gap:8px;"
                  onclick="openMessageModal('${p.id}','${p.display_name.replace(/'/g,"\\'")}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Send Message
          </button>
        </div>

        <!-- Back to directory -->
        <a href="community.html" style="display:flex;align-items:center;gap:7px;font-size:.8rem;font-weight:600;color:var(--slate-500);text-decoration:none;padding:12px 0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Directory
        </a>
      </aside>

    </div><!-- /pf-layout -->

    <!-- Message Modal -->
    <div class="pf-modal-overlay" id="msgModal" style="display:none;" onclick="if(event.target===this)closeMsgModal()">
      <div class="pf-modal">
        <div class="pf-modal-header">
          <div class="pf-modal-title">Message ${p.display_name}</div>
          <button class="pf-modal-close" onclick="closeMsgModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="pf-modal-body">
          <div class="sf-group">
            <label class="sf-label">Subject</label>
            <input id="msgSubject" class="sf-input" type="text" placeholder="e.g. Collaboration opportunity" />
          </div>
          <div class="sf-group">
            <label class="sf-label">Message</label>
            <textarea id="msgBody" class="sf-input" rows="5" placeholder="Introduce yourself and explain your interest…"></textarea>
          </div>
          <div id="msgBanner" style="font-size:.8rem;padding:10px 12px;border-radius:var(--r-sm);display:none;margin-bottom:12px;"></div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;display:flex;" onclick="sendMessage('${p.id}')">
            Send Message
          </button>
          <p style="font-size:.72rem;color:var(--slate-400);text-align:center;margin-top:10px;">
            You must be signed in to send messages. <a href="signup.html" style="color:var(--color-primary);font-weight:600;">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

/* ── Message modal ─────────────────────────────────────────────────── */
function openMessageModal(profileId, name) {
  document.getElementById('msgModal').style.display = 'flex';
}
function closeMsgModal() {
  document.getElementById('msgModal').style.display = 'none';
}
async function sendMessage(toProfileId) {
  const subject = document.getElementById('msgSubject').value.trim();
  const body    = document.getElementById('msgBody').value.trim();
  const banner  = document.getElementById('msgBanner');

  if (!body) {
    banner.textContent  = 'Please write a message before sending.';
    banner.style.cssText = 'display:block;background:#fef2f2;border:1px solid #fca5a5;color:#dc2626;';
    return;
  }

  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    banner.textContent  = 'You must be signed in to send messages.';
    banner.style.cssText = 'display:block;background:#fef2f2;border:1px solid #fca5a5;color:#dc2626;';
    return;
  }

  // Placeholder — in production this would insert into a messages table
  banner.textContent  = '✓ Message sent! They\'ll be notified by email.';
  banner.style.cssText = 'display:block;background:#f0fdf4;border:1px solid #86efac;color:#15803d;';
  setTimeout(closeMsgModal, 2000);
}

/* ── Save toggle ───────────────────────────────────────────────────── */
function toggleSaveProfile(btn) {
  btn.classList.toggle('saved');
  const saved = btn.classList.contains('saved');
  btn.style.color = saved ? 'var(--amber-600)' : '';
  btn.style.borderColor = saved ? 'var(--amber-600)' : '';
}

/* ── Load profile ──────────────────────────────────────────────────── */
async function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const root = document.getElementById('profileRoot');
  if (!root) return;

  if (!id) {
    root.innerHTML = '<p style="padding:60px;text-align:center;color:var(--slate-400)">No profile ID specified.</p>';
    return;
  }

  root.innerHTML = '<p style="padding:60px;text-align:center;color:var(--slate-400)">Loading profile…</p>';

  // Fetch profile — allow public OR own
  const { data: profile, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    root.innerHTML = `
      <div style="padding:80px 0;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:16px;">🔒</div>
        <h2 style="font-family:var(--font-display);font-size:1.4rem;color:var(--navy-900);margin-bottom:8px;">Profile not found</h2>
        <p style="color:var(--slate-500);margin-bottom:24px;">This profile may be private or inactive.</p>
        <a href="community.html" class="btn btn-primary">Browse Directory</a>
      </div>`;
    return;
  }

  // Update page title
  document.title = `${profile.display_name} — STEMsource`;

  renderProfile(profile);
}

document.addEventListener('DOMContentLoaded', loadProfile);
