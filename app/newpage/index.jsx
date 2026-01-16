import PostItImage from "@/assets/images/beantype.png";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  Image,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const roastData = [
  {
    type: "Light Roast",
    description:
      'Light roasts are removed from the roaster immediately after the first crack when the internal temperature reaches approximately 350°F–400°F. These beans are light brown with a matte, dry surface because they have not been heated long enough for internal oils to break through the surface. This roast is celebrated for preserving the "origin flavors" or terroir of the bean, resulting in a vibrant, highly acidic cup with delicate floral, citrus, or fruity notes.',
  },
  {
    type: "Medium Roast",
    description:
      "Medium roasts are characterized by a richer brown color and reach temperatures between 410°F–428°F, typically ending just before the second crack begins. They strike a harmonious balance between the beans natural characteristics and the sweetness developed during roasting, such as caramel and chocolate undertones. This level is often the most popular due to its smooth, well-rounded body and moderate acidity, making it highly versatile for various brewing methods.",
  },
  {
    type: "Medium Dark Roast",
    description:
      'Medium-dark roasts, often called "Full City," are roasted until the second crack is heard, reaching temperatures around 420°F–432°F. The beans exhibit a deep, rich brown color with small droplets of oil beginning to appear on the surface. This roast offers a heavier body and a spicy or bittersweet aftertaste, with the original acidity of the bean significantly reduced in favor of a bolder, "roastier" profile.',
  },
  {
    type: "Dark Roast",
    description:
      "Dark roasts are roasted well past the second crack, reaching high temperatures of 430°F–450°F, which causes the beans to become nearly black and very oily. The roasting process almost entirely replaces the beans original flavors with intense, smoky, and charred notes similar to dark chocolate or toasted nuts. These roasts are preferred for their robust, full-bodied texture and low acidity, making them ideal for espresso and milk-based drinks.",
  },
];

const NewPageScreen = () => {
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(null);
  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === index ? null : index);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Image source={PostItImage} style={styles.image} />
        <Text style={styles.headerText}>Choose Coffee Bean Roasting Type</Text>

        {roastData.map((roast, index) => {
          const isChecked = selected === index;
          return (
            <View key={index} style={styles.card}>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.titleArea}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeText}>{roast.type}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                  onPress={() => setSelected(isChecked ? null : index)}
                >
                  {isChecked && <Text style={styles.checkmark}>✅</Text>}
                </TouchableOpacity>
              </View>

              {expanded === index && (
                <Text style={styles.description}>{roast.description}</Text>
              )}
            </View>
          );
        })}
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
  image: {
    width: 350,
    height: 200,
    marginBottom: 20,
    alignSelf: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleArea: {
    flex: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#5a6283",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#5a6284",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: "#333",
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

export default NewPageScreen;
