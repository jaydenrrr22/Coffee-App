import StarRating from "@/components/StarRating";
import { getRoast } from "@/constants/coffee";
import { usePreferences } from "@/contexts/preferencesContext";
import reviewService from "@/services/reviewService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RoastGuide = ({ roastKey }) => {
  const roast = getRoast(roastKey);
  const router = useRouter();
  const { roasts, saveRoasts } = usePreferences();
  const [reviews, setReviews] = useState([]);
  const isPreferred = roasts.includes(roastKey);

  useEffect(() => {
    reviewService
      .listForRoast(roastKey)
      .then(setReviews)
      .catch((err) => console.error(err));
  }, [roastKey]);

  const togglePreference = () => {
    saveRoasts(
      isPreferred ? roasts.filter((r) => r !== roastKey) : [...roasts, roastKey]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{roast.label}</Text>
      <Text style={styles.notes}>{roast.flavorNotes.join(" · ")}</Text>
      <Text style={styles.body}>{roast.description}</Text>

      <Text style={styles.sectionTitle}>Best ways to brew</Text>
      {roast.brewing.map((tip) => (
        <Text key={tip} style={styles.bullet}>
          • {tip}
        </Text>
      ))}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, isPreferred && styles.buttonActive]}
          onPress={togglePreference}
        >
          <Text style={[styles.buttonText, isPreferred && styles.activeText]}>
            {isPreferred ? "✓ In my preferences" : "Add to my preferences"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/categories")}
        >
          <Text style={styles.buttonText}>Find shops</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Where people drank it</Text>
      {reviews.length === 0 ? (
        <Text style={styles.muted}>
          No community reviews mention this roast yet.
        </Text>
      ) : (
        reviews.map((review) => (
          <TouchableOpacity
            key={review.id}
            style={styles.reviewCard}
            onPress={() => router.push(`/shop/${review.placeId}`)}
          >
            <View style={styles.reviewHeader}>
              <Text style={styles.placeName}>{review.placeName}</Text>
              <StarRating value={review.rating} size={14} />
            </View>
            <Text style={styles.muted}>
              {[review.authorName, review.origin, review.brewMethod]
                .filter(Boolean)
                .join(" · ")}
            </Text>
            <Text style={styles.comment} numberOfLines={3}>
              {review.comment}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notes: {
    color: "#5a6283",
    marginVertical: 6,
  },
  body: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    borderWidth: 1,
    borderColor: "#5a6283",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  buttonActive: {
    backgroundColor: "#5a6283",
  },
  buttonText: {
    color: "#5a6283",
    fontWeight: "bold",
  },
  activeText: {
    color: "#fff",
  },
  muted: {
    color: "#666",
  },
  reviewCard: {
    backgroundColor: "#f8f8fb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  placeName: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 8,
  },
  comment: {
    marginTop: 4,
    color: "#333",
  },
});

export default RoastGuide;
