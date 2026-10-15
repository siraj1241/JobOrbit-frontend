/**
 * Resume service — CRUD for the current user's resume + AI bullet generator.
 */
import { api } from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

/** Get the current user's resume (or 404 if none). */
export function getMyResume() {
  return api.get(ENDPOINTS.resume, { suppress404: true });
}

/** Create or replace the current user's resume. */
export function upsertResume(payload) {
  return api.put(ENDPOINTS.resume, payload);
}

/** Delete the current user's resume. */
export function deleteMyResume() {
  return api.delete(ENDPOINTS.resume);
}

/**
 * Generate 5 AI-tailored bullet points + summary suggestion.
 * Requires OpenAI API key to be configured on the server.
 * @param {{ company, title, existingSummary?, jobDescription? }} req
 */
export function generateBullets(req) {
  return api.post(ENDPOINTS.resumeGenerateBullets, req);
}

export default { getMyResume, upsertResume, deleteMyResume, generateBullets };
