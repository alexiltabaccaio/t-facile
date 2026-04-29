import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useNotificationStore } from '@/entities/notification';
import { UpdateDetailView } from '@/features/notifications';

const NotificationDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const updates = useNotificationStore(state => state.updates);
    const update = updates.find(u => u.id === id);
    
    if (!update) return <Navigate to="/notifications" replace />;
    return <UpdateDetailView update={update} />;
};

export default NotificationDetailPage;
