/**
 * useAuth — global auth state for the entire app.
 *
 * Responsibilities:
 *   - Load and cache the user object (token lives in the API client).
 *   - Expose login() / register() / logout() actions.
 *   - Hydrate user from localStorage on first render.
 *
 * Components should never read localStorage directly — use this hook instead.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setToken } from '../lib/api';
import { STORAGE_KEYS } from '../lib/endpoints';
import * as authService from '../services/authService';
import * as employerService from '../services/employerService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readUser());
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, refresh /me so we know the user is still valid.
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((me) => persistUser({ ...me, displayName: me.displayName || user?.displayName }))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUser = useCallback((u) => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
  }, []);

  /** Login with email + password. */
  const login = useCallback(async ({ email, password }) => {
    const res = await authService.login({ email, password });
    setToken(res.accessToken);
    persistUser({
      id: res.userId,
      email: res.email,
      displayName: res.displayName,
      role: res.role,
    });
    return res;
  }, [persistUser]);

  /** Register a new user. */
  const register = useCallback(async ({ displayName, email, password, confirmPassword }) => {
    const res = await authService.register({
      displayName, email, password, confirmPassword,
    });
    setToken(res.accessToken);
    persistUser({
      id: res.userId,
      email: res.email,
      displayName: res.displayName,
      role: res.role,
    });
    return res;
  }, [persistUser]);

  /**
   * Upgrade the current user to Employer role. Returns the new JWT (auto-saved)
   * so subsequent API calls carry the "Employer" role claim.
   */
  const upgradeToEmployer = useCallback(async (companyName) => {
    const res = await employerService.upgradeToEmployer(companyName);
    setToken(res.accessToken);
    persistUser({
      id: res.userId,
      email: res.email,
      displayName: res.displayName,
      role: res.role,
      companyName,
    });
    return res;
  }, [persistUser]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isEmployer: user?.role === 'Employer',
      login,
      register,
      upgradeToEmployer,
      logout,
    }),
    [user, loading, login, register, upgradeToEmployer, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default useAuth;
