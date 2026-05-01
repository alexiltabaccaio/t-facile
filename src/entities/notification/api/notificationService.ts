import { notificationRepository, DbError } from '@/shared/api';
import { UpdateRecord } from '../model/types';

export const notificationService = {
  /**
   * Subscription to notifications (the last 50)
   */
  subscribeToNotifications: (
    onUpdate: (notifications: UpdateRecord[]) => void,
    onError: (error: DbError) => void
  ) => {
    return notificationRepository.subscribeToNotifications(
      (data) => onUpdate(data as UpdateRecord[]),
      onError
    );
  },

  /**
   * Marks a notification as read
   */
  markAsRead: async (notificationId: string) => {
    await notificationRepository.markAsRead(notificationId);
  },

  /**
   * Marks all notifications as read
   */
  markAllAsRead: async (notificationIds: string[]) => {
    await notificationRepository.markAllAsRead(notificationIds);
  },

  /**
   * Deletes a notification
   */
  deleteNotification: async (notificationId: string) => {
    await notificationRepository.deleteNotification(notificationId);
  },

  /**
   * Deletes all notifications
   */
  deleteAllNotifications: async () => {
    await notificationRepository.deleteAllNotifications();
  }
};

