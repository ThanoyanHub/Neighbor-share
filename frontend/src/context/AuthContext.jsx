import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem('accessToken')) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,

      isAdmin: user?.role === 'admin',

      async login(payload) {
        const { data } = await api.post('/auth/login', payload);

        localStorage.setItem(
          'accessToken',
          data.access_token
        );

        localStorage.setItem(
          'refreshToken',
          data.refresh_token
        );

        setUser(data.user);
      },

      async register(payload) {
        const { data } = await api.post(
          '/auth/register',
          payload
        );

        localStorage.setItem(
          'accessToken',
          data.access_token
        );

        localStorage.setItem(
          'refreshToken',
          data.refresh_token
        );

        setUser(data.user);
      },

      logout() {
        localStorage.clear();
        setUser(null);
      },

      setUser,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);