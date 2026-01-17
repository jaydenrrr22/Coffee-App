import { Stack } from "expo-router";

const RoastsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Roast Details",
      }}
    ></Stack>
  );
};

export default RoastsLayout;
