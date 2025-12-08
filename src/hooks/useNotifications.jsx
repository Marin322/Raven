// hooks/useNotifications.js
import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
    const [permission, setPermission] = useState(notificationService.permission);
    const [isSupported, setIsSupported] = useState(notificationService.isSupported);

    // Инициализация при монтировании
    useEffect(() => {
        setIsSupported(notificationService.isSupported);
        setPermission(notificationService.permission);
    }, []);

    // Запрос разрешения
    const requestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setPermission(notificationService.permission);
        return granted;
    };

    // Показать уведомление
    const showNotification = (title, options) => {
        return notificationService.showNotification(title, options);
    };

    // Уведомление о новом сообщении
    const showNewMessageNotification = (message) => {
        return notificationService.showNewMessageNotification(message);
    };

    return {
        isSupported,
        permission,
        hasPermission: notificationService.hasPermission(),
        requestPermission,
        showNotification,
        showNewMessageNotification,
        getStatus: notificationService.getStatus
    };
};