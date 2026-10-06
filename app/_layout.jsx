import { AuthProvider } from "@/contexts/authContext";
import { PreferencesProvider } from "@/contexts/preferencesContext";
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#5a6283ff",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "bold",
            },
            contentStyle: {
              paddingHorizontal: 10,
              paddingTop: 10,
              backgroundColor: "#fff",
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="home/index" options={{ title: "Bluenolia" }} />
          <Stack.Screen name="login" options={{ title: "Account" }} />
          <Stack.Screen name="startAsGuest" options={{ title: "Guest" }} />
          <Stack.Screen name="categories" options={{ title: "Find Coffee" }} />
          <Stack.Screen name="newpage" options={{ title: "Bean Types" }} />
          <Stack.Screen name="roasts" options={{ title: "Roast Guide" }} />
          <Stack.Screen name="shop/[id]" options={{ title: "Coffee Shop" }} />
          <Stack.Screen
            name="review/[placeId]"
            options={{ title: "Write a Review" }}
          />
          <Stack.Screen
            name="manageAccount"
            options={{ title: "Manage Account" }}
          />
        </Stack>
      </PreferencesProvider>
    </AuthProvider>
  );
};

export default RootLayout;
