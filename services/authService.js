import { getToken, request, setToken } from "./api";

const authService = {
  async register(email, password) {
    try {
      const { token, user } = await request("/auth/register", {
        method: "POST",
        body: { email, password },
      });
      await setToken(token);
      return user;
    } catch (error) {
      return {
        error: error.message || "Registration failed. Please try again",
      };
    }
  },

  async login(email, password) {
    try {
      const { token, user } = await request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await setToken(token);
      return user;
    } catch (error) {
      return {
        error: error.message || "Login failed. Please check your credentials",
      };
    }
  },

  async getUser() {
    if (!(await getToken())) {
      return null;
    }
    try {
      return await request("/auth/me");
    } catch (error) {
      if (error.status === 401) {
        await setToken(null);
      }
      return null;
    }
  },

  async logout() {
    await setToken(null);
  },

  async updateName(name) {
    try {
      return await request("/auth/me", { method: "PATCH", body: { name } });
    } catch (error) {
      return { error: error.message || "Could not update your name" };
    }
  },

  async updatePassword(password, oldPassword) {
    try {
      await request("/auth/me/password", {
        method: "PUT",
        body: { password, oldPassword },
      });
      return { success: true };
    } catch (error) {
      return { error: error.message || "Could not update your password" };
    }
  },

  async updateRoasts(roasts) {
    try {
      return await request("/auth/me/preferences", {
        method: "PUT",
        body: { roasts },
      });
    } catch (error) {
      return { error: error.message || "Could not save your preferences" };
    }
  },

  async deactivate() {
    try {
      await request("/auth/me/deactivate", { method: "POST" });
      await setToken(null);
      return { success: true };
    } catch (error) {
      return { error: error.message || "Could not deactivate your account" };
    }
  },
};

export default authService;
