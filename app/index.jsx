import PostItImage from "@/assets/images/Bluenolia.png";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={PostItImage} style={styles.image} />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push(user ? "/home" : "/login")}
      >
        <Text style={styles.loginButtonText}>
          {user ? "Continue" : "Login"}
        </Text>
      </TouchableOpacity>

      {!user && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/categories")}
        >
          <Text style={styles.buttonText}>Continue as guest</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  image: {
    width: 450,
    height: 800,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  button: {
    position: "absolute",
    backgroundColor: "#ffffffff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    bottom: 225,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    position: "absolute",
    backgroundColor: "#ffffffff",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 8,
    bottom: 150,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
