import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
        // Here you might want to decode token or fetch user details
        // For simplicity, we just set a flag or mock user object if we don't have an endpoint to "me" yet
        // Or decode JWT if we add a library for it. 
        // Let's assume the login response gives us the name/email which we might store in localStorage too.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }
  }, [token]);

  const login = (data) => {
    // data = { token, name, email, ... }
    setToken(data.token);
    setUser({ ...data });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
