/* =========================================================
   STEMsource — Live Site Stats
   Fetches real counts from Supabase and updates all
   hardcoded numbers on index, jobs, and community pages.
   ========================================================= */

(async function loadSiteStats() {
  if (typeof db === 'undefined') return;

  /* ── Helper: format a number nicely ─────────────────────── */
  function fmt(n) { return n.toLocaleString(); }

  function fmtCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k+';
    return n.toLocaleString();
  }

  /* ── Helper: set text if element exists ──────────────────── */
  function setText(el, text) { if (el) el.textContent = text; }

  /* ── Helper: animate a counter from current to target ──── */
  function animateCount(el, target) {
    if (!el || !target) return;
    let current = 0;
    const step  = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 22);
  }

  try {
    /* ── 1. Fetch member count (RLS returns public+active-30d) ─ */
    const { count: totalMembers } = await db
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    /* Distinct countries ──────────────────────────────────── */
    const { data: countryRows } = await db
      .from('profiles')
      .select('country')
      .not('country', 'is', null)
      .neq('country', '');
    const countryCount = new Set((countryRows || []).map(r => r.country)).size;

    /* ── 2. Fetch active jobs (lightweight fields only) ─────── */
    const { data: jobs } = await db
      .from('jobs')
      .select('id, type, discipline_category, arrangement, experience_level, organization')
      .eq('status', 'active');

    const totalJobs = (jobs || []).length;

    /* ── 3. Build count maps ─────────────────────────────────── */
    const byType  = {};
    const byDisc  = {};
    const byArr   = {};
    const byLevel = {};
    const orgs    = new Set();

    (jobs || []).forEach(j => {
      if (j.type)             byType[j.type]  = (byType[j.type]  || 0) + 1;
      if (j.arrangement)      byArr[j.arrangement]  = (byArr[j.arrangement]  || 0) + 1;
      if (j.experience_level) byLevel[j.experience_level] = (byLevel[j.experience_level] || 0) + 1;
      if (j.organization)     orgs.add(j.organization);
      (j.discipline_category || []).forEach(d => {
        byDisc[d] = (byDisc[d] || 0) + 1;
      });
    });

    const totalOrgs = orgs.size;

    /* ── 4. Update index.html ────────────────────────────────── */
    // Stats bar (data-stat attributes)
    const memberStatEl = document.querySelector('[data-stat="members"] .stat-number');
    if (memberStatEl) {
      memberStatEl.removeAttribute('data-count');
      memberStatEl.textContent = fmtCompact(totalMembers || 0);
    }

    const jobsStatEl = document.querySelector('[data-stat="jobs"] .stat-number');
    if (jobsStatEl && totalJobs > 0) {
      jobsStatEl.removeAttribute('data-count');
      jobsStatEl.textContent = fmt(totalJobs);
    }

    const empStatEl = document.querySelector('[data-stat="employers"] .stat-number');
    if (empStatEl && totalOrgs > 0) {
      empStatEl.removeAttribute('data-count');
      empStatEl.textContent = fmt(totalOrgs) + '+';
    }

    // Hero card stats
    setText(document.getElementById('hcs-professionals'), fmtCompact(totalMembers || 0));
    if (totalJobs > 0) setText(document.getElementById('hcs-open-roles'), fmt(totalJobs));

    // "View All X Jobs" button
    const viewAllBtn = document.getElementById('idx-view-all-jobs');
    if (viewAllBtn && totalJobs > 0) {
      viewAllBtn.textContent = `View All ${fmt(totalJobs)}+ Jobs →`;
    }

    // Testimonials member count header
    const testimHeader = document.getElementById('idx-testimonials-header');
    if (testimHeader && totalMembers > 0) {
      testimHeader.textContent = `Trusted by ${fmtCompact(totalMembers)} STEM professionals`;
    }

    // Discipline cards
    document.querySelectorAll('[data-disc]').forEach(el => {
      const disc  = el.dataset.disc;
      const count = byDisc[disc] || 0;
      if (count > 0) el.textContent = `${fmt(count)} open role${count !== 1 ? 's' : ''}`;
    });

    // Eyebrow "X new jobs this week"
    const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newThisWeek } = await db
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('created_at', weekAgo);
    const eyebrow = document.getElementById('idx-eyebrow-new');
    if (eyebrow && newThisWeek != null) {
      eyebrow.textContent = `Now live — ${fmt(newThisWeek)} new job${newThisWeek !== 1 ? 's' : ''} this week`;
    }

    // ── 5. Update jobs.html filter sidebar ─────────────────── */
    function setFilterCount(group, value, count) {
      const input = document.querySelector(`input[data-group="${group}"][data-value="${value}"]`);
      if (!input) return;
      const span = input.closest('label')?.querySelector('.filter-checkbox-count');
      if (span) span.textContent = count > 0 ? fmt(count) : '0';
    }

    // Position type
    setFilterCount('type', 'freelance', byType.freelance || 0);
    setFilterCount('type', 'contract',  byType.contract  || 0);
    setFilterCount('type', 'fulltime',  byType.fulltime  || 0);
    setFilterCount('type', 'parttime',  byType.parttime  || 0);

    // Discipline
    setFilterCount('discipline', 'engineering',   byDisc['engineering']   || 0);
    setFilterCount('discipline', 'life-sciences', byDisc['life-sciences'] || 0);
    setFilterCount('discipline', 'cs-ai',         byDisc['cs-ai']         || 0);
    setFilterCount('discipline', 'chemistry',     byDisc['chemistry']     || 0);
    setFilterCount('discipline', 'physics',       byDisc['physics']       || 0);
    setFilterCount('discipline', 'mathematics',   byDisc['mathematics']   || 0);
    setFilterCount('discipline', 'environmental', byDisc['environmental'] || 0);
    setFilterCount('discipline', 'medicine',      byDisc['medicine']      || 0);

    // Work arrangement
    setFilterCount('arrangement', 'remote', byArr.remote || 0);
    setFilterCount('arrangement', 'hybrid', byArr.hybrid || 0);
    setFilterCount('arrangement', 'onsite', byArr.onsite || 0);

    // Experience level
    setFilterCount('level', 'entry',     byLevel.entry     || 0);
    setFilterCount('level', 'mid',       byLevel.mid       || 0);
    setFilterCount('level', 'senior',    byLevel.senior    || 0);
    setFilterCount('level', 'principal', byLevel.principal || 0);

    // ── 6. Update community.html stats ────────────────────── */
    setText(document.getElementById('comm-stat-members'),   fmtCompact(totalMembers || 0));
    setText(document.getElementById('comm-stat-countries'), (countryCount || 0) + '+');

  } catch (err) {
    console.warn('site-stats: failed to load live stats', err);
  }

})();
