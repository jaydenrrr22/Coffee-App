import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setLoading(true);
    const response = await authService.getUser();

    if (!response || response.error) {
      setUser(null);
    } else {
      setUser(response);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response?.error) {
      return response;
    }
    await checkUser();
    return { success: true };
  };

  const register = async (email, password) => {
    const response = await authService.register(email, password);
    if (response?.error) {
      return response;
    }
    await checkUser();
    return { success: true };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    await checkUser();
  };

  const updateName = async (name) => {
    const response = await authService.updateName(name);
    if (!response?.error) {
      setUser(response);
    }
    return response;
  };

  const deactivate = async () => {
    const response = await authService.deactivate();
    if (!response?.error) {
      setUser(null);
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        updateName,
        deactivate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
