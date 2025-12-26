// hooks/useSignalR.js
import { useEffect, useState, useRef, useCallback } from "react";
import signalRService from "../services/hubs/SignalRService";

export const useSignalR = (chatId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25; // Количество сообщений на странице
  const messagesContainerRef = useRef(null);

  const loadMessages = useCallback(async (page = 1, append = false) => {
    if (!chatId) {
      console.log("⚠️ Не указан chatId");
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingMessages(true);
      }

      console.log(`🔄 Загрузка сообщений, страница ${page}`);

      // Используем ваш уже работающий метод getMessages
      const { messageService } = await import(
        "../services/api/MessagesService"
      );

      const fetchedMessages = await messageService.getMessages(chatId, page, pageSize);
      
      console.log(`✅ Получено ${fetchedMessages.length} сообщений`);

      // Нормализуем сообщения
      const normalizedMessages = fetchedMessages.map((msg, index) => ({
        id: msg.id || `msg_${Date.now()}_${index}`,
        content: msg.content || msg.text || "",
        senderId: msg.senderId || msg.userId || "unknown",
        senderName: msg.senderName || msg.userName || "Пользователь",
        senderAvatar: msg.senderAvatar || null,
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        isEdited: msg.isEdited || false,
        isDeleted: msg.isDeleted || false,
        isRead: msg.isRead || false,
        isDelivered: msg.isDelivered || false,
        readCount: msg.readCount || 0,
      }));

      if (append) {
        // Добавляем старые сообщения в начало
        setMessages(prev => [...normalizedMessages, ...prev]);
      } else {
        // Первая загрузка
        setMessages(normalizedMessages);
      }

      // Проверяем, есть ли еще сообщения
      setHasMoreMessages(normalizedMessages.length === pageSize);
      setCurrentPage(page);

    } catch (error) {
      console.error("❌ Ошибка загрузки сообщений:", error);
      if (!append) {
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
    }
  }, [chatId, pageSize]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || loadingMore) return;

    const nextPage = currentPage + 1;
    console.log(`🔄 Загрузка старых сообщений, страница ${nextPage}`);
    
    // Сохраняем текущую позицию скролла
    const container = messagesContainerRef.current;
    const oldScrollHeight = container ? container.scrollHeight : 0;
    const oldScrollTop = container ? container.scrollTop : 0;

    // Загружаем следующую страницу
    await loadMessages(nextPage, true);

    // Восстанавливаем позицию скролла после загрузки
    if (container) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
    }
  }, [hasMoreMessages, loadingMore, currentPage, loadMessages]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMoreMessages || !chatId) return;

    // Порог для загрузки (150px от верха)
    const scrollThreshold = 150;
    
    if (container.scrollTop <= scrollThreshold) {
      loadMoreMessages();
    }
  }, [loadingMore, hasMoreMessages, loadMoreMessages, chatId]);

  // Эффект для добавления обработчика скролла
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const initConnection = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Нет токена авторизации");
        return;
      }

      try {
        const connected = await signalRService.connect(token);
        setIsConnected(connected);
        console.log("🔗 SignalR подключен:", connected);
      } catch (error) {
        console.error("❌ Ошибка подключения SignalR:", error);
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
      console.log("🔄 Загрузка сообщений для чата:", chatId);
      setCurrentPage(1);
      setHasMoreMessages(true);
      loadMessages(1, false);
    } else {
      setMessages([]);
    }
  }, [chatId, loadMessages]);

  // Обработчики событий SignalR
  useEffect(() => {
    if (!signalRService.isConnected || !chatId) return;

    console.log("🎯 Подписываемся на события чата:", chatId);

    // Присоединяемся к чату
    signalRService.joinChat(chatId);

    // Обработчики событий
    const handleNewMessage = (message) => {
      console.log("📨 Новое сообщение из SignalR:", message);

      // Нормализуем сообщение
      const normalizedMessage = {
        id: message.id || Math.random().toString(),
        content: message.content || message.text || "",
        senderId: message.senderId || message.userId,
        senderName: message.senderName || "Пользователь",
        senderAvatar: message.senderAvatar,
        createdAt: message.createdAt || new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
        isRead: false,
        isDelivered: true,
        file: message.file || null,
      };

      setMessages((prev) => {
        // Проверяем дубликаты
        const exists = prev.find((m) => m.id === normalizedMessage.id);
        if (exists) return prev;

        // Добавляем новое сообщение
        return [...prev, normalizedMessage];
      });
    };

    const handleMessageUpdated = (updatedMessage) => {
      console.log("✏️ Сообщение обновлено:", updatedMessage);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        )
      );
    };

    const handleMessageDeleted = (messageId) => {
      console.log("🗑️ Сообщение удалено:", messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isDeleted: true, content: "Сообщение удалено" }
            : msg
        )
      );
    };

    const handleUserTyping = (data) => {
      console.log("⌨️ Пользователь печатает:", data);
      if (data.isTyping && data.userId) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
      } else if (!data.isTyping && data.userId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    // hooks/useSignalR.js - добавьте в useEffect с обработчиками событий
    const handleMessageRead = (data) => {
      console.log("👁️ Сообщение прочитано:", data);

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            // Обновляем информацию о прочтении
            return {
              ...msg,
              isReadByCurrentUser:
                data.userId === data.userId || msg.isReadByCurrentUser,
              readByUsers: [
                ...(msg.readByUsers || []),
                { userId: data.userId, readAt: new Date() },
              ],
              readCount: (msg.readCount || 0) + 1,
            };
          }
          return msg;
        })
      );
    };

    const handleMessageDelivered = (data) => {
      console.log("✓ Сообщение доставлено:", data);

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return { ...msg, isDelivered: true };
          }
          return msg;
        })
      );
    };

    // Добавьте подписку на события в useEffect:
    signalRService.on("MessageRead", handleMessageRead);
    signalRService.on("MessageDelivered", handleMessageDelivered);

    // Подписываемся на события
    signalRService.on("ReceiveMessage", handleNewMessage);
    signalRService.on("MessageUpdated", handleMessageUpdated);
    signalRService.on("MessageDeleted", handleMessageDeleted);
    signalRService.on("UserTyping", handleUserTyping);

    // Отписка
    return () => {
      if (chatId) {
        signalRService.leaveChat(chatId);
      }
      signalRService.off("ReceiveMessage", handleNewMessage);
      signalRService.off("MessageUpdated", handleMessageUpdated);
      signalRService.off("MessageDeleted", handleMessageDeleted);
      signalRService.off("UserTyping", handleUserTyping);
      // И отписку в cleanup:
      signalRService.off("MessageRead", handleMessageRead);
      signalRService.off("MessageDelivered", handleMessageDelivered);
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
      const { messageService } = await import(
        "../services/api/MessagesService"
      );
      const result = await messageService.sendMessage(
        content,
        targetUserId,
        chatId
      );

      console.log("✅ Сообщение отправлено через API:", result);

      // Возвращаем результат для обработки
      return result;
    } catch (error) {
      console.error("❌ Ошибка отправки:", error);
      throw error;
    }
  };

  return {
    isConnected,
    messages,
    setMessages,
    typingUsers,
    loadingMessages,
    loadingMore,
    hasMoreMessages,
    messagesContainerRef,
    startTyping,
    stopTyping,
    sendMessage,
    loadMoreMessages,
  };
};
