import { StyleSheet, Text, TouchableOpacity } from "react-native";

const Chip = ({ label, selected, onPress, tone = "default" }) => {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        tone === "community" && styles.community,
        tone === "google" && styles.google,
        selected && styles.selected,
      ]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: "#c9cde0",
    backgroundColor: "#f2f3f8",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  community: {
    backgroundColor: "#e6f4ea",
    borderColor: "#9bd3ac",
  },
  google: {
    backgroundColor: "#fff6e0",
    borderColor: "#f0d28c",
  },
  selected: {
    backgroundColor: "#5a6283",
    borderColor: "#5a6283",
  },
  text: {
    fontSize: 13,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Chip;
