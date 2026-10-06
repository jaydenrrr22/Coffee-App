import Chip from "@/components/Chip";
import StarRating from "@/components/StarRating";
import { roastLabel } from "@/constants/coffee";
import { useAuth } from "@/contexts/authContext";
import placesService from "@/services/placesService";
import reviewService from "@/services/reviewService";
import { sortedCounts, summarizeReviews } from "@/utils/ranking";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ShopScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const details = await placesService.getDetails(id);
        if (!cancelled) setPlace(details);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      reviewService
        .listForPlace(id)
        .then(setReviews)
        .catch((err) => console.error(err));
    }, [id])
  );

  const community = useMemo(() => summarizeReviews(reviews), [reviews]);

  const writeReview = () => {
    if (!user) {
      Alert.alert("Log in required", "Log in to write a review.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log in", onPress: () => router.push("/login?returnBack=1") },
      ]);
      return;
    }
    router.push({
      pathname: "/review/[placeId]",
      params: { placeId: id, name: place?.name ?? "" },
    });
  };

  if (loading) {
    return <ActivityIndicator style={styles.centered} />;
  }
  if (error || !place) {
    return <Text style={styles.error}>{error || "Shop not found"}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.address}>{place.address}</Text>
      {place.rating != null && (
        <Text style={styles.googleRating}>
          ★ {place.rating.toFixed(1)} on Google ({place.ratingCount ?? 0}{" "}
          ratings)
        </Text>
      )}
      {place.openNow != null && (
        <Text style={place.openNow ? styles.open : styles.closed}>
          {place.openNow ? "Open now" : "Closed now"}
        </Text>
      )}

      <View style={styles.actions}>
        {place.mapsUri && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(place.mapsUri)}
          >
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>
        )}
        {place.website && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(place.website)}
          >
            <Text style={styles.actionText}>Website</Text>
          </TouchableOpacity>
        )}
        {place.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(`tel:${place.phone}`)}
          >
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>

      {place.aiSummary && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>AI summary</Text>
          <Text style={styles.body}>{place.aiSummary.text}</Text>
          <Text style={styles.disclosure}>
            {place.aiSummary.disclosure ||
              "AI-generated from Google reviews. May be inaccurate."}
          </Text>
        </View>
      )}
      {!place.aiSummary && place.editorialSummary && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{place.editorialSummary}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What the Bluenolia community says</Text>
        {community.count === 0 ? (
          <Text style={styles.muted}>
            No reviews yet. Be the first to tell others which beans they serve.
          </Text>
        ) : (
          <>
            <View style={styles.ratingRow}>
              <StarRating value={community.averageRating} size={18} />
              <Text style={styles.muted}>
                {community.averageRating.toFixed(1)} from {community.count}{" "}
                {community.count === 1 ? "review" : "reviews"}
              </Text>
            </View>
            <View style={styles.chips}>
              {sortedCounts(community.roasts).map(([key, count]) => (
                <Chip
                  key={key}
                  tone="community"
                  label={`${roastLabel(key)} · ${count}`}
                />
              ))}
              {sortedCounts(community.origins).map(([key, count]) => (
                <Chip key={key} label={`${key} · ${count}`} />
              ))}
              {sortedCounts(community.brewMethods).map(([key, count]) => (
                <Chip key={key} label={`${key} · ${count}`} />
              ))}
            </View>
          </>
        )}
        <TouchableOpacity style={styles.primaryButton} onPress={writeReview}>
          <Text style={styles.primaryText}>Write a review</Text>
        </TouchableOpacity>
      </View>

      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.author}>{review.authorName}</Text>
            <StarRating value={review.rating} size={14} />
          </View>
          {(review.roast || review.origin || review.brewMethod) && (
            <Text style={styles.tags}>
              {[roastLabel(review.roast), review.origin, review.brewMethod]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
          <Text style={styles.body}>{review.comment}</Text>
        </View>
      ))}

      {place.reviews?.length > 0 && (
        <>
          <Text style={styles.sectionHeading}>Reviews from Google</Text>
          {place.reviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text
                  style={styles.author}
                  onPress={
                    review.authorUri
                      ? () => Linking.openURL(review.authorUri)
                      : undefined
                  }
                >
                  {review.author}
                </Text>
                {review.rating != null && (
                  <StarRating value={review.rating} size={14} />
                )}
              </View>
              {review.relativeTime && (
                <Text style={styles.tags}>{review.relativeTime}</Text>
              )}
              <Text style={styles.body}>{review.text}</Text>
            </View>
          ))}
        </>
      )}
      <Text style={styles.attribution}>Shop details and reviews from Google</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  centered: {
    marginTop: 40,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  address: {
    color: "#666",
    marginTop: 4,
  },
  googleRating: {
    color: "#a07400",
    marginTop: 6,
  },
  open: {
    color: "#2e8b57",
    marginTop: 4,
    fontWeight: "bold",
  },
  closed: {
    color: "#c0392b",
    marginTop: 4,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    marginVertical: 14,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#5a6283",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  actionText: {
    color: "#5a6283",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#f8f8fb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  disclosure: {
    fontSize: 11,
    color: "#888",
    marginTop: 8,
  },
  muted: {
    color: "#666",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  author: {
    fontWeight: "bold",
  },
  tags: {
    fontSize: 12,
    color: "#5a6283",
    marginVertical: 4,
  },
  attribution: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default ShopScreen;
