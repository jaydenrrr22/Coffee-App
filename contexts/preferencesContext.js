import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { useAuth } from "./authContext";

const STORAGE_KEY = "bluenolia.preferences";

const PreferencesContext = createContext();

const readDevicePreferences = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed?.roasts) ? parsed.roasts : [];
  } catch {
    return [];
  }
};

export const PreferencesProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    let cancelled = false;

    const load = async () => {
      const deviceRoasts = await readDevicePreferences();
      let next = deviceRoasts;

      if (user) {
        if (user.roasts.length > 0) {
          next = user.roasts;
        } else if (deviceRoasts.length > 0) {
          // Carry over choices made while browsing as a guest.
          await authService.updateRoasts(deviceRoasts);
        }
      }

      if (!cancelled) {
        setRoasts(next);
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const saveRoasts = async (nextRoasts) => {
    setRoasts(nextRoasts);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ roasts: nextRoasts })
    );
    if (user) {
      return authService.updateRoasts(nextRoasts);
    }
    return { success: true };
  };

  return (
    <PreferencesContext.Provider value={{ roasts, saveRoasts, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
