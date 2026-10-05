import { roastLabel } from "@/constants/coffee";
import { useAuth } from "@/contexts/authContext";
import { usePreferences } from "@/contexts/preferencesContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MainScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { roasts } = usePreferences();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {user ? `Hi, ${user.name || user.email}` : "Browsing as a guest"}
      </Text>
      <Text style={styles.subtitle}>
        {roasts.length > 0
          ? `Your roasts: ${roasts.map(roastLabel).join(", ")}`
          : "Pick your favorite roasts to get better shop matches."}
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/categories")}
      >
        <Text style={styles.primaryText}>Find coffee near me</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/newpage")}
      >
        <Text style={styles.buttonText}>Coffee bean types & preferences</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(user ? "/manageAccount" : "/login")}
      >
        <Text style={styles.buttonText}>
          {user ? "Manage account" : "Log in to write reviews"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    borderWidth: 1,
    borderColor: "#5a6283",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#5a6283",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MainScreen;
