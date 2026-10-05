import { Stack } from "expo-router";

const StartAsGuestLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default StartAsGuestLayout;
