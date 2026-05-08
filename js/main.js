/* =========================================================
   STEMsource — Main JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile Navigation ──────────────────────────────────── */
  const toggle  = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn  = document.querySelector('.mobile-nav-close');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => mobileNav.classList.add('open'));
    closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));
    mobileNav.addEventListener('click', e => {
      if (e.target === mobileNav) mobileNav.classList.remove('open');
    });
  }

  /* ── Horizontal Scroll Carousels ────────────────────────── */
  document.querySelectorAll('[data-scroll-id]').forEach(section => {
    const id       = section.dataset.scrollId;
    const track    = document.getElementById(id);
    const prevBtn  = section.querySelector('.scroll-prev');
    const nextBtn  = section.querySelector('.scroll-next');
    if (!track) return;

    const scrollBy = 320;

    const updateArrows = () => {
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 0;
      if (nextBtn) nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };

    prevBtn?.addEventListener('click', () => {
      track.scrollBy({ left: -scrollBy, behavior: 'smooth' });
    });
    nextBtn?.addEventListener('click', () => {
      track.scrollBy({ left: scrollBy, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
  });

  /* ── Stats Counter Animation ────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let current  = 0;
        const step   = Math.ceil(target / 60);
        const timer  = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (current >= target) clearInterval(timer);
        }, 22);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  }

  /* ── Save / Bookmark Job ────────────────────────────────── */
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      btn.classList.toggle('saved');
      const icon = btn.querySelector('svg');
      if (btn.classList.contains('saved')) {
        btn.style.color = 'var(--amber)';
        btn.title = 'Saved';
      } else {
        btn.style.color = '';
        btn.title = 'Save job';
      }
    });
  });

  /* ── Filter Sidebar Collapse Toggle ─────────────────────── */
  const filterSidebar = document.querySelector('.filter-sidebar');
  const jobsLayout = document.querySelector('.jobs-layout');
  document.querySelectorAll('.filter-sidebar-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      if (filterSidebar) filterSidebar.classList.toggle('collapsed');
      if (jobsLayout) jobsLayout.classList.toggle('sidebar-collapsed');
    });
  });

  /* ── Filter Sidebar Toggle (mobile) ─────────────────────── */
  const filterToggle = document.querySelector('.filter-toggle');
  if (filterToggle && filterSidebar) {
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.toggle('open');
    });
  }

  /* ── Job Filtering ───────────────────────────────────────── */
  const FILTER_LABELS = {
    type:        { freelance: 'Freelance', contract: 'Contract', fulltime: 'Full-Time', parttime: 'Part-Time' },
    discipline:  { engineering: 'Engineering', 'life-sciences': 'Life Sciences', 'cs-ai': 'CS & AI', chemistry: 'Chemistry', physics: 'Physics', mathematics: 'Mathematics', environmental: 'Environmental', medicine: 'Medicine' },
    arrangement: { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-Site' },
    level:       { entry: 'Entry Level', mid: 'Mid-Level', senior: 'Senior', principal: 'Principal / Lead' },
  };

  function getActiveFilters() {
    const groups = {};
    document.querySelectorAll('.filter-body input[type="checkbox"][data-group]:checked').forEach(input => {
      (groups[input.dataset.group] = groups[input.dataset.group] || []).push(input.dataset.value);
    });
    const rateSlider = document.getElementById('rate-slider');
    const maxRate = rateSlider ? parseInt(rateSlider.value) : 250;
    const dateRadio = document.querySelector('.filter-body input[type="radio"][data-group="date"]:checked');
    const maxDays = dateRadio ? parseInt(dateRadio.dataset.maxDays) : 9999;
    return { groups, maxRate, maxDays };
  }

  function applyFilters() {
    const { groups, maxRate, maxDays } = getActiveFilters();
    let visible = 0;

    document.querySelectorAll('.jobs-list .jc').forEach(card => {
      let show = true;

      for (const [group, values] of Object.entries(groups)) {
        if (!values.length) continue;
        const cardVals = (card.dataset[group] || '').split(' ');
        if (!values.some(v => cardVals.includes(v))) { show = false; break; }
      }

      if (show && parseInt(card.dataset.rate || 9999) > maxRate) show = false;
      if (show && maxDays < 9999 && parseInt(card.dataset.posted || 9999) > maxDays) show = false;

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Update count
    const countEl = document.querySelector('.jobs-count strong');
    if (countEl) countEl.textContent = visible.toLocaleString();

    // Rebuild active filter pills
    const pillContainer = document.querySelector('.active-filters');
    if (pillContainer) {
      pillContainer.innerHTML = '';
      for (const [group, values] of Object.entries(groups)) {
        values.forEach(val => {
          const label = FILTER_LABELS[group]?.[val] || val;
          const pill = document.createElement('span');
          pill.className = 'active-filter';
          pill.textContent = label + ' ×';
          pill.addEventListener('click', () => {
            const input = document.querySelector(`.filter-body input[data-group="${group}"][data-value="${val}"]`);
            if (input) { input.checked = false; applyFilters(); }
          });
          pillContainer.appendChild(pill);
        });
      }
    }
  }

  // Apply on checkbox / radio change
  document.querySelectorAll('.filter-body input[type="checkbox"], .filter-body input[type="radio"]').forEach(input => {
    input.addEventListener('change', applyFilters);
  });

  // Apply button
  const applyBtn = document.getElementById('apply-filters');
  if (applyBtn) applyBtn.addEventListener('click', applyFilters);

  // Salary slider — update label live, filter on release
  const rateSlider = document.getElementById('rate-slider');
  const rateLabel  = document.getElementById('rate-label');
  if (rateSlider && rateLabel) {
    rateSlider.addEventListener('input', () => {
      const v = rateSlider.value;
      rateLabel.textContent = v >= 250 ? 'Any rate' : `Up to $${v}/hr`;
    });
    rateSlider.addEventListener('change', applyFilters);
  }

  // Clear all
  document.querySelector('.filter-clear')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-body input[type="checkbox"]').forEach(i => i.checked = false);
    const firstRadio = document.querySelector('.filter-body input[type="radio"]');
    if (firstRadio) firstRadio.checked = true;
    if (rateSlider) { rateSlider.value = 250; if (rateLabel) rateLabel.textContent = 'Any rate'; }
    applyFilters();
  });

  // Run on page load so initial state reflects current checkboxes
  applyFilters();

  /* ── Category Tabs ──────────────────────────────────────── */
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tab.closest('.category-tabs').querySelectorAll('.category-tab')
        .forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  /* ── Auth Tabs (Signup page) ─────────────────────────────── */
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabs = tab.closest('.auth-tabs');
      tabs.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.hidden = panel.id !== target;
      });
    });
  });

  /* ── Hero Search ─────────────────────────────────────────── */
  const heroForm = document.querySelector('.hero-search-form');
  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      const q  = heroForm.querySelector('input[name="q"]')?.value.trim();
      const cat = heroForm.querySelector('select[name="category"]')?.value;
      const params = new URLSearchParams();
      if (q)   params.set('q', q);
      if (cat && cat !== 'all') params.set('discipline', cat);
      window.location.href = `jobs.html?${params.toString()}`;
    });
  }

  /* ── Smooth reveal on scroll ─────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ── Navbar scroll shadow ────────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ── Post Job form next/prev steps ──────────────────────── */
  const stepForm = document.querySelector('.step-form');
  if (stepForm) {
    let currentStep = 0;
    const steps = stepForm.querySelectorAll('.form-step');
    const indicators = document.querySelectorAll('.step');

    const showStep = (idx) => {
      steps.forEach((s, i) => { s.hidden = i !== idx; });
      indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === idx);
        ind.classList.toggle('done', i < idx);
      });
      currentStep = idx;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    stepForm.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => showStep(currentStep + 1));
    });
    stepForm.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => showStep(currentStep - 1));
    });

    showStep(0);
  }

});
