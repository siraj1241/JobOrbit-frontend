/**
 * All backend endpoints in one place.
 * Change here once when the backend changes — no need to grep through pages.
 */
export const ENDPOINTS = Object.freeze({
  // Auth
  login: '/account/login',
  register: '/account/register',
  me: '/account/me',
  upgradeToEmployer: '/account/upgrade-to-employer',

  // Jobs
  jobs: '/jobs',
  jobsExternal: '/jobs/external',
  jobsSync: '/jobs/sync',
  jobById: (id) => `/jobs/${id}`,

  // Employer (internal job postings)
  employerJobs: '/employer/jobs',
  employerJobById: (id) => `/employer/jobs/${id}`,

  // Resume
  resume: '/resume',
  resumeGenerateBullets: '/resume/generate-bullets',
});

/** localStorage keys — keep them consistent across the app. */
export const STORAGE_KEYS = Object.freeze({
  token: 'jobboard_token',
  user: 'jobboard_user',
});
