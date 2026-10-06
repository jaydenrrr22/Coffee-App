import Chip from "@/components/Chip";
import StarRating from "@/components/StarRating";
import { BREW_METHODS, ORIGINS, ROASTS } from "@/constants/coffee";
import { useAuth } from "@/contexts/authContext";
import reviewService from "@/services/reviewService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_COMMENT_LENGTH = 1000;

const ChipPicker = ({ title, options, value, onChange }) => (
  <View style={styles.section}>
    <Text style={styles.label}>{title}</Text>
    <View style={styles.chips}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => onChange(value === option.value ? null : option.value)}
        />
      ))}
    </View>
  </View>
);

const toOptions = (values) => values.map((v) => ({ value: v, label: v }));

const ReviewScreen = () => {
  const { placeId, name } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [roast, setRoast] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [brewMethod, setBrewMethod] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Log in to write a review.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const submit = async () => {
    setError("");
    if (rating === 0) {
      setError("Please pick a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please tell us about your visit");
      return;
    }

    setSubmitting(true);
    const response = await reviewService.create({
      placeId,
      placeName: name,
      rating,
      comment: comment.trim(),
      roast,
      origin,
      brewMethod,
    });
    setSubmitting(false);

    if (response?.error) {
      Alert.alert("Error", response.error);
      return;
    }
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Overall rating</Text>
        <StarRating value={rating} onChange={setRating} size={34} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Your visit</Text>
        <TextInput
          style={styles.textArea}
          placeholder="How was the coffee, the vibe, the service?"
          placeholderTextColor="#aaa"
          value={comment}
          onChangeText={setComment}
          maxLength={MAX_COMMENT_LENGTH}
          multiline
        />
        <Text style={styles.counter}>
          {comment.length}/{MAX_COMMENT_LENGTH}
        </Text>
      </View>

      <Text style={styles.hint}>
        Optional, but these help others find shops that serve the beans they
        love.
      </Text>
      <ChipPicker
        title="Roast you had"
        options={ROASTS.map((r) => ({ value: r.key, label: r.label }))}
        value={roast}
        onChange={setRoast}
      />
      <ChipPicker
        title="Bean origin"
        options={toOptions(ORIGINS)}
        value={origin}
        onChange={setOrigin}
      />
      <ChipPicker
        title="Brew method"
        options={toOptions(BREW_METHODS)}
        value={brewMethod}
        onChange={setBrewMethod}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={submit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Submitting…" : "Submit review"}
        </Text>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    height: 120,
    textAlignVertical: "top",
    fontSize: 15,
  },
  counter: {
    fontSize: 11,
    color: "#888",
    textAlign: "right",
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReviewScreen;
