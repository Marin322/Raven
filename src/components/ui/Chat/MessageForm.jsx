import styles from "../../../styles/components/ui/Chat/MessageForm.module.css";

// components/ui/Message/Message.jsx
import React from "react";

const Message = ({
  message,
  isOwn,
  showSender = true,
  isFirstInGroup = true,
  isLastInGroup = true,
}) => {
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

  return (
    <div
      className={`${styles.messageContainer} ${isOwn ? styles.ownMessage : ""}`}
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

            {isOwn && (
              <div className={styles.statusIcons}>
                {message.isEdited && (
                  <span className={styles.editedIcon} title="Отредактировано">
                    ✏️
                  </span>
                )}
                {message.isRead ? (
                  <span className={styles.readIcon} title="Прочитано">
                    ✓✓
                  </span>
                ) : message.isDelivered ? (
                  <span className={styles.deliveredIcon} title="Доставлено">
                    ✓
                  </span>
                ) : (
                  <span className={styles.sentIcon} title="Отправлено">
                    ⏱️
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
