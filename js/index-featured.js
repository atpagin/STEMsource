/* Index page — loads featured jobs from Supabase into hero preview and featured grid */

const IDX_LOGO_COLORS = [
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

function idxLogoColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return IDX_LOGO_COLORS[h % IDX_LOGO_COLORS.length];
}

function idxAbbr(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
}

function idxPostedText(createdAt) {
  const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7)  return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

function idxRateText(job) {
  if (!job.rate_max) return null;
  if (job.comp_type === 'annual') {
    const lo = job.rate_min ? `$${Math.round(job.rate_min / 1000)}k–` : '';
    return `${lo}$${Math.round(job.rate_max / 1000)}k / yr`;
  }
  if (job.comp_type === 'project') {
    return `$${Number(job.rate_max).toLocaleString()} total`;
  }
  const lo = job.rate_min ? `$${job.rate_min}–` : '';
  return `${lo}$${job.rate_max}/hr`;
}

const IDX_TYPE_BADGE = {
  freelance: '<span class="badge badge-freelance">Freelance</span>',
  contract:  '<span class="badge badge-contract">Contract</span>',
  fulltime:  '<span class="badge badge-fulltime">Full-Time</span>',
  parttime:  '<span class="badge badge-parttime">Part-Time</span>',
};
const IDX_ARR_BADGE = {
  remote: '<span class="badge badge-remote">Remote</span>',
  hybrid: '<span class="badge badge-hybrid">Hybrid</span>',
  onsite: '<span class="badge badge-onsite">On-Site</span>',
};

function renderHeroMiniJob(job, isFirst) {
  const abbr  = idxAbbr(job.organization);
  const color = idxLogoColor(job.organization);
  const rate  = idxRateText(job);
  const typeBadge = IDX_TYPE_BADGE[job.type] || '';
  return `
    <a class="hero-mini-job${isFirst ? ' active' : ''}" href="job?id=${job.id}" style="text-decoration:none;color:inherit;display:block;">
      <div class="hmj-row">
        <div class="hmj-logo" style="background:${color}">${abbr}</div>
        <div>
          <div class="hmj-title">${job.title}</div>
          <div class="hmj-company">${job.organization}${job.location ? ' · ' + job.location : ''}</div>
        </div>
      </div>
      <div class="hmj-footer">
        ${rate ? `<span class="hmj-rate">${rate}</span>` : ''}
        ${typeBadge}
      </div>
    </a>`;
}

function renderFeaturedCard(job) {
  const abbr   = idxAbbr(job.organization);
  const color  = idxLogoColor(job.organization);
  const rate   = idxRateText(job);
  const skills = (job.skills || []).slice(0, 4).map(s => `<span class="tag">${s}</span>`).join('');
  const level  = job.experience_level
    ? `<span class="jc-meta-item">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
        ${{ entry:'Entry Level', mid:'Mid-Level', senior:'Senior', principal:'Principal / Lead' }[job.experience_level] || ''}
      </span>` : '';

  return `
    <div class="job-card job-card-featured" style="cursor:pointer"
         onclick="window.location='job?id=${job.id}'">
      <div class="jc-top">
        <div class="co-logo" style="background:${color}">${abbr}</div>
        <div class="jc-badges">
          <span class="badge badge-featured">⭐ Featured</span>
          ${IDX_TYPE_BADGE[job.type] || ''}
          ${IDX_ARR_BADGE[job.arrangement] || ''}
        </div>
        <button class="save-btn" aria-label="Save job" onclick="event.stopPropagation();this.classList.toggle('saved');this.style.color=this.classList.contains('saved')?'var(--amber)':''">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </button>
      </div>
      <div>
        <div class="jc-title"><a href="job?id=${job.id}" onclick="event.stopPropagation()">${job.title}</a></div>
        <div class="jc-company">${job.organization}${job.location ? ' — ' + job.location : ''}</div>
      </div>
      <div class="jc-meta">
        <span class="jc-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${{ remote:'Remote', hybrid:'Hybrid', onsite:'On-Site' }[job.arrangement] || ''}${job.location ? ' — ' + job.location : ''}
        </span>
        ${level}
        ${job.duration ? `<span class="jc-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${job.duration}</span>` : ''}
      </div>
      ${skills ? `<div class="jc-tags">${skills}</div>` : ''}
      <div class="jc-footer">
        ${rate ? `<div class="jc-salary">${rate}</div>` : '<div></div>'}
        <span class="jc-posted">${idxPostedText(job.created_at)}</span>
      </div>
    </div>`;
}

async function loadIndexFeatured() {
  const { data: jobs, error } = await db
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error || !jobs || jobs.length === 0) return;

  // Hero card mini jobs — first 3 featured
  const heroBody = document.getElementById('hero-featured-jobs');
  if (heroBody) {
    heroBody.innerHTML = jobs.slice(0, 3).map((j, i) => renderHeroMiniJob(j, i === 0)).join('');
  }

  // Main featured grid — all featured jobs (up to 6)
  const grid = document.getElementById('featured-jobs-grid');
  if (grid) {
    grid.innerHTML = jobs.slice(0, 6).map(renderFeaturedCard).join('');
  }
}

document.addEventListener('DOMContentLoaded', loadIndexFeatured);
