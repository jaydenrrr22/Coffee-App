import { StyleSheet, Text, View } from "react-native";

const MediumRoast = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medium Roast</Text>
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
});

export default MediumRoast;
