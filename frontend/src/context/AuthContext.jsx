import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // On page refresh, read the saved user from the browser
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  const saveUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveUser(data);
    return data;
  };

    const register = async (form) => {
    const { data } = await api.post("/auth/register", form);
    return data; // no auto-login: the person goes to the Login page
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);