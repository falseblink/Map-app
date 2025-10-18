import { Stack } from "expo-router";
import { MarkerProvider } from "../components/MarkerContext";

export default function RootLayout() {
  return (
    <MarkerProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Карта" }} />
        <Stack.Screen name="marker/[id]" options={{ title: "Детали маркера" }} />
      </Stack>
    </MarkerProvider>
  );
}