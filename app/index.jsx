import PostItImage from "@/assets/images/Bluenolia.png";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={PostItImage} style={styles.image} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/categories")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.adminButtonText}>Admin login</Text>
      </TouchableOpacity>
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
  adminButton: {
    position: "absolute",
    backgroundColor: "#ffffffff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    bottom: 150,
    alignItems: "center",
  },
  adminButtonText: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
