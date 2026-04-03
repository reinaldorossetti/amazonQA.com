import React, { createContext, useState, useContext, useEffect } from "react";

/**
 * @typedef {Object} AuthUser
 * @property {number}  id         - Database row ID.
 * @property {string}  name       - User's first name.
 * @property {string}  lastName   - User's last name.
 * @property {string}  email      - User's email address.
 * @property {string}  personType - `'PF'` (individual) or `'PJ'` (company).
 * @property {string[]} [roles]    - User roles (e.g. `['user']`, `['admin','user']`).
 * @property {boolean} [isAdmin]   - `true` when user has admin privileges.
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {AuthUser|null} user       - Currently authenticated user, or `null`.
 * @property {string|null}    accessToken - Current bearer access token.
 * @property {boolean}       isLoggedIn - `true` when a user session is active.
 * @property {function({ user: AuthUser, accessToken: string }): void} login  - Persists a user session.
 * @property {function(): void}          logout - Clears the current session.
 */

/** @type {React.Context<AuthContextValue>} */
const AuthContext = createContext(undefined);

/**
 * Provides authentication state to the component tree.
 *
 * On mount the provider restores any previously persisted session from
 * `localStorage` so that the user stays logged in across page reloads.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  /** @type {[AuthUser|null, React.Dispatch<React.SetStateAction<AuthUser|null>>]} */
  const [user, setUser] = useState(null);
  /** @type {[string|null, React.Dispatch<React.SetStateAction<string|null>>]} */
  const [accessToken, setAccessToken] = useState(null);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      roles: Array.isArray(rawUser.roles) ? rawUser.roles : [],
      isAdmin: Boolean(rawUser.isAdmin),
    };
  };

  // Restore session from localStorage on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    const savedToken = localStorage.getItem("auth_token");

    if (savedUser && savedToken) {
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
        setAccessToken(savedToken);
      } catch {
        // Corrupt data — ignore and start with no session
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  }, []);

  /**
   * Logs a user in by storing their data in React state and localStorage.
   *
   * @param {{ user: AuthUser, accessToken: string }} authData - Authenticated user details and bearer token.
   * @returns {void}
   */
  const login = (authData) => {
    const normalizedUser = normalizeUser(authData.user);
    setUser(normalizedUser);
    setAccessToken(authData.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
    localStorage.setItem("auth_token", authData.accessToken);
  };

  /**
   * Logs the current user out by clearing React state and removing the
   * persisted session from localStorage.
   *
   * @returns {void}
   */
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoggedIn: !!user && !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook that returns the current {@link AuthContextValue}.
 *
 * Must be called from a component rendered inside {@link AuthProvider}.
 *
 * @returns {AuthContextValue}
 * @throws {Error} If called outside an `AuthProvider` tree.
 *
 * @example
 * const { isLoggedIn, user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("use Auth must be used within an AuthProvider");
  return ctx;
};
