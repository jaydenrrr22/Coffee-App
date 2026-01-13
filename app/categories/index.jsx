import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const CategoryScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>Choose your location</Text>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/nextPage")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "60%",
    bottom: 100,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  intro: {
    fontSize: 18,
    fontWeight: "bold",
    bottom: 120,
  },
  button: {
    position: "absolute",
    backgroundColor: "#5a6283ff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    bottom: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CategoryScreen;
