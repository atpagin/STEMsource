/* community.js — Member directory: fetch active public profiles, render cards */

const COMM_LOGO_COLORS = [
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

function commAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return COMM_LOGO_COLORS[h % COMM_LOGO_COLORS.length];
}

function commInitials(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').split(' ')
    .filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function commJoinedText(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
  if (days === 0) return 'Joined today';
  if (days < 7)  return `Joined ${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Joined ${weeks}w ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `Joined ${months}mo ago` : `Joined ${Math.floor(months/12)}y ago`;
}

function commActiveText(lastActive) {
  const days = Math.floor((Date.now() - new Date(lastActive)) / 86400000);
  if (days === 0) return 'Active today';
  if (days === 1) return 'Active yesterday';
  if (days < 7)  return `Active ${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `Active ${weeks}w ago`;
}

const ROLE_BADGE = {
  seeker:  '<span class="cm-role-badge cm-role-seeker">Looking for Work</span>',
  poster:  '<span class="cm-role-badge cm-role-poster">Hiring</span>',
  both:    '<span class="cm-role-badge cm-role-both">Open to Both</span>',
};

const ACC_BADGE = {
  individual:   '',
  organization: '<span class="cm-org-badge">🏢 Organisation</span>',
};

function renderMemberCard(p) {
  const initials = commInitials(p.display_name);
  const color    = p.avatar_color || commAvatarColor(p.display_name);
  const avatar   = p.avatar_url
    ? `<img src="${p.avatar_url}" alt="${initials}" class="cm-avatar-img" loading="lazy" />`
    : `<div class="cm-avatar-initials" style="background:${color}">${initials}</div>`;

  const skills = (p.skills || []).slice(0, 4)
    .map(s => `<span class="tag">${s}</span>`).join('');

  const links = [
    p.linkedin_url ? `<a href="${p.linkedin_url}" target="_blank" rel="noopener" class="cm-social-link" title="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : '',
    p.academic_url ? `<a href="${p.academic_url}" target="_blank" rel="noopener" class="cm-social-link" title="Academic Profile"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></a>` : '',
    p.website_url  ? `<a href="${p.website_url}" target="_blank" rel="noopener" class="cm-social-link" title="Website"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></a>` : '',
  ].filter(Boolean).join('');

  return `
    <article class="cm-card" onclick="window.location='profile?id=${p.id}'" style="cursor:pointer"
             data-name="${p.display_name.toLowerCase()}"
             data-discipline="${(p.discipline_prefs||[]).join(' ').toLowerCase()}"
             data-role="${p.role}"
             data-type="${p.account_type}"
             data-country="${(p.country||'').toLowerCase()}">
      <div class="cm-card-top">
        <div class="cm-avatar-wrap">
          ${avatar}
          <span class="cm-active-dot" title="${commActiveText(p.last_active_at)}"></span>
        </div>
        <div class="cm-card-meta">
          ${ROLE_BADGE[p.role] || ''}
          ${ACC_BADGE[p.account_type] || ''}
        </div>
      </div>

      <div class="cm-card-body">
        <div class="cm-name"><a href="profile?id=${p.id}" onclick="event.stopPropagation()">${p.display_name}</a></div>
        ${p.title ? `<div class="cm-title">${p.title}</div>` : ''}
        ${p.country ? `<div class="cm-location"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${p.country}</div>` : ''}
        ${p.bio ? `<p class="cm-bio">${p.bio.slice(0, 120)}${p.bio.length > 120 ? '…' : ''}</p>` : ''}
      </div>

      ${skills ? `<div class="cm-tags">${skills}</div>` : ''}

      <div class="cm-card-footer">
        <span class="cm-joined">${commJoinedText(p.created_at)}</span>
        <div class="cm-actions">
          ${links}
          <a href="profile?id=${p.id}" class="btn btn-sm btn-primary" onclick="event.stopPropagation()" style="font-size:.75rem;padding:6px 12px;">
            View Profile
          </a>
        </div>
      </div>
    </article>`;
}

/* ── Load & render ─────────────────────────────────────────────────── */
let allProfiles = [];

async function loadCommunity() {
  const grid = document.getElementById('membersGrid');
  if (!grid) return;

  grid.innerHTML = '<p style="padding:32px;color:var(--slate-400);text-align:center;grid-column:1/-1;">Loading members…</p>';

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles, error } = await db
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .gte('last_active_at', thirtyDaysAgo)
    .order('last_active_at', { ascending: false });

  if (error || !profiles) {
    grid.innerHTML = '<p style="padding:32px;color:#ef4444;text-align:center;grid-column:1/-1;">Could not load members. Please refresh.</p>';
    console.error(error);
    return;
  }

  allProfiles = profiles;

  // Update count
  const countEl = document.querySelector('.comm-count strong');
  if (countEl) countEl.textContent = profiles.length.toLocaleString();

  renderFiltered();
}

function renderFiltered() {
  const grid    = document.getElementById('membersGrid');
  const search  = (document.getElementById('commSearch')?.value || '').toLowerCase();
  const roleF   = document.getElementById('filterRole')?.value   || '';
  const typeF   = document.getElementById('filterType')?.value   || '';
  const discF   = document.getElementById('filterDisc')?.value   || '';
  const countryF= document.getElementById('filterCountry')?.value|| '';

  const filtered = allProfiles.filter(p => {
    if (search && !p.display_name.toLowerCase().includes(search)
               && !(p.title||'').toLowerCase().includes(search)
               && !(p.bio||'').toLowerCase().includes(search)
               && !(p.skills||[]).join(' ').toLowerCase().includes(search)) return false;
    if (roleF    && p.role         !== roleF)   return false;
    if (typeF    && p.account_type !== typeF)   return false;
    if (discF    && !(p.discipline_prefs||[]).includes(discF)) return false;
    if (countryF && (p.country||'').toLowerCase() !== countryF.toLowerCase()) return false;
    return true;
  });

  const countEl = document.querySelector('.comm-count strong');
  if (countEl) countEl.textContent = filtered.length.toLocaleString();

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="padding:48px;color:var(--slate-400);text-align:center;grid-column:1/-1;">No members match your filters.</p>';
    return;
  }

  grid.innerHTML = filtered.map(renderMemberCard).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadCommunity();
  // Attach filter listeners after a tick so elements exist
  setTimeout(() => {
    document.getElementById('commSearch')?.addEventListener('input', renderFiltered);
    document.getElementById('filterRole')?.addEventListener('change', renderFiltered);
    document.getElementById('filterType')?.addEventListener('change', renderFiltered);
    document.getElementById('filterDisc')?.addEventListener('change', renderFiltered);
    document.getElementById('filterCountry')?.addEventListener('change', renderFiltered);
  }, 0);
});
