import { StyleSheet, Text, View } from "react-native";

const LightRoast = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Light Roast</Text>
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

export default LightRoast;
