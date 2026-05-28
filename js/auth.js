/* ── auth.js — Supabase Auth helpers for STEMsource ────────────────────── */

const AVATAR_COLORS = [
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

function authAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function authInitials(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').split(' ')
    .filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ── Sign Up ─────────────────────────────────────────────────────────────── */
async function signUp(formData) {
  const { email, password, display_name, account_type, title, country, currency,
          role, job_type_prefs, discipline_prefs, skills,
          website_url, linkedin_url, facebook_url, academic_url,
          org_size, org_industry, bio } = formData;

  // 1. Create auth user
  const { data: authData, error: authErr } = await db.auth.signUp({ email, password });
  if (authErr) return { error: authErr };

  const userId = authData.user?.id;
  if (!userId) return { error: new Error('No user returned from auth') };

  // 2. Create profile record
  const { error: profileErr } = await db.from('profiles').insert({
    user_id:          userId,
    account_type,
    display_name,
    title,
    country,
    currency:         currency || 'USD',
    role:             role     || 'seeker',
    job_type_prefs:   job_type_prefs  || [],
    discipline_prefs: discipline_prefs || [],
    skills:           skills          || [],
    website_url:      website_url     || null,
    linkedin_url:     linkedin_url    || null,
    facebook_url:     facebook_url    || null,
    academic_url:     academic_url    || null,
    org_size:         org_size        || null,
    org_industry:     org_industry    || null,
    bio:              bio             || null,
    avatar_color:     authAvatarColor(display_name),
    is_public:        true,
    last_active_at:   new Date().toISOString(),
  });

  if (profileErr) {
    console.error('Profile creation error:', profileErr);
    // Don't block sign-up; profile can be completed later
  }

  return { user: authData.user, session: authData.session };
}

/* ── Sign In ─────────────────────────────────────────────────────────────── */
async function signIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error };

  // Touch last_active_at
  if (data.user) {
    await db.from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', data.user.id);
  }

  return { user: data.user, session: data.session };
}

/* ── Sign Out ────────────────────────────────────────────────────────────── */
async function signOut() {
  const { error } = await db.auth.signOut();
  return { error };
}

/* ── Get current session & profile ──────────────────────────────────────── */
async function getSessionProfile() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return { session: null, profile: null };

  const { data: profile } = await db.from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return { session, profile };
}

/* ── Update navbar to reflect signed-in state ───────────────────────────── */
async function updateNavAuth() {
  const { session, profile } = await getSessionProfile();
  const actionsEl = document.querySelector('.navbar-actions');
  if (!actionsEl) return;

  if (session && profile) {
    const initials = authInitials(profile.display_name);
    const color    = profile.avatar_color || authAvatarColor(profile.display_name);
    actionsEl.innerHTML = `
      <a href="profile?id=${profile.id}" class="nav-profile-btn" title="${profile.display_name}">
        ${profile.avatar_url
          ? `<img src="${profile.avatar_url}" alt="${initials}" class="nav-avatar-img">`
          : `<div class="nav-avatar-initials" style="background:${color}">${initials}</div>`}
        <span class="nav-profile-name">${profile.display_name.split(' ')[0]}</span>
      </a>
      <button class="btn btn-sm" onclick="handleSignOut()" style="border:1.5px solid var(--color-border)">Sign Out</button>
      <button class="nav-toggle" id="mobileToggle" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>`;
  }
  // else: default Sign In / Get Started already in HTML
}

async function handleSignOut() {
  await signOut();
  window.location.href = 'index.html';
}

/* ── Auto-run on page load ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', updateNavAuth);
