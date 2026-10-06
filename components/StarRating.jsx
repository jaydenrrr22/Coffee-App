import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const StarRating = ({ value, onChange, size = 28 }) => {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!onChange}
          onPress={() => onChange(star)}
          hitSlop={6}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= Math.round(value) ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  star: {
    color: "#e0a800",
    marginRight: 4,
  },
});

export default StarRating;
