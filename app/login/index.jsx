import { useAuth } from "@/contexts/authContext";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const { login, register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    let response;

    try {
      if (isRegistering) {
        response = await register(email, password);
      } else {
        response = await login(email, password);
      }

      if (response?.error) {
        Alert.alert("Error", response.error);
        return;
      }
      router.replace("/categories");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering((prev) => !prev);
    setError("");
  };
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>{isRegistering ? "Sign Up" : "Login"}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (error) setError("");
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (error) setError("");
        }}
        autoCapitalize="none"
        secureTextEntry
      />
      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            if (error) setError("");
          }}
          secureTextEntry
          textContentType="none"
        />
      )}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Please wait…" : isRegistering ? "Sign up" : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={switchMode} disabled={loading}>
        <Text style={styles.switchText}>
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchText: {
    marginTop: 10,
    color: "#007bff",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 16,
  },
});

export default LoginScreen;
