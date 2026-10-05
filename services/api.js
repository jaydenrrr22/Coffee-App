import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const TOKEN_KEY = "bluenolia.token";
const API_PORT = 8000;

// Expo's dev server host is the computer running `expo start`, which is also
// where the local backend runs, so this works on simulators and real phones.
const resolveBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
  return `http://${host}:${API_PORT}`;
};

export const API_URL = resolveBaseUrl();

let cachedToken;

export const getToken = async () => {
  if (cachedToken === undefined) {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  }
  return cachedToken;
};

export const setToken = async (token) => {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const errorMessage = (data, status) => {
  const detail = data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const { loc, msg } = detail[0];
    const field = Array.isArray(loc) ? loc[loc.length - 1] : null;
    return field && field !== "body" ? `${field}: ${msg}` : msg;
  }
  return `Request failed (${status})`;
};

export const buildQuery = (params) =>
  Object.entries(params)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

export const request = async (path, { method = "GET", body } = {}) => {
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Can't reach the Bluenolia server at ${API_URL}. Is the backend running?`,
      0
    );
  }

  if (response.status === 204) {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(errorMessage(data, response.status), response.status);
  }
  return data;
};
