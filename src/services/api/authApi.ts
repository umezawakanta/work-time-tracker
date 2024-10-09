import { api } from "./apiConfig";

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
};

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }
    const response = await api.get("/auth/check");
    return response.data.isAuthenticated;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};