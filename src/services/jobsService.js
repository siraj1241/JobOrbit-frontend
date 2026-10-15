/**
 * Jobs service — wrappers for all /jobs endpoints.
 *
 * Two sources of jobs are exposed:
 *   1. `getExternalJobs`  — live fetch from Arbeitnow (no DB write)
 *   2. `searchJobs`        — search our local cache (DB, paginated, filterable)
 *
 * `syncJobs` pulls from Arbeitnow into our DB (requires auth).
 */
import { api } from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

/**
 * Live-fetch jobs from the external provider (Arbeitnow).
 * @param {{ search?, location?, remote?, page?, pageSize? }} params
 * @returns {Promise<{ items, page, pageSize, totalItems, totalPages }>}
 */
export function getExternalJobs(params = {}) {
  return api.get(ENDPOINTS.jobsExternal, { query: params });
}

/**
 * Search the locally cached jobs (with filters + pagination).
 * @param {{ search?, location?, remote?, tag?, page?, pageSize? }} params
 */
export function searchJobs(params = {}) {
  return api.get(ENDPOINTS.jobs, { query: params });
}

/** Get a single cached job by ID. */
export function getJobById(id) {
  return api.get(ENDPOINTS.jobById(id));
}

/**
 * Trigger a sync from the external provider into the local DB.
 * Requires auth.
 * @param {number} maxPages 1..10
 * @returns {Promise<{ fetched, added, updated, skipped, syncedAt }>}
 */
export function syncJobs(maxPages = 3) {
  return api.post(`${ENDPOINTS.jobsSync}?maxPages=${maxPages}`, {});
}

export default { getExternalJobs, searchJobs, getJobById, syncJobs };
