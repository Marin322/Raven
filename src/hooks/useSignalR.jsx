// hooks/useSignalR.js
import { useEffect, useState, useRef, useCallback } from 'react';
import signalRService from "../services/hubs/SignalRService";

export const useSignalR = (chatId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Функция для загрузки сообщений из API
    const loadMessages = useCallback(async (chatId) => {
        if (!chatId) return;
        
        try {
            setLoadingMessages(true);
            
            // Пробуем разные методы загрузки сообщений
            let fetchedMessages = [];
            
            try {
                const { messageService } = await import("../services/api/MessagesService");
                fetchedMessages = await messageService.getMessages(chatId);
                console.log('✅ Сообщения загружены через getMessages:', fetchedMessages.length);
            } catch (error1) {
                console.warn('⚠️ Первый метод не сработал:', error1.message);
                
                try {
                    const { messageService } = await import("../services/api/MessagesService");
                    fetchedMessages = await messageService.getChatMessages(chatId);
                    console.log('✅ Сообщения загружены через getChatMessages:', fetchedMessages.length);
                } catch (error2) {
                    console.warn('⚠️ Второй метод не сработал:', error2.message);
                    
                    try {
                        const { messageService } = await import("../services/api/MessagesService");
                        fetchedMessages = await messageService.getMessageHistory(chatId);
                        console.log('✅ Сообщения загружены через getMessageHistory:', fetchedMessages.length);
                    } catch (error3) {
                        console.warn('⚠️ Все методы не сработали:', error3.message);
                        fetchedMessages = []; // Возвращаем пустой массив
                    }
                }
            }
            
            // Нормализуем сообщения
            const normalizedMessages = (fetchedMessages || []).map(msg => ({
                id: msg.id || Math.random().toString(),
                content: msg.content || msg.text || '',
                senderId: msg.senderId || msg.userId || msg.authorId,
                senderName: msg.senderName || msg.userName || 'Пользователь',
                senderAvatar: msg.senderAvatar || msg.avatar,
                createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
                isEdited: msg.isEdited || false,
                isDeleted: msg.isDeleted || false,
                isRead: msg.isRead || false,
                isDelivered: msg.isDelivered || false,
                file: msg.file || null,
                readCount: msg.readCount || 0
            }));
            
            console.log('📊 Нормализовано сообщений:', normalizedMessages.length);
            setMessages(normalizedMessages);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки сообщений:', error);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        const initConnection = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('❌ Нет токена авторизации');
                return;
            }

            try {
                const connected = await signalRService.connect(token);
                setIsConnected(connected);
                console.log('🔗 SignalR подключен:', connected);
            } catch (error) {
                console.error('❌ Ошибка подключения SignalR:', error);
                setIsConnected(false);
            }
        };

        initConnection();

        return () => {
            signalRService.disconnect();
        };
    }, []);

    // Загружаем сообщения при смене чата
    useEffect(() => {
        if (chatId) {
            console.log('🔄 Загрузка сообщений для чата:', chatId);
            loadMessages(chatId);
        } else {
            setMessages([]);
        }
    }, [chatId, loadMessages]);

    // Обработчики событий SignalR
    useEffect(() => {
        if (!signalRService.isConnected || !chatId) return;

        console.log('🎯 Подписываемся на события чата:', chatId);

        // Присоединяемся к чату
        signalRService.joinChat(chatId);

        // Обработчики событий
        const handleNewMessage = (message) => {
            console.log('📨 Новое сообщение из SignalR:', message);
            
            // Нормализуем сообщение
            const normalizedMessage = {
                id: message.id || Math.random().toString(),
                content: message.content || message.text || '',
                senderId: message.senderId || message.userId,
                senderName: message.senderName || 'Пользователь',
                senderAvatar: message.senderAvatar,
                createdAt: message.createdAt || new Date().toISOString(),
                isEdited: false,
                isDeleted: false,
                isRead: false,
                isDelivered: true,
                file: message.file || null
            };

            setMessages(prev => {
                // Проверяем дубликаты
                const exists = prev.find(m => m.id === normalizedMessage.id);
                if (exists) return prev;
                
                // Добавляем новое сообщение
                return [...prev, normalizedMessage];
            });
        };

        const handleMessageUpdated = (updatedMessage) => {
            console.log('✏️ Сообщение обновлено:', updatedMessage);
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                )
            );
        };

        const handleMessageDeleted = (messageId) => {
            console.log('🗑️ Сообщение удалено:', messageId);
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, isDeleted: true, content: 'Сообщение удалено' }
                        : msg
                )
            );
        };

        const handleUserTyping = (data) => {
            console.log('⌨️ Пользователь печатает:', data);
            if (data.isTyping && data.userId) {
                setTypingUsers(prev => new Set([...prev, data.userId]));
            } else if (!data.isTyping && data.userId) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
            }
        };

        // Подписываемся на события
        signalRService.on('ReceiveMessage', handleNewMessage);
        signalRService.on('MessageUpdated', handleMessageUpdated);
        signalRService.on('MessageDeleted', handleMessageDeleted);
        signalRService.on('UserTyping', handleUserTyping);

        // Отписка
        return () => {
            if (chatId) {
                signalRService.leaveChat(chatId);
            }
            signalRService.off('ReceiveMessage', handleNewMessage);
            signalRService.off('MessageUpdated', handleMessageUpdated);
            signalRService.off('MessageDeleted', handleMessageDeleted);
            signalRService.off('UserTyping', handleUserTyping);
            setTypingUsers(new Set());
        };
    }, [chatId]);

    const startTyping = () => {
        if (chatId && signalRService.isConnected) {
            signalRService.startTyping(chatId);
        }
    };

    const stopTyping = () => {
        if (chatId && signalRService.isConnected) {
            signalRService.stopTyping(chatId);
        }
    };

    // Функция для отправки сообщения
    const sendMessage = async (content, targetUserId = null) => {
        try {
            const { messageService } = await import("../services/api/MessagesService");
            const result = await messageService.sendMessage(
                content,
                targetUserId,
                chatId
            );
            
            console.log('✅ Сообщение отправлено через API:', result);
            
            // Возвращаем результат для обработки
            return result;
        } catch (error) {
            console.error('❌ Ошибка отправки:', error);
            throw error;
        }
    };

    return {
        isConnected,
        messages,
        setMessages,
        typingUsers,
        loadingMessages,
        startTyping,
        stopTyping,
        sendMessage
    };
};