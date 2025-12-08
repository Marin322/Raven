import React, { useState, useEffect, useRef } from "react";
import styles from "../../../styles/components/ui/Chat/MessageForm.module.css";
import { API_CONFIG } from "../../../services/config/config";

const Base_url = API_CONFIG.BASE_URL;

const Message = ({
  message,
  isOwn,
  showSender = true,
  isFirstInGroup = true,
  isLastInGroup = true,
  currentUserId,
  chatId,
  onMessageRead, // Callback для уведомления родителя
}) => {
  const [isReadByCurrentUser, setIsReadByCurrentUser] = useState(
    message.isReadByCurrentUser || false
  );
  const [isDelivered, setIsDelivered] = useState(message.isDelivered || false);
  const [readCount, setReadCount] = useState(message.readCount || 0);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const messageRef = useRef(null);
  const hasBeenReadRef = useRef(false); // Флаг чтобы не отмечать дважды

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
  };

  // Проверяем видимость сообщения
  useEffect(() => {
    if (!messageRef.current || isOwn || isReadByCurrentUser || hasBeenReadRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isMarkingAsRead) {
            markMessageAsRead();
          }
        });
      },
      {
        threshold: 0.5, // 50% сообщения видно
        rootMargin: '0px 0px -50px 0px' // Игнорируем нижние 50px (область ввода)
      }
    );

    observer.observe(messageRef.current);

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [isOwn, isReadByCurrentUser, isMarkingAsRead, message.id]);

  // Функция для отметки сообщения как прочитанного
  const markMessageAsRead = async () => {
    if (
      isOwn || 
      isReadByCurrentUser || 
      !message.id || 
      hasBeenReadRef.current || 
      isMarkingAsRead
    ) return;

    try {
      setIsMarkingAsRead(true);
      hasBeenReadRef.current = true;

      // Не отмечаем старые сообщения (старше 5 минут), которые уже могли быть прочитаны
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (messageAge > fiveMinutes) {
        console.log(`ℹ️ Пропускаем старое сообщение ${message.id}`);
        return;
      }

      const { messageService } = await import(
        "../../../services/api/MessagesService"
      );
      await messageService.markAsRead(message.id);

      setIsReadByCurrentUser(true);
      setReadCount((prev) => prev + 1);
      
      // Уведомляем родительский компонент
      if (onMessageRead) {
        onMessageRead(message.id);
      }

      console.log(`✅ Сообщение ${message.id} отмечено как прочитанное`);
    } catch (error) {
      console.error(`❌ Ошибка отметки сообщения ${message.id}:`, error);
      hasBeenReadRef.current = false; // Сбрасываем флаг при ошибке
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  // Определяем статус сообщения для отображения
  const getMessageStatus = () => {
    if (!isOwn) return null;

    if (isReadByCurrentUser || readCount > 0) {
      return {
        icon: "✓✓",
        title: "Прочитано",
        className: styles.readIcon,
        color: "#4CAF50",
      };
    } else if (isDelivered) {
      return {
        icon: "✓✓",
        title: "Доставлено",
        className: styles.deliveredIcon,
        color: "#2196F3",
      };
    } else {
      return {
        icon: "✓",
        title: "Отправлено",
        className: styles.sentIcon,
        color: "#9E9E9E",
      };
    }
  };

  const status = getMessageStatus();

  // Обработчик клика по статусу
  const handleStatusClick = () => {
    if (isOwn && !isReadByCurrentUser) {
      markMessageAsRead();
    }
  };

  return (
    <div
      ref={messageRef}
      className={`${styles.messageContainer} ${isOwn ? styles.ownMessage : ""}`}
      data-message-id={message.id}
      data-read={isReadByCurrentUser}
      data-sender={message.senderId}
    >
      {message.showDateSeparator && (
        <div className={styles.dateSeparator}>
          <span>{formatDate(message.createdAt)}</span>
        </div>
      )}

      <div className={`${styles.message} ${isOwn ? styles.own : styles.other}`}>
        {!isOwn && showSender && (
          <div className={styles.senderInfo}>
            {message.senderAvatar && (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className={styles.avatar}
                onError={(e) => {
                  
                }}
              />
            )}
            <span className={styles.senderName}>{message.senderName}</span>
          </div>
        )}

        <div className={styles.contentWrapper}>
          {!isOwn && isFirstInGroup && (
            <div className={styles.messageCorner}>
              <div className={styles.corner}></div>
            </div>
          )}

          <div className={styles.messageContent}>
            {message.isDeleted ? (
              <div className={styles.deletedMessage}>
                <span className={styles.deletedIcon}>🗑️</span>
                <em>Сообщение удалено</em>
              </div>
            ) : (
              <>
                <div className={styles.text}>{message.content}</div>

                {message.file && (
                  <div className={styles.fileAttachment}>
                    <div className={styles.fileIcon}>📎</div>
                    <div className={styles.fileInfo}>
                      <a
                        href={message.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.fileName}
                      >
                        {message.file.name}
                      </a>
                      <span className={styles.fileSize}>
                        {(message.file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.messageFooter}>
            <span className={styles.time}>{formatTime(message.createdAt)}</span>

            {isOwn && status && (
              <div className={styles.statusIcons}>
                {message.isEdited && (
                  <span className={styles.editedIcon} title="Отредактировано">
                    ✏️
                  </span>
                )}
                <span
                  className={status.className}
                  title={status.title}
                  onClick={handleStatusClick}
                  style={{
                    color: status.color,
                    cursor: isOwn ? "pointer" : "default",
                  }}
                >
                  {status.icon}
                </span>
              </div>
            )}

            {/* Показываем количество прочитавших для чужих сообщений */}
            {!isOwn && readCount > 0 && (
              <div
                className={styles.readCount}
                title={`Прочитало ${readCount} человек`}
              >
                👁️ {readCount}
              </div>
            )}
          </div>

          {/* Индикатор "непрочитанное" для новых сообщений */}
          {!isOwn && !isReadByCurrentUser && (
            <div className={styles.unreadIndicator} title="Непрочитанное">
              <div className={styles.unreadDot}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;