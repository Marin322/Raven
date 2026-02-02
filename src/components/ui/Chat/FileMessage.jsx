import styles from '../../../styles/components/ui/Chat/FileMessage.module.css';

// components/ui/Chat/FileMessage.jsx
import React, { useState } from 'react';
import { fileService } from '../../../services/api/FileService';

const FileMessage = ({ file, isOwn = false }) => {
  const { name, url, size, type } = file;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Определяем тип файла для отображения
  const isImage = type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name);
  const isPDF = type === 'application/pdf' || /\.pdf$/i.test(name);
  const isVideo = type?.startsWith('video/') || /\.(mp4|avi|mov|mkv)$/i.test(name);
  const isAudio = type?.startsWith('audio/') || /\.(mp3|wav|ogg)$/i.test(name);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      await fileService.downloadFile(url, name);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      alert('Не удалось скачать файл');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpen = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOpening) return;
    
    // Если это изображение или PDF, открываем в новой вкладке
    if (isImage || isPDF) {
      setIsOpening(true);
      try {
        await fileService.openFileInNewTab(url);
      } catch (error) {
        console.error('Ошибка открытия файла:', error);
        alert('Не удалось открыть файл');
      } finally {
        setIsOpening(false);
      }
    } else {
      // Для других файлов - скачиваем
      handleDownload(e);
    }
  };

  // Получаем иконку файла
  const fileIcon = fileService.getFileIcon(name);
  const formattedSize = fileService.formatFileSize(size);

  // Отображаем превью для изображений
  const renderPreview = () => {
    if (isImage) {
      return (
        <div className={styles.filePreview}>
          <img 
            src={url} 
            alt={name}
            onClick={handleOpen}
            className={styles.previewImage}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${styles.fileMessage} ${isOwn ? styles.own : styles.other}`}>
      {renderPreview()}
      
      <div className={styles.fileInfo} onClick={isImage ? handleOpen : handleDownload}>
        <div className={styles.fileIcon}>{fileIcon}</div>
        <div className={styles.fileDetails}>
          <div className={styles.fileName}>{name}</div>
          <div className={styles.fileSize}>{formattedSize}</div>
        </div>
      </div>
      
      <div className={styles.fileActions}>
        {(isImage || isPDF) && (
          <button 
            onClick={handleOpen} 
            disabled={isOpening}
            className={styles.fileButton}
            title="Открыть"
          >
            {isOpening ? '🔄' : '👁️'}
          </button>
        )}
        
        <button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className={styles.fileButton}
          title="Скачать"
        >
          {isDownloading ? '🔄' : '⬇️'}
        </button>
      </div>
    </div>
  );
};

export default FileMessage;