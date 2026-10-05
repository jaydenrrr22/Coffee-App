import PostItImage from "@/assets/images/beantype.png";
import { ROASTS } from "@/constants/coffee";
import { usePreferences } from "@/contexts/preferencesContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NewPageScreen = () => {
  const [expanded, setExpanded] = useState(null);
  const { roasts, saveRoasts, loading } = usePreferences();
  const [selected, setSelected] = useState(roasts);
  const [saving, setSaving] = useState(false);
  const { from } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      setSelected(roasts);
    }
  }, [loading, roasts]);

  const toggleExpand = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === key ? null : key);
  };

  const toggleSelected = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const save = async () => {
    setSaving(true);
    const response = await saveRoasts(selected);
    setSaving(false);
    if (response?.error) {
      Alert.alert("Error", response.error);
      return;
    }
    if (from === "categories" && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/categories");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <Image source={PostItImage} style={styles.image} />
        <Text style={styles.headerText}>Choose Coffee Bean Roasting Type</Text>
        <Text style={styles.hint}>
          Pick as many as you like. We use them to rank coffee shops near you.
        </Text>

        {ROASTS.map((roast) => {
          const isChecked = selected.includes(roast.key);
          return (
            <View key={roast.key} style={styles.card}>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.titleArea}
                  onPress={() => toggleExpand(roast.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeText}>{roast.label}</Text>
                  <Text style={styles.notes}>
                    {roast.flavorNotes.join(" · ")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                  onPress={() => toggleSelected(roast.key)}
                >
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>

              {expanded === roast.key && (
                <>
                  <Text style={styles.description}>{roast.description}</Text>
                  <TouchableOpacity onPress={() => router.push(roast.route)}>
                    <Text style={styles.link}>
                      Brewing tips & community notes →
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}
        <TouchableOpacity
          style={[styles.button, saving && { backgroundColor: "#ccc" }]}
          disabled={saving}
          onPress={save}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving…" : "Save & find shops"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: "#666",
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
  notes: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  link: {
    marginTop: 8,
    color: "#5a6283",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#5a6283ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default NewPageScreen;
