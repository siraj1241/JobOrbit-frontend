/**
 * All backend endpoints in one place.
 * Change here once when the backend changes — no need to grep through pages.
 */
export const ENDPOINTS = Object.freeze({
  // Auth
  login: '/account/login',
  register: '/account/register',
  me: '/account/me',

  // Jobs
  jobs: '/jobs',
  jobsExternal: '/jobs/external',
  jobsSync: '/jobs/sync',
  jobById: (id) => `/jobs/${id}`,
});

/** localStorage keys — keep them consistent across the app. */
export const STORAGE_KEYS = Object.freeze({
  token: 'jobboard_token',
  user: 'jobboard_user',
});
