import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { setupNotificationCategories, setupNotificationHandlers } from "@/services/notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await setupNotificationCategories();
        
        setupNotificationHandlers((markerId) => {
          console.log('Уведомление получено для маркера:', markerId);
        });

        console.log('Уведомления настроены успешно');
      } catch (error) {
        console.error('Ошибка настройки уведомлений:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Карта" }} />
        <Stack.Screen name="marker/[id]" options={{ title: "Детали маркера" }} />
      </Stack>
    </DatabaseProvider>
  );
}