/* Job Detail Page — fetches single job + similar positions from Supabase */

const LOGO_COLORS_JD = [
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

function jdLogoColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return LOGO_COLORS_JD[h % LOGO_COLORS_JD.length];
}

function jdAbbr(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
}

function jdPostedText(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted 1 day ago';
  if (days < 7)  return `Posted ${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? 'Posted 1 week ago' : `Posted ${weeks} weeks ago`;
}

function jdRateText(job) {
  if (!job.rate_max) return null;
  if (job.comp_type === 'annual') {
    const lo = job.rate_min ? `$${Math.round(job.rate_min / 1000)}k – ` : '';
    return `${lo}$${Math.round(job.rate_max / 1000)}k<span>/yr</span>`;
  }
  if (job.comp_type === 'project') {
    return `$${Number(job.rate_max).toLocaleString()}<span> total</span>`;
  }
  const lo = job.rate_min ? `$${job.rate_min}–` : '';
  return `${lo}$${job.rate_max}<span>/hr</span>`;
}

const JD_TYPE_BADGE = {
  freelance: '<span class="badge badge-freelance">Freelance</span>',
  contract:  '<span class="badge badge-contract">Contract</span>',
  fulltime:  '<span class="badge badge-fulltime">Full-Time</span>',
  parttime:  '<span class="badge badge-parttime">Part-Time</span>',
};
const JD_ARR_BADGE = {
  remote: '<span class="badge badge-remote">Remote</span>',
  hybrid: '<span class="badge badge-hybrid">Hybrid</span>',
  onsite: '<span class="badge badge-onsite">On-Site</span>',
};
const JD_LEVEL_LABEL = { entry: 'Entry Level', mid: 'Mid-Level', senior: 'Senior', principal: 'Principal / Lead' };
const JD_TYPE_LABEL  = { freelance: 'Freelance', contract: 'Contract', fulltime: 'Full-Time', parttime: 'Part-Time' };
const JD_ARR_LABEL   = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-Site' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderApplyContact(job) {
  const rows = [];

  if (job.company_website) {
    const url = job.company_website.startsWith('http') ? job.company_website : 'https://' + job.company_website;
    rows.push(`
      <div class="jd-contact-row">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <a href="${url}" target="_blank" rel="noopener">${job.company_website.replace(/^https?:\/\//, '')}</a>
      </div>`);
  }

  if (job.apply_contact) {
    if (job.apply_method === 'email') {
      rows.push(`
        <div class="jd-contact-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <a href="mailto:${job.apply_contact}">${job.apply_contact}</a>
        </div>`);
    } else {
      const applyUrl = job.apply_contact.startsWith('http') ? job.apply_contact : 'https://' + job.apply_contact;
      rows.push(`
        <div class="jd-contact-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <a href="${applyUrl}" target="_blank" rel="noopener">Application portal</a>
        </div>`);
    }
  }

  return rows.join('');
}

function renderApplyBtn(job) {
  if (job.apply_method === 'email' && job.apply_contact) {
    return `<a href="mailto:${job.apply_contact}" class="btn btn-primary jd-apply-btn">Apply via Email</a>`;
  }
  if (job.apply_contact) {
    const url = job.apply_contact.startsWith('http') ? job.apply_contact : 'https://' + job.apply_contact;
    return `<a href="${url}" target="_blank" rel="noopener" class="btn btn-primary jd-apply-btn">Apply Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>`;
  }
  return `<button class="btn btn-primary jd-apply-btn" onclick="alert('Application instructions are included in the job description.')">Apply Now</button>`;
}

function renderSimilarCard(job) {
  const abbr = jdAbbr(job.organization);
  const rate = jdRateText(job);
  return `
    <a class="sim-card" href="job.html?id=${job.id}">
      <div class="sim-logo" style="background:${jdLogoColor(job.organization)}">${abbr}</div>
      <div class="sim-body">
        <div class="sim-job-title">${job.title}</div>
        <div class="sim-org">${job.organization}${job.location ? ' · ' + job.location : ''}</div>
        <div class="sim-meta">
          ${JD_TYPE_BADGE[job.type] || ''}
          ${JD_ARR_BADGE[job.arrangement] || ''}
          ${rate ? `<span class="badge" style="background:var(--slate-100);color:var(--color-text-2);font-weight:600">${rate.replace(/<[^>]+>/g, '')}</span>` : ''}
        </div>
      </div>
    </a>`;
}

function renderJobDetail(job, similar) {
  const abbr      = jdAbbr(job.organization);
  const color     = jdLogoColor(job.organization);
  const rate      = jdRateText(job);
  const level     = JD_LEVEL_LABEL[job.experience_level] || null;
  const clrBadge  = job.security_clearance && job.security_clearance !== 'None required'
    ? `<span class="badge" style="background:#fef9c3;color:#a16207;border:1px solid #fde047">Clearance Required</span>` : '';
  const skills    = (job.skills || []).map(s => `<span class="tag">${s}</span>`).join('');
  const typeLabel = JD_TYPE_LABEL[job.type] || job.type;
  const arrLabel  = JD_ARR_LABEL[job.arrangement] || job.arrangement;

  const similarHtml = similar.length
    ? similar.map(renderSimilarCard).join('')
    : '<p style="font-size:.85rem;color:var(--color-text-muted);text-align:center;padding:12px 0">No similar positions right now.</p>';

  return `
    <div class="jd-layout">

      <!-- ── Main column ── -->
      <div class="jd-main">

        <!-- Header card -->
        <div class="jd-header">
          <div class="jd-header-top">
            <div class="jd-logo" style="background:${color}">${abbr}</div>
            <div class="jd-header-info">
              <div class="jd-badges">
                ${job.featured ? '<span class="badge badge-featured">⭐ Featured</span>' : ''}
                ${JD_TYPE_BADGE[job.type] || ''}
                ${JD_ARR_BADGE[job.arrangement] || ''}
                ${clrBadge}
              </div>
              <div class="jd-title">${job.title}</div>
              <div class="jd-org">
                ${job.company_website
                  ? `<a href="${job.company_website.startsWith('http') ? job.company_website : 'https://' + job.company_website}" target="_blank" rel="noopener">${job.organization}</a>`
                  : job.organization}
                ${job.location ? `<span style="color:var(--color-text-muted)"> &mdash; ${job.location}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="jd-header-meta">
            ${rate ? `<div class="jd-meta-item"><div class="jd-meta-label">Compensation</div><div class="jd-rate-big">${rate}</div></div>` : ''}
            ${typeLabel ? `<div class="jd-meta-item"><div class="jd-meta-label">Type</div><div class="jd-meta-value">${typeLabel}</div></div>` : ''}
            ${arrLabel ? `<div class="jd-meta-item"><div class="jd-meta-label">Work Style</div><div class="jd-meta-value">${arrLabel}</div></div>` : ''}
            ${level ? `<div class="jd-meta-item"><div class="jd-meta-label">Experience</div><div class="jd-meta-value">${level}</div></div>` : ''}
            ${job.duration ? `<div class="jd-meta-item"><div class="jd-meta-label">Duration</div><div class="jd-meta-value">${job.duration}</div></div>` : ''}
            <div class="jd-meta-item"><div class="jd-meta-label">Posted</div><div class="jd-meta-value">${jdPostedText(job.created_at)}</div></div>
          </div>

          <div class="jd-actions">
            <a id="jd-apply-btn-top" href="#apply-section" class="btn btn-primary"
               onclick="document.getElementById('apply-section').scrollIntoView({behavior:'smooth'});return false;">
              Apply Now
            </a>
            <button class="btn btn-outline save-btn" title="Save job">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              Save
            </button>
            <a class="btn btn-outline" href="jobs.html" style="margin-left:auto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Jobs
            </a>
          </div>
        </div>

        <!-- Description -->
        ${job.description ? `
        <div class="jd-section">
          <div class="jd-section-title">About the Role</div>
          <div class="jd-desc">${job.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}

        <!-- Requirements -->
        ${(job.requirements_must || job.requirements_nice) ? `
        <div class="jd-section">
          <div class="jd-section-title">Requirements</div>
          ${job.requirements_must ? `
          <div class="jd-req-block">
            <div class="jd-req-label">Must-Have</div>
            <div class="jd-req-text">${job.requirements_must.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>` : ''}
          ${job.requirements_nice ? `
          <div class="jd-req-block">
            <div class="jd-req-label">Nice to Have</div>
            <div class="jd-req-text">${job.requirements_nice.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>` : ''}
        </div>` : ''}

        <!-- Skills & Details -->
        <div class="jd-section">
          <div class="jd-section-title">Position Details</div>
          <div class="jd-details-grid" style="margin-bottom:${skills ? '20px' : '0'}">
            ${job.education_requirement ? `<div class="jd-detail-item"><div class="jd-detail-label">Education</div><div class="jd-detail-value">${job.education_requirement}</div></div>` : ''}
            ${job.security_clearance ? `<div class="jd-detail-item"><div class="jd-detail-label">Security Clearance</div><div class="jd-detail-value">${job.security_clearance}</div></div>` : ''}
            ${job.start_date ? `<div class="jd-detail-item"><div class="jd-detail-label">Start Date</div><div class="jd-detail-value">${formatDate(job.start_date)}</div></div>` : ''}
            ${job.deadline ? `<div class="jd-detail-item"><div class="jd-detail-label">Application Deadline</div><div class="jd-detail-value">${formatDate(job.deadline)}</div></div>` : ''}
            ${job.discipline ? `<div class="jd-detail-item"><div class="jd-detail-label">Discipline</div><div class="jd-detail-value">${job.discipline}</div></div>` : ''}
          </div>
          ${skills ? `<div class="jd-section-title" style="margin-top:4px">Skills & Technologies</div><div class="jd-skills">${skills}</div>` : ''}
        </div>

        <!-- Apply / Contact -->
        <div class="jd-apply-card" id="apply-section">
          <div class="jd-apply-title">How to Apply</div>
          <div class="jd-apply-sub">
            ${job.deadline ? `Applications close ${formatDate(job.deadline)}. ` : ''}
            This position is posted by <strong>${job.organization}</strong>.
          </div>
          ${renderApplyContact(job) ? `<div class="jd-apply-contact">${renderApplyContact(job)}</div>` : ''}
          ${renderApplyBtn(job)}
        </div>

      </div><!-- /jd-main -->

      <!-- ── Sidebar ── -->
      <aside class="jd-sidebar">
        <div class="jd-similar-card">
          <div class="jd-similar-title">Similar Positions</div>
          ${similarHtml}
          <a href="jobs.html" class="btn btn-outline btn-sm" style="width:100%;justify-content:center;margin-top:14px">
            Browse All Jobs
          </a>
        </div>
      </aside>

    </div>`;
}

async function loadJobDetail() {
  const root = document.getElementById('jd-root');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    root.innerHTML = '<p style="text-align:center;padding:80px 20px;color:var(--color-text-muted)">No job ID specified. <a href="jobs.html">Browse all jobs →</a></p>';
    return;
  }

  // Fetch the main job
  const { data: job, error } = await db
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !job) {
    root.innerHTML = '<p style="text-align:center;padding:80px 20px;color:var(--color-text-muted)">This position could not be found. <a href="jobs.html">Browse all jobs →</a></p>';
    return;
  }

  // Update page title and breadcrumb
  document.title = `${job.title} at ${job.organization} — STEMsource`;
  const bc = document.getElementById('jd-breadcrumb-title');
  if (bc) bc.textContent = job.title;

  // Fetch similar jobs: same discipline_category overlap OR same type, excluding this job
  const cats = job.discipline_category || [];
  let similarQuery = db
    .from('jobs')
    .select('id,title,organization,location,type,arrangement,rate_min,rate_max,comp_type,created_at,featured,discipline_category')
    .eq('status', 'active')
    .neq('id', id)
    .limit(5);

  // Filter by type match as a fallback — we'll post-filter by discipline overlap in JS
  const { data: candidates } = await similarQuery
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  // Score and rank: prefer discipline overlap, then same type
  const similar = (candidates || [])
    .map(j => {
      const jCats = j.discipline_category || [];
      const overlap = cats.filter(c => jCats.includes(c)).length;
      const sameType = j.type === job.type ? 1 : 0;
      return { ...j, _score: overlap * 3 + sameType };
    })
    .filter(j => j._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5);

  // If fewer than 3 similar by score, fill with recent jobs
  let finalSimilar = similar;
  if (similar.length < 3) {
    const recent = (candidates || [])
      .filter(j => !similar.some(s => s.id === j.id))
      .slice(0, 5 - similar.length);
    finalSimilar = [...similar, ...recent];
  }

  root.className = '';
  root.innerHTML = renderJobDetail(job, finalSimilar);

  // Save button toggle
  root.querySelector('.save-btn')?.addEventListener('click', function() {
    this.classList.toggle('saved');
    this.style.color = this.classList.contains('saved') ? 'var(--amber,#f59e0b)' : '';
    this.querySelector('svg').setAttribute('fill', this.classList.contains('saved') ? 'currentColor' : 'none');
  });
}

document.addEventListener('DOMContentLoaded', loadJobDetail);
