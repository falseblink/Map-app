import * as Notifications from 'expo-notifications';
import { ActiveNotification, MarkerData } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationManager {
  private activeNotifications: Map<string, ActiveNotification>;

  constructor() {
    this.activeNotifications = new Map();
  }

  async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Разрешение на уведомления не предоставлено');
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка запроса разрешений на уведомления:', error);
      throw error;
    }
  }

  async showNotification(marker: MarkerData): Promise<void> {
    try {
      if (this.activeNotifications.has(marker.id)) {
        console.log(`Уведомление для маркера ${marker.id} уже активно`);
        return;
      }

      await this.requestNotificationPermissions();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Вы близко к маркеру!",
          body: `Вы приближаетесь к "${marker.title || 'без названия'}". Нажмите, чтобы открыть.`,
          data: { markerId: marker.id, markerTitle: marker.title },
          sound: 'default',
        },
        trigger: null, 
      });

      this.activeNotifications.set(marker.id, {
        markerId: marker.id,
        notificationId,
        timestamp: Date.now()
      });

      console.log(`Уведомление создано для маркера ${marker.id}, ID: ${notificationId}`);
    } catch (error) {
      console.error('Ошибка показа уведомления:', error);
      throw error;
    }
  }

  async removeNotification(markerId: string): Promise<void> {
    try {
      const notification = this.activeNotifications.get(markerId);
      if (notification) {
        await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
        this.activeNotifications.delete(markerId);
        console.log(`Уведомление удалено для маркера ${markerId}`);
      }
    } catch (error) {
      console.error('Ошибка удаления уведомления:', error);
      throw error;
    }
  }

  isNotificationActive(markerId: string): boolean {
    return this.activeNotifications.has(markerId);
  }

  getActiveNotifications(): ActiveNotification[] {
    return Array.from(this.activeNotifications.values());
  }

  async clearAllNotifications(): Promise<void> {
    try {
      const promises = Array.from(this.activeNotifications.values()).map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.notificationId)
      );
      
      await Promise.all(promises);
      this.activeNotifications.clear();
      console.log('Все уведомления очищены');
    } catch (error) {
      console.error('Ошибка очистки уведомлений:', error);
      throw error;
    }
  }

  async cleanupOldNotifications(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const now = Date.now();
      const toRemove: string[] = [];

      this.activeNotifications.forEach((notification, markerId) => {
        if (now - notification.timestamp > maxAge) {
          toRemove.push(markerId);
        }
      });

      const promises = toRemove.map(markerId =>
        this.removeNotification(markerId)
      );
      
      await Promise.all(promises);
      console.log(`Удалено ${toRemove.length} старых уведомлений`);
    } catch (error) {
      console.error('Ошибка очистки старых уведомлений:', error);
    }
  }


  getStats() {
    return {
      totalActive: this.activeNotifications.size,
      activeNotifications: this.getActiveNotifications()
    };
  }

  areNotificationsAvailable(): boolean {
    return true;
  }
}

export const notificationManager = new NotificationManager();

export const setupNotificationCategories = async () => {
  try {
    await Notifications.setNotificationCategoryAsync('marker', [
      {
        identifier: 'view',
        buttonTitle: 'Посмотреть',
        options: { opensAppToForeground: true }
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Закрыть',
        options: { isDestructive: true }
      }
    ]);
  } catch (error) {
    console.error('Ошибка настройки категорий уведомлений:', error);
  }
};

export const setupNotificationHandlers = (
  onNotificationReceived: (markerId: string) => void
) => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    const markerId = notification.request.content.data?.markerId;
    if (markerId && typeof markerId === 'string') {
      onNotificationReceived(markerId);
    }
  });

  return subscription;
};

export const scheduleTestNotification = async () => {
  try {
    await notificationManager.requestNotificationPermissions();
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Тест уведомления',
        body: 'Тестовое уведомление от приложения карты',
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });

    console.log('Тестовое уведомление запланировано, ID:', notificationId);
  } catch (error) {
    console.error('Ошибка планирования тестового уведомления:', error);
  }
};