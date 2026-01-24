import { ID } from "react-native-appwrite";
import { account } from "./appwrite";

const authService = {
  async register(email, password) {
    try {
      const response = await account.create(ID.unique(), email, password);
      return response;
    } catch (error) {
      return {
        error: error.message || "Registration failed. Please try again",
      };
    }
  },

  async login(email, password) {
    try {
      const response = await account.createEmailPasswordSession(
        email,
        password
      );
      return response;
    } catch (error) {
      return {
        error: error.message || "Login failed. Please check your credentials",
      };
    }
  },

  async getUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  async logout() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      return {
        error: error.message || "Logout failed. Please try again",
      };
    }
  },
};

export default authService;
