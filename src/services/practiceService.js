/**
 * Practice service — coding puzzles for SQL, algorithms, and MCQs.
 * All endpoints are public (no auth needed).
 */
import { api } from '../lib/api';

const BASE = '/practice';

export function listSqlPuzzles() {
  return api.get(`${BASE}/sql`);
}

export function listAlgorithms() {
  return api.get(`${BASE}/algorithms`);
}

export function listMcqs() {
  return api.get(`${BASE}/mcq`);
}

export function checkSql(id, code) {
  return api.post(`${BASE}/sql/${id}/check`, { code });
}

export function analyzeAlgorithm(id, code) {
  return api.post(`${BASE}/algorithms/${id}/analyze`, { code });
}

export function checkMcq(id, selectedIndex) {
  return api.post(`${BASE}/mcq/${id}/check`, { selectedIndex });
}

export default { listSqlPuzzles, listAlgorithms, listMcqs, checkSql, analyzeAlgorithm, checkMcq };
