import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationStore } from './useNotificationStore';
import { notificationService } from '../api/notificationService';

// Mock del servizio notifiche
vi.mock('../api/notificationService', () => ({
  notificationService: {
    subscribeToNotifications: vi.fn(),
    deleteNotification: vi.fn(),
    deleteAllNotifications: vi.fn(),
  }
}));

describe('useNotificationStore', () => {
  beforeEach(() => {
    const { setState } = useNotificationStore;
    setState({
      updates: [],
      selectedUpdate: null,
      hasUnread: false,
      isInitialized: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should handle notification updates and unread status', () => {
    const mockUpdates = [
      { id: '1', title: 'Update 1', date: '2024-01-01' },
      { id: '2', title: 'Update 2', date: '2024-01-02' }
    ];

    let callback: any;
    (notificationService.subscribeToNotifications as any).mockImplementation((cb: any) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(2);
    expect(state.hasUnread).toBe(true);
  });

  it('should mark all as read', () => {
    const mockUpdates = [
      { id: 'latest', title: 'New', date: '2024-01-02' },
      { id: 'old', title: 'Old', date: '2024-01-01' }
    ];
    
    useNotificationStore.setState({ 
      updates: mockUpdates as any, 
      hasUnread: true 
    });

    useNotificationStore.getState().actions.handleMarkAllAsRead();
    
    const state = useNotificationStore.getState();
    expect(state.hasUnread).toBe(false);
    expect(state.updates[0].read).toBe(true);
    expect(localStorage.getItem('lastReadUpdateId')).toBe('latest');
  });

  it('should mark unread status based on lastReadUpdateId', () => {
    localStorage.setItem('lastReadUpdateId', '2');
    const mockUpdates = [
      { id: '1', title: 'Newer' },
      { id: '2', title: 'Read' },
      { id: '3', title: 'Older' }
    ];

    let callback: any;
    (notificationService.subscribeToNotifications as any).mockImplementation((cb: any) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.hasUnread).toBe(true);
    expect(state.updates[0].read).toBe(false); // newer
    expect(state.updates[1].read).toBe(true); // matching lastReadId
    expect(state.updates[2].read).toBe(true); // older
  });
});
