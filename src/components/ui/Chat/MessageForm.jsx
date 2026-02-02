import React, { useState, useEffect, useRef } from "react";
import styles from "../../../styles/components/ui/Chat/MessageForm.module.css";
import { API_CONFIG } from "../../../services/config/config";
import { fileService } from "../../../services/api/FileService";

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
  console.log('🔍🔍🔍 КОМПОНЕНТ Message РЕНДЕРИТСЯ');
  console.log('Сообщение ID:', message.id);
  console.log('Контент:', message.content);
  console.log('Полная структура сообщения:', JSON.stringify(message, null, 2));
  
  // Проверь все возможные поля с файлом:
  console.log('Есть ли message.attachment?', message.attachment);
  console.log('Есть ли message.file?', message.file);
  console.log('Есть ли message.attachments?', message.attachments);
  console.log('Есть ли message.fileUrl?', message.fileUrl);
  console.log('Есть ли message.media?', message.media);
  const [isReadByCurrentUser, setIsReadByCurrentUser] = useState(
    message.isReadByCurrentUser || false
  );
  const [isDelivered, setIsDelivered] = useState(message.isDelivered || false);
  const [readCount, setReadCount] = useState(message.readCount || 0);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const messageRef = useRef(null);
  const hasBeenReadRef = useRef(false); // Флаг чтобы не отмечать дважды

  // Проверяем, содержит ли сообщение файл
  const hasFile =
    message.file || (message.attachments && message.attachments.length > 0);
  const file = message.file || (message.attachments && message.attachments[0]);

  // Извлекаем URL файла (может быть в тексте или нужно построить)
  const isFileMessage = () => {
    if (!message.content) return false;
    
    // Проверяем, содержит ли сообщение иконку файла + расширение файла
    const hasFileIcon = message.content.includes('📎') || 
                       message.content.includes('📝') || 
                       message.content.includes('📄') ||
                       message.content.includes('🖼️') ||
                       message.content.includes('🎬');
    
    const hasFileExtension = /\.(docx?|xlsx?|pptx?|pdf|txt|zip|rar|jpg|jpeg|png|gif|mp4|mp3|wav|ogg)$/i.test(message.content);
    
    return hasFileIcon && hasFileExtension;
  };

  // 🔥 Извлекаем имя файла из текста
  const extractFileName = () => {
    if (!message.content) return null;
    
    // Ищем паттерн: текст + .расширение
    const match = message.content.match(/[\w\s\-.,()]+\.\w{2,5}/i);
    return match ? match[0].trim() : null;
  };

  // 🔥 Пытаемся найти URL файла в тексте
  const extractFileUrl = () => {
    if (!message.content) return null;
    
    // Ищем медиассылку в тексте
    const mediaMatch = message.content.match(/mediamsg\/[^\s]+/i);
    if (mediaMatch) return mediaMatch[0];
    
    return null;
  };

  // 🔥 Получаем данные о файле
  const getFileInfo = () => {
    const fileName = extractFileName();
    if (!fileName) return null;
    
    const fileUrl = extractFileUrl();
    
    return {
      fileName: fileName,
      fileUrl: fileUrl,
      // Если нет URL, можем построить на основе имени (нужно договориться с сервером)
      downloadUrl: fileUrl ? `/api/files/download?fileUrl=${encodeURIComponent(fileUrl)}` : null,
      icon: fileService.getFileIcon(fileName),
      size: 0 // Размер неизвестен, так как его нет в сообщении
    };
  };

  const fileInfo = getFileInfo();
  const isFile = isFileMessage() && fileInfo;

  // 🔥 Обработчик клика по файлу
  const handleFileClick = () => {
    if (!fileInfo || !fileInfo.fileUrl) return;
    
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileInfo.fileName);
    const isPDF = /\.pdf$/i.test(fileInfo.fileName);
    
    if (isImage || isPDF) {
      fileService.openFileInNewTab(fileInfo.fileUrl);
    } else {
      fileService.downloadFile(fileInfo.fileUrl, fileInfo.fileName);
    }
  };

  // Определяем тип файла
  const isImage =
    file &&
    (file.type?.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name));
  const isPDF =
    file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name));
  const isVideo =
    file &&
    (file.type?.startsWith("video/") ||
      /\.(mp4|avi|mov|mkv)$/i.test(file.name));
  const isAudio =
    file &&
    (file.type?.startsWith("audio/") || /\.(mp3|wav|ogg)$/i.test(file.name));

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
    if (
      !messageRef.current ||
      isOwn ||
      isReadByCurrentUser ||
      hasBeenReadRef.current
    )
      return;

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
        rootMargin: "0px 0px -50px 0px", // Игнорируем нижние 50px (область ввода)
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
    )
      return;

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

  // Обработчик скачивания файла
  const handleDownloadFile = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!file || !file.url || isDownloading) return;

    setIsDownloading(true);
    try {
      await fileService.downloadFile(file.url, file.name);
    } catch (error) {
      console.error("Ошибка скачивания файла:", error);
      alert("Не удалось скачать файл");
    } finally {
      setIsDownloading(false);
    }
  };

  // Обработчик открытия файла (для изображений и PDF)
  const handleOpenFile = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!file || !file.url || isOpening) return;

    // Если это изображение или PDF, открываем в новой вкладке
    if (isImage || isPDF) {
      setIsOpening(true);
      try {
        await fileService.openFileInNewTab(file.url);
      } catch (error) {
        console.error("Ошибка открытия файла:", error);
        alert("Не удалось открыть файл");
      } finally {
        setIsOpening(false);
      }
    } else {
      // Для других файлов - скачиваем
      handleDownloadFile(e);
    }
  };

  // Функция для отображения превью изображения
  const renderImagePreview = () => {
    if (!isImage || !file.url) return null;

    return (
      <div className={styles.imagePreview} onClick={handleOpenFile}>
        <img
          src={file.url}
          alt={file.name}
          className={styles.previewImage}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentNode.classList.add(styles.noPreview);
          }}
        />
        {isOpening && <div className={styles.loadingOverlay}>🔄</div>}
      </div>
    );
  };

  // Функция для отображения информации о файле
  const renderFileInfo = () => {
    if (!file) return null;

    const fileIcon = fileService.getFileIcon(file.name);
    const formattedSize = fileService.formatFileSize(file.size || 0);

    return (
      <div className={styles.fileAttachment}>
        <div className={styles.fileIcon}>{fileIcon}</div>
        <div className={styles.fileInfo}>
          <div
            className={styles.fileName}
            onClick={isImage || isPDF ? handleOpenFile : handleDownloadFile}
            title={`${isImage || isPDF ? "Открыть" : "Скачать"}: ${file.name}`}
          >
            {file.name}
          </div>
          <span className={styles.fileSize}>{formattedSize}</span>
        </div>
        <div className={styles.fileActions}>
          {(isImage || isPDF) && (
            <button
              onClick={handleOpenFile}
              disabled={isOpening}
              className={styles.fileButton}
              title="Открыть"
            >
              {isOpening ? "🔄" : "👁️"}
            </button>
          )}

          <button
            onClick={handleDownloadFile}
            disabled={isDownloading}
            className={styles.fileButton}
            title="Скачать"
          >
            {isDownloading ? "🔄" : "⬇️"}
          </button>
        </div>
      </div>
    );
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
                  // Обработчик ошибки загрузки аватарки
                  e.target.style.display = "none";
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
                {/* Если сообщение содержит файл - показываем как файл */}
                {message.isDeleted ? (
              <div className={styles.deletedMessage}>
                <span className={styles.deletedIcon}>🗑️</span>
                <em>Сообщение удалено</em>
              </div>
            ) : isFile ? (
              // 🔥 ОТОБРАЖАЕМ КАК ФАЙЛ
              <div className={styles.fileAttachment}>
                <div className={styles.fileIcon}>
                  {fileInfo.icon}
                </div>
                <div className={styles.fileInfo}>
                  <div 
                    className={styles.fileName}
                    onClick={handleFileClick}
                    title={`${fileInfo.fileName}`}
                  >
                    {fileInfo.fileName}
                  </div>
                  {fileInfo.size > 0 && (
                    <div className={styles.fileSize}>
                      {fileService.formatFileSize(fileInfo.size)}
                    </div>
                  )}
                </div>
                {fileInfo.fileUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileService.downloadFile(fileInfo.fileUrl, fileInfo.fileName);
                    }}
                    className={styles.downloadBtn}
                    title="Скачать"
                  >
                    ⬇️
                  </button>
                )}
              </div>
            ) : (
              // Обычный текст
              <div className={styles.text}>{message.content}</div>
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
