import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationStore } from './useNotificationStore';
import { notificationService } from '../api/notificationService';

// Mock notification service
vi.mock('../api/notificationService', () => ({
  notificationService: {
    subscribeToNotifications: vi.fn(),
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
    const now = Date.now();
    const mockUpdates = [
      { id: '1', title: 'Update 1', timestamp: { toMillis: () => now + 1000 } },
      { id: '2', title: 'Update 2', timestamp: { toMillis: () => now + 2000 } }
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

  it('should filter notifications by install date', () => {
    const installDate = Date.now();
    localStorage.setItem('appInstallDate', installDate.toString());

    const mockUpdates = [
      { id: 'new', title: 'After Install', timestamp: { toMillis: () => installDate + 1000 } },
      { id: 'old', title: 'Before Install', timestamp: { toMillis: () => installDate - 1000 } }
    ];

    let callback: any;
    (notificationService.subscribeToNotifications as any).mockImplementation((cb: any) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].id).toBe('new');
  });

  it('should filter deleted notifications locally', () => {
    const now = Date.now();
    localStorage.setItem('deletedNotificationIds', JSON.stringify(['deleted-id']));

    const mockUpdates = [
      { id: 'visible', title: 'Visible', timestamp: { toMillis: () => now + 1000 } },
      { id: 'deleted-id', title: 'Deleted', timestamp: { toMillis: () => now + 1000 } }
    ];

    let callback: any;
    (notificationService.subscribeToNotifications as any).mockImplementation((cb: any) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].id).toBe('visible');
  });

  it('should mark all as read', () => {
    const mockUpdates = [
      { id: 'latest', title: 'New' },
      { id: 'old', title: 'Old' }
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

  it('should delete a notification locally', async () => {
    const mockUpdates = [
      { id: '1', title: 'Keep' },
      { id: '2', title: 'Delete' }
    ];
    
    useNotificationStore.setState({ updates: mockUpdates as any });

    await useNotificationStore.getState().actions.handleDeleteNotification('2');
    
    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].id).toBe('1');
    
    const deletedIds = JSON.parse(localStorage.getItem('deletedNotificationIds') || '[]');
    expect(deletedIds).toContain('2');
  });

  it('should delete all notifications locally', async () => {
    const mockUpdates = [
      { id: '1', title: '1' },
      { id: '2', title: '2' }
    ];
    
    useNotificationStore.setState({ updates: mockUpdates as any, hasUnread: true });

    await useNotificationStore.getState().actions.handleDeleteAllNotifications();
    
    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(0);
    expect(state.hasUnread).toBe(false);
    
    const deletedIds = JSON.parse(localStorage.getItem('deletedNotificationIds') || '[]');
    expect(deletedIds).toContain('1');
    expect(deletedIds).toContain('2');
  });

  it('should handle clicking a notification', () => {
    const mockUpdates = [
      { id: 'newest', title: 'newest' },
      { id: 'middle', title: 'middle' },
      { id: 'oldest', title: 'oldest' }
    ];
    
    useNotificationStore.setState({ 
      updates: mockUpdates as any,
      hasUnread: true
    });

    // Click middle one
    useNotificationStore.getState().actions.handleUpdateClick(mockUpdates[1] as any);
    
    const state = useNotificationStore.getState();
    expect(state.selectedUpdate?.id).toBe('middle');
    expect(localStorage.getItem('lastReadUpdateId')).toBe('middle');
    
    // middle and oldest should be marked read, newest should be unread
    expect(state.updates[0].read).toBe(false);
    expect(state.updates[1].read).toBe(true);
    expect(state.updates[2].read).toBe(true);
    expect(state.hasUnread).toBe(true); // because newest is still unread
  });

  it('should handle empty updates array', () => {
    let callback: any;
    (notificationService.subscribeToNotifications as any).mockImplementation((cb: any) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback([]); // Empty array

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(0);
    expect(state.hasUnread).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('should prevent double subscription', () => {
    (notificationService.subscribeToNotifications as any).mockReturnValue(() => {});

    useNotificationStore.getState().actions.init();
    useNotificationStore.getState().actions.init();

    expect(notificationService.subscribeToNotifications).toHaveBeenCalledTimes(1);
  });
});
