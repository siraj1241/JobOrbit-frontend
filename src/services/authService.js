/**
 * Auth service — thin wrappers over the API client for auth-related endpoints.
 *
 * Each function returns the data shape returned by the backend (AuthResultDto
 * for login/register, the small object for /me).
 */
import { api } from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ accessToken, tokenType, expiresIn, userId, email, displayName, role }>}
 */
export function login(payload) {
  return api.post(ENDPOINTS.login, payload);
}

/**
 * Register a new user. Backend validates password strength (upper / lower / digit,
 * min 6 chars) and that passwords match.
 * @param {{ email, password, confirmPassword, displayName }} payload
 */
export function register(payload) {
  return api.post(ENDPOINTS.register, payload);
}

/** Returns { userId, email, role } for the currently authenticated user. */
export function getMe() {
  return api.get(ENDPOINTS.me);
}

export default { login, register, getMe };
