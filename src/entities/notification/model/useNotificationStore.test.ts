import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useNotificationStore } from './useNotificationStore';
import { notificationService } from '../api/notificationService';
import { UpdateRecord } from './types';

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
      deletedIds: [],
      lastReadId: null,
      installDate: null,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should handle notification updates and unread status', () => {
    const now = Date.now();
    const mockUpdates = [
      { id: '1', title: 'Update 1', date: '01/01/2026', type: 'price', read: false, timestamp: { toMillis: () => now + 1000 } },
      { id: '2', title: 'Update 2', date: '01/01/2026', type: 'price', read: false, timestamp: { toMillis: () => now + 2000 } }
    ];

    let callback: (updates: unknown[]) => void;
    (notificationService.subscribeToNotifications as Mock).mockImplementation((cb: (updates: unknown[]) => void) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback!(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(2);
    expect(state.hasUnread).toBe(true);
  });

  it('should filter notifications by install date', () => {
    const installDate = Date.now();
    useNotificationStore.setState({ installDate });

    const mockUpdates = [
      { id: 'new', title: 'After Install', date: '01/01/2026', type: 'price', read: false, timestamp: { toMillis: () => installDate + 1000 } },
      { id: 'old', title: 'Before Install', date: '01/01/2026', type: 'price', read: false, timestamp: { toMillis: () => installDate - 1000 } }
    ];

    let callback: (updates: unknown[]) => void;
    (notificationService.subscribeToNotifications as Mock).mockImplementation((cb: (updates: unknown[]) => void) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback!(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].id).toBe('new');
  });

  it('should filter deleted notifications locally', () => {
    const now = Date.now();
    useNotificationStore.setState({ deletedIds: ['deleted-id'] });

    const mockUpdates = [
      { id: 'visible', title: 'Visible', date: '01/01/2026', type: 'price', read: false, timestamp: { toMillis: () => now + 1000 } },
      { id: 'deleted-id', title: 'Deleted', date: '01/01/2026', type: 'price', read: false, timestamp: { toMillis: () => now + 1000 } }
    ];

    let callback: (updates: unknown[]) => void;
    (notificationService.subscribeToNotifications as Mock).mockImplementation((cb: (updates: unknown[]) => void) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback!(mockUpdates);

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].id).toBe('visible');
  });

  it('should mark all as read', () => {
    const mockUpdates = [
      { id: 'latest', title: 'New', date: '02/01/2026', type: 'price', read: false },
      { id: 'old', title: 'Old', date: '01/01/2026', type: 'price', read: false }
    ];
    
    useNotificationStore.setState({ 
      updates: mockUpdates as unknown as UpdateRecord[], 
      hasUnread: true 
    });

    useNotificationStore.getState().actions.handleMarkAllAsRead();
    
    const state = useNotificationStore.getState();
    expect(state.hasUnread).toBe(false);
    expect(state.updates[0].read).toBe(true);
    expect(state.lastReadId).toBe('latest');
  });

  it('should delete a notification locally', async () => {
    const mockUpdates = [
      { id: '1', title: 'Keep', date: '01/01/2026', type: 'price', read: false },
      { id: '2', title: 'Delete', date: '01/01/2026', type: 'price', read: false }
    ];
    
    useNotificationStore.setState({ updates: mockUpdates as unknown as UpdateRecord[] });

    await useNotificationStore.getState().actions.handleDeleteNotification('2');
    
    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].id).toBe('1');
    expect(state.deletedIds).toContain('2');
  });

  it('should delete all notifications locally', async () => {
    const mockUpdates = [
      { id: '1', title: '1', date: '01/01/2026', type: 'price', read: false },
      { id: '2', title: '2', date: '01/01/2026', type: 'price', read: false }
    ];
    
    useNotificationStore.setState({ updates: mockUpdates as unknown as UpdateRecord[], hasUnread: true });

    await useNotificationStore.getState().actions.handleDeleteAllNotifications();
    
    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(0);
    expect(state.hasUnread).toBe(false);
    expect(state.deletedIds).toContain('1');
    expect(state.deletedIds).toContain('2');
  });

  it('should handle clicking a notification', () => {
    const mockUpdates = [
      { id: 'newest', title: 'newest', date: '03/01/2026', type: 'price', read: false },
      { id: 'middle', title: 'middle', date: '02/01/2026', type: 'price', read: false },
      { id: 'oldest', title: 'oldest', date: '01/01/2026', type: 'price', read: false }
    ];
    
    useNotificationStore.setState({ 
      updates: mockUpdates as unknown as UpdateRecord[],
      hasUnread: true
    });

    // Click middle one
    useNotificationStore.getState().actions.handleUpdateClick(mockUpdates[1] as unknown as UpdateRecord);
    
    const state = useNotificationStore.getState();
    expect(state.selectedUpdate?.id).toBe('middle');
    expect(state.lastReadId).toBe('middle');
    
    // middle and oldest should be marked read, newest should be unread
    expect(state.updates[0].read).toBe(false);
    expect(state.updates[1].read).toBe(true);
    expect(state.updates[2].read).toBe(true);
    expect(state.hasUnread).toBe(true); // because newest is still unread
  });

  it('should handle empty updates array', () => {
    let callback: (updates: unknown[]) => void;
    (notificationService.subscribeToNotifications as Mock).mockImplementation((cb: (updates: unknown[]) => void) => {
      callback = cb;
      return () => {};
    });

    useNotificationStore.getState().actions.init();
    callback!([]); // Empty array

    const state = useNotificationStore.getState();
    expect(state.updates).toHaveLength(0);
    expect(state.hasUnread).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('should prevent double subscription', () => {
    (notificationService.subscribeToNotifications as Mock).mockReturnValue(() => {});

    useNotificationStore.getState().actions.init();
    useNotificationStore.getState().actions.init();

    expect(notificationService.subscribeToNotifications).toHaveBeenCalledTimes(1);
  });
});
