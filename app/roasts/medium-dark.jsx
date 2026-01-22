import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MediumDarkRoast = () => {
  const [reviews, setReviews] = useState({
    id: "1",
    author: "Coffee Lover",
    rating: 5,
    comment: "Bright and smooth flavor!",
  });
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");

  const addReview = () => {
    if (!author || !comment || !rating) {
      return;
    }
    const newReview = {
      id: Date.now().toString(),
      author,
      rating: Number(rating),
      comment,
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medium Dark Roast</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Your name"
          value={author}
          onChangeText={setAuthor}
          style={styles.input}
        ></TextInput>

        <TextInput
          placeholder="Rating (1-5)"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
          style={styles.input}
        ></TextInput>

        <TextInput
          placeholder="Write your review"
          value={comment}
          onChangeText={setComment}
          style={[styles.input, styles.textArea]}
          multiline
        ></TextInput>

        <TouchableOpacity style={styles.button} onPress={addReview}>
          <Text style={styles.buttonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Text style={styles.author}>{item.author}</Text>
            <Text style={styles.rating}>⭐️ {item.rating}/5</Text>
            <Text>{item.comment}</Text>
          </View>
        )}
      ></FlatList>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
  },
  button: {
    backgroundColor: "#5a6283ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  reviewCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  author: {
    fontWeight: "bold",
  },
  rating: {
    marginVertical: 5,
  },
});

export default MediumDarkRoast;
