import Chip from "@/components/Chip";
import { roastLabel } from "@/constants/coffee";
import { usePreferences } from "@/contexts/preferencesContext";
import placesService from "@/services/placesService";
import reviewService from "@/services/reviewService";
import { rankPlaces, summarizeByPlace } from "@/utils/ranking";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const CategoryScreen = () => {
  const router = useRouter();
  const { roasts } = usePreferences();
  const [zip, setZip] = useState("");
  const [coords, setCoords] = useState(null);
  const [places, setPlaces] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  const roastsKey = roasts.join(",");

  const locateZip = async () => {
    if (zip.length !== 5) {
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=USA&postalcode=${zip}`,
        { headers: { "User-Agent": "Bluenolia coffee app" } }
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const next = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        setCoords(next);

        mapRef.current?.animateToRegion({
          ...next,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        Alert.alert("ZIP code not found");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Could not look up that ZIP code");
    }
  };

  const loadCommunity = useCallback(async (list) => {
    try {
      const reviews = await reviewService.listForPlaces(list.map((p) => p.id));
      setSummaries(summarizeByPlace(reviews));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!coords) {
      return;
    }
    let cancelled = false;

    const search = async () => {
      setSearching(true);
      setError("");
      try {
        const results = await placesService.searchNearby({
          ...coords,
          roasts: roastsKey ? roastsKey.split(",") : [],
        });
        if (cancelled) return;
        setPlaces(results);
        loadCommunity(results);

        if (results.length > 0) {
          mapRef.current?.fitToCoordinates(
            results.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
            {
              edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
              animated: true,
            }
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setSearching(false);
      }
    };

    search();
    return () => {
      cancelled = true;
    };
  }, [coords, roastsKey, loadCommunity]);

  // Pick up reviews written on the shop page when returning here.
  useFocusEffect(
    useCallback(() => {
      if (places.length > 0) {
        loadCommunity(places);
      }
    }, [places, loadCommunity])
  );

  const ranked = useMemo(
    () => rankPlaces(places, summaries, roasts),
    [places, summaries, roasts]
  );

  const renderPlace = ({ item }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => router.push(`/shop/${item.id}`)}
    >
      <View style={styles.placeHeader}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.rating != null && (
          <Text style={styles.placeRating}>
            ★ {item.rating.toFixed(1)} ({item.ratingCount ?? 0})
          </Text>
        )}
      </View>
      <Text style={styles.placeAddress} numberOfLines={1}>
        {item.address}
      </Text>
      {(item.communityMatches.length > 0 || item.googleMatches.length > 0) && (
        <View style={styles.badges}>
          {item.communityMatches.map((r) => (
            <Chip
              key={`c-${r}`}
              tone="community"
              label={`${roastLabel(r)} · ${summaries[item.id].roasts[r]} reviews`}
            />
          ))}
          {item.googleMatches
            .filter((r) => !item.communityMatches.includes(r))
            .map((r) => (
              <Chip
                key={`g-${r}`}
                tone="google"
                label={`Possibly ${roastLabel(r).toLowerCase()}`}
              />
            ))}
        </View>
      )}
    </TouchableOpacity>
  );

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
            onSubmitEditing={locateZip}
            maxLength={5}
          ></TextInput>
          <TouchableOpacity style={styles.locateButton} onPress={locateZip}>
            <Text style={styles.locateText}>Locate ZIP</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.prefRow}
          onPress={() => router.push("/newpage?from=categories")}
        >
          <Text style={styles.prefText} numberOfLines={1}>
            {roasts.length > 0
              ? `Matching: ${roasts.map(roastLabel).join(", ")}`
              : "No roast preferences yet"}
          </Text>
          <Text style={styles.prefEdit}>Edit</Text>
        </TouchableOpacity>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
        >
          {ranked.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={place.address}
              pinColor={place.score > 0 ? "#2e8b57" : "#5a6283"}
              onCalloutPress={() => router.push(`/shop/${place.id}`)}
            />
          ))}
        </MapView>

        {searching && <ActivityIndicator style={styles.status} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!searching && !error && coords && ranked.length === 0 && (
          <Text style={styles.status}>No coffee shops found nearby.</Text>
        )}
        {!coords && (
          <Text style={styles.status}>
            Enter a ZIP code to see coffee shops ranked by your roast
            preferences.
          </Text>
        )}

        <FlatList
          style={styles.list}
          data={ranked}
          keyExtractor={(item) => item.id}
          renderItem={renderPlace}
          ListFooterComponent={
            ranked.length > 0 ? (
              <Text style={styles.attribution}>
                Shop data from Google. Green tags come from Bluenolia reviews;
                yellow tags are keyword matches and may be inaccurate.
              </Text>
            ) : null
          }
        />
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
    marginBottom: 10,
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
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f2f3f8",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  prefText: {
    flex: 1,
    color: "#333",
  },
  prefEdit: {
    color: "#5a6283",
    fontWeight: "bold",
    marginLeft: 10,
  },
  map: {
    width: "100%",
    height: 220,
    marginBottom: 10,
    borderRadius: 8,
  },
  status: {
    color: "#666",
    textAlign: "center",
    marginVertical: 8,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 8,
  },
  list: {
    flex: 1,
  },
  placeCard: {
    backgroundColor: "#f8f8fb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  placeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  placeRating: {
    color: "#a07400",
  },
  placeAddress: {
    color: "#666",
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  attribution: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginVertical: 12,
  },
});

export default CategoryScreen;
