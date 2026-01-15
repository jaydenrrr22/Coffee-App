import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const CategoryScreen = () => {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const mapRef = useRef(null);

  const locateZip = async () => {
    if (zip.length !== 5) {
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=USA&postalcode=${zip}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];

        mapRef.current.animateToRegion({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        Alert.alert("ZIP code not found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.intro}>Enter your ZIP Code</Text>
        <View style={styles.zipRow}>
          <TextInput
            style={styles.input}
            placeholder="Zipcode"
            keyboardType="numeric"
            value={zip}
            onChangeText={setZip}
            maxLength={5}
          ></TextInput>
          <TouchableOpacity style={styles.locateButton} onPress={locateZip}>
            <Text style={styles.locateText}>Locate ZIP</Text>
          </TouchableOpacity>
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/newpage")}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  intro: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  zipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    width: 220,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 16,
    marginRight: 10,
  },
  locateButton: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  locateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  map: {
    width: "100%",
    flex: 1,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CategoryScreen;
