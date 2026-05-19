import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('zt_token');
    const saved = localStorage.getItem('zt_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await axios.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('zt_token', token);
    localStorage.setItem('zt_user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem('zt_token');
    localStorage.removeItem('zt_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}