import { roastLabel } from "@/constants/coffee";
import { useAuth } from "@/contexts/authContext";
import { usePreferences } from "@/contexts/preferencesContext";
import authService from "@/services/authService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MIN_PASSWORD_LENGTH = 8;

const ManageAccount = () => {
  const router = useRouter();
  const { user, logout, updateName, deactivate } = useAuth();
  const { roasts } = usePreferences();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>You are browsing as a guest.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Log in or create an account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const goToStart = () => {
    router.dismissTo("/");
  };

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name can't be empty");
      return;
    }
    setBusy(true);
    const response = await updateName(name.trim());
    setBusy(false);
    Alert.alert(
      response?.error ? "Error" : "Saved",
      response?.error ?? "Your name was updated"
    );
  };

  const savePassword = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(
        "Error",
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters`
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    setBusy(true);
    const response = await authService.updatePassword(
      newPassword,
      currentPassword
    );
    setBusy(false);
    if (response?.error) {
      Alert.alert("Error", response.error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Saved", "Your password was updated");
  };

  const handleLogout = async () => {
    await logout();
    goToStart();
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate account?",
      "You will be logged out and won't be able to log in again with this account. Your reviews stay visible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            const response = await deactivate();
            if (response?.error) {
              Alert.alert("Error", response.error);
              return;
            }
            goToStart();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Profile</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user.email}</Text>

      <Text style={styles.label}>Display name (shown on your reviews)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={saveName}
        disabled={busy}
      >
        <Text style={styles.buttonText}>Save name</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Coffee preferences</Text>
      <Text style={styles.value}>
        {roasts.length > 0
          ? roasts.map(roastLabel).join(", ")
          : "No roasts selected"}
      </Text>
      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => router.push("/newpage")}
      >
        <Text style={styles.outlineText}>Edit preferences</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Change password</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        placeholderTextColor="#aaa"
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={savePassword}
        disabled={busy}
      >
        <Text style={styles.buttonText}>Update password</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Session</Text>
      <TouchableOpacity style={styles.outlineButton} onPress={handleLogout}>
        <Text style={styles.outlineText}>Log out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dangerButton} onPress={handleDeactivate}>
        <Text style={styles.dangerText}>Deactivate account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#5a6283",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  outlineText: {
    color: "#5a6283",
    fontSize: 16,
    fontWeight: "bold",
  },
  dangerButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  dangerText: {
    color: "#c0392b",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ManageAccount;
