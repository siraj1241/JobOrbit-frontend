/**
 * Employer service — endpoints for posting & managing internal jobs.
 * All routes require the caller's JWT to carry the "Employer" role.
 */
import { api } from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

/** List the current employer's job postings (all statuses). */
export function listMyJobs() {
  return api.get(ENDPOINTS.employerJobs);
}

/** Get a single posting owned by the current employer. */
export function getMyJob(id) {
  return api.get(ENDPOINTS.employerJobById(id));
}

/** Create a new job posting (Draft or Published). */
export function createJob(payload) {
  return api.post(ENDPOINTS.employerJobs, payload);
}

/** Update an existing posting. */
export function updateJob(id, payload) {
  return api.put(ENDPOINTS.employerJobById(id), payload);
}

/** Delete a posting. */
export function deleteJob(id) {
  return api.delete(ENDPOINTS.employerJobById(id));
}

/** Upgrade the current user account to the Employer role. */
export function upgradeToEmployer(companyName) {
  return api.post(ENDPOINTS.upgradeToEmployer, { companyName });
}

export default { listMyJobs, getMyJob, createJob, updateJob, deleteJob, upgradeToEmployer };
