/* Jobs Board — fetches from Supabase, renders cards, hooks into filter logic */

const LOGO_COLORS = [
  'linear-gradient(135deg,#1a6b8a,#0d3f5a)',
  'linear-gradient(135deg,#1a4d2e,#0e2e1b)',
  'linear-gradient(135deg,#5a1a8a,#350f52)',
  'linear-gradient(135deg,#0f4c7a,#062f52)',
  'linear-gradient(135deg,#7a3a0f,#4a2208)',
  'linear-gradient(135deg,#1a3a6b,#0d2244)',
  'linear-gradient(135deg,#0d4a5a,#062e38)',
  'linear-gradient(135deg,#6b1a3a,#3f0d22)',
  'linear-gradient(135deg,#2d6a2d,#1a3f1a)',
  'linear-gradient(135deg,#5a4a0f,#382d08)',
];

function logoColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

function postedText(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted 1 day ago';
  if (days < 7)  return `Posted ${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? 'Posted 1 week ago' : `Posted ${weeks} weeks ago`;
}

function rateText(job) {
  if (!job.rate_max) return '';
  if (job.comp_type === 'annual') {
    const lo = job.rate_min ? `$${Math.round(job.rate_min / 1000)}k` : '';
    return `${lo}–$${Math.round(job.rate_max / 1000)}k<span>/yr</span>`;
  }
  if (job.comp_type === 'project') {
    return `$${job.rate_max.toLocaleString()}<span> total</span>`;
  }
  const lo = job.rate_min ? `$${job.rate_min}–` : '';
  return `${lo}$${job.rate_max}<span>/hr</span>`;
}

const TYPE_BADGE = {
  freelance: '<span class="badge badge-freelance">Freelance</span>',
  contract:  '<span class="badge badge-contract">Contract</span>',
  fulltime:  '<span class="badge badge-fulltime">Full-Time</span>',
  parttime:  '<span class="badge badge-parttime">Part-Time</span>',
};
const ARR_BADGE = {
  remote: '<span class="badge badge-remote">Remote</span>',
  hybrid: '<span class="badge badge-hybrid">Hybrid</span>',
  onsite: '<span class="badge badge-onsite">On-Site</span>',
};
const LEVEL_LABEL = { entry: 'Entry Level', mid: 'Mid-Level', senior: 'Senior', principal: 'Principal / Lead' };

function renderCard(job) {
  const days   = Math.floor((Date.now() - new Date(job.created_at)) / 86400000);
  const cats   = (job.discipline_category || []).join(' ');
  const abbr   = job.organization.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const skills = (job.skills || []).map(s => `<span class="tag">${s}</span>`).join('');
  const level  = LEVEL_LABEL[job.experience_level] || '';
  const clr    = job.security_clearance && job.security_clearance !== 'None required'
    ? `<span class="badge" style="background:#fef9c3;color:#a16207;border:1px solid #fde047">Clearance</span>` : '';

  return `
    <div class="jc${job.featured ? ' featured' : ''}"
         style="cursor:pointer"
         onclick="if(event.target.tagName!=='BUTTON'&&!event.target.closest('.save-btn'))window.location='job.html?id=${job.id}'"
         data-id="${job.id}"
         data-type="${job.type}"
         data-discipline="${cats}"
         data-arrangement="${job.arrangement}"
         data-level="${job.experience_level || ''}"
         data-rate="${job.rate_max || 9999}"
         data-posted="${days}">
      <div class="jc-logo" style="background:${logoColor(job.organization)}">${abbr}</div>
      <div class="jc-body">
        <div class="jc-header">
          <div>
            <div class="jc-badges">
              ${job.featured ? '<span class="badge badge-featured">⭐ Featured</span>' : ''}
              ${TYPE_BADGE[job.type] || ''}
              ${ARR_BADGE[job.arrangement] || ''}
              ${clr}
            </div>
            <div class="jc-title"><a href="job.html?id=${job.id}">${job.title}</a></div>
            <div class="jc-company">${job.organization}${job.location ? ' &mdash; ' + job.location : ''}</div>
          </div>
          <div class="jc-rate">${rateText(job)}</div>
        </div>
        <div class="jc-footer">
          <div class="jc-meta">
            ${job.duration ? `<span>${job.duration}</span>` : ''}
            ${level ? `<span>${level}</span>` : ''}
            <span>${postedText(job.created_at)}</span>
          </div>
          <div class="jc-tags">${skills}</div>
          <div class="jc-actions">
            <button class="save-btn" title="Save job">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
            <a class="btn btn-primary btn-sm" href="job.html?id=${job.id}">View & Apply</a>
          </div>
        </div>
      </div>
    </div>`;
}

async function loadJobs() {
  const list = document.querySelector('.jobs-list');
  if (!list) return;

  list.innerHTML = '<p style="padding:24px;color:var(--slate-400);text-align:center">Loading positions…</p>';

  const { data: jobs, error } = await db
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    list.innerHTML = '<p style="padding:24px;color:var(--red,#ef4444);text-align:center">Could not load jobs. Please refresh.</p>';
    console.error(error);
    return;
  }

  list.innerHTML = jobs.length ? jobs.map(renderCard).join('') : '<p style="padding:24px;color:var(--slate-400);text-align:center">No positions match your filters.</p>';

  // Update total count
  const countEl = document.querySelector('.jobs-count strong');
  if (countEl) countEl.textContent = jobs.length.toLocaleString();

  // Re-attach save-btn listeners (main.js handler runs before cards exist)
  list.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('saved');
      this.style.color = this.classList.contains('saved') ? 'var(--amber,#f59e0b)' : '';
    });
  });

  // Trigger existing filter logic so current checkbox state is applied
  if (typeof applyFilters === 'function') applyFilters();
}

document.addEventListener('DOMContentLoaded', loadJobs);
