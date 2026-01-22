import { Stack } from "expo-router";
import { AuthProvider } from "../../contexts/authContext";

const LoginLayout = () => {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
};

export default LoginLayout;
