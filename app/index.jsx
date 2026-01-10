import PostItImage from "@/assets/images/Bluenolia.png";
import { Image, StyleSheet, View } from "react-native";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={PostItImage} style={styles.image} />
      {/* <Text style={styles.title}>Welcome to the Bluenolia</Text> */}
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
});

export default HomeScreen;
