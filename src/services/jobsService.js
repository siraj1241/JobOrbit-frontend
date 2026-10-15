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

/**
 * Best-effort job fetcher — tries the external provider first,
 * and falls back to the local DB cache if the external provider
 * is unreachable (network/CORS/rate limit/timeout).
 *
 * @param {{ search?, location?, remote?, page?, pageSize? }} params
 * @returns {Promise<{ items, page, pageSize, totalItems, totalPages, source }>}
 */
export async function getJobsWithFallback(params = {}) {
  try {
    const external = await getExternalJobs(params);
    return { ...external, source: 'external' };
  } catch (externalErr) {
    // External failed — try the local DB cache as a fallback.
    try {
      const cached = await searchJobs(params);
      return { ...cached, source: 'cache', fallbackReason: externalErr.message };
    } catch (cacheErr) {
      // Both failed — re-throw the original external error so the UI shows
      // the more useful message (which includes the attempted URL).
      throw externalErr;
    }
  }
}

export default { getExternalJobs, searchJobs, getJobById, syncJobs, getJobsWithFallback };

