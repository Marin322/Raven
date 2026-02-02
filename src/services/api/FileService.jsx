// services/api/FileService.js
import { API_CONFIG } from "../config/config";

class FileService {
  // Загрузка файла - ОСНОВНОЙ МЕТОД
  async uploadFile(file, chatId) {
    try {
      console.log(`📤 Начинаем загрузку файла: ${file.name}`);
      console.log(`💬 ID чата: ${chatId}`);
      console.log(`📊 Размер файла: ${this.formatFileSize(file.size)}`);
      console.log(`📝 Тип файла: ${file.type}`);

      // Создаем FormData с правильными именами полей
      const formData = new FormData();
      
      // ВАЖНО: имена полей должны точно совпадать с DTO на сервере!
      // DTO: public IFormFile File { get; set; }
      // DTO: public Guid ChatId { get; set; }
      formData.append('File', file); // ТОЧНО "File" с большой буквы
      formData.append('ChatId', chatId.toString()); // ТОЧНО "ChatId" с большой буквы, преобразуем в строку
      
      // НЕ добавляем UserId - он берется из токена на сервере!

      // Логируем содержимое FormData для отладки
      console.log('📋 Содержимое FormData:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.FILES.UPLOAD}`;
      console.log(`🌐 URL запроса: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // НЕ указываем Content-Type - браузер сам установит multipart/form-data с boundary
        },
        body: formData
      });

      console.log(`📡 Ответ сервера: ${response.status} ${response.statusText}`);

      // Пробуем получить ответ как текст для дебага
      let responseText;
      try {
        responseText = await response.text();
        console.log('📄 Ответ сервера (текст):', responseText.substring(0, 500)); // Ограничиваем длину
      } catch (e) {
        responseText = 'Не удалось прочитать ответ сервера';
        console.error('❌ Ошибка чтения ответа:', e);
      }

      if (!response.ok) {
        console.error('❌ Ошибка загрузки. Детали ответа:', responseText);
        
        let errorMessage;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.Message || responseText;
        } catch {
          errorMessage = responseText || `HTTP ${response.status}`;
        }
        
        throw new Error(`Ошибка загрузки файла: ${errorMessage}`);
      }

      // Парсим успешный ответ
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.warn('⚠️ Ответ не в формате JSON, пытаемся обработать:', responseText);
        // Если сервер вернул не JSON, создаем структуру вручную
        result = {
          fileUrl: responseText,
          fileName: file.name,
          fileSize: file.size,
          message: 'Файл успешно загружен'
        };
      }

      console.log('✅ Файл успешно загружен! Результат:', result);
      return result;

    } catch (error) {
      console.error('❌ Критическая ошибка в uploadFile:', error);
      
      // Более информативное сообщение об ошибке
      let userMessage;
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Ошибка сети. Проверьте подключение к интернету';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        userMessage = 'Ошибка авторизации. Пожалуйста, войдите заново';
      } else if (error.message.includes('413')) {
        userMessage = 'Файл слишком большой. Максимальный размер: 100MB';
      } else if (error.message.includes('415')) {
        userMessage = 'Неподдерживаемый тип файла';
      } else {
        userMessage = error.message || 'Неизвестная ошибка при загрузке файла';
      }
      
      throw new Error(userMessage);
    }
  }

  // Альтернативный метод для сложных случаев
  async uploadFileWithDebug(file, chatId) {
    console.group('🔍 ДЕТАЛЬНАЯ ОТЛАДКА ЗАГРУЗКИ ФАЙЛА');
    
    try {
      // 1. Проверка входных данных
      console.log('1️⃣ Проверка данных:');
      console.log('- Файл:', file);
      console.log('- Имя файла:', file.name);
      console.log('- Размер:', file.size, 'байт');
      console.log('- MIME тип:', file.type);
      console.log('- ChatId:', chatId);
      console.log('- Тип ChatId:', typeof chatId);

      // 2. Проверка GUID формата
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidGuid = guidRegex.test(chatId);
      console.log('2️⃣ Проверка GUID формата:', isValidGuid ? '✅ Валидный' : '❌ Невалидный');

      if (!isValidGuid) {
        throw new Error(`Неверный формат ChatId: ${chatId}. Ожидается GUID формат.`);
      }

      // 3. Подготовка FormData
      console.log('3️⃣ Подготовка FormData:');
      const formData = new FormData();
      
      // Пробуем разные варианты имен полей
      const fieldVariants = [
        ['File', file],
        ['file', file],
        ['ChatId', chatId],
        ['chatId', chatId],
        ['chat_id', chatId]
      ];

      // Используем только первый вариант (как в DTO)
      formData.append('File', file);
      formData.append('ChatId', chatId);

      console.log('📋 Отправляемые поля FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // 4. Подготовка заголовков
      console.log('4️⃣ Подготовка заголовков:');
      const token = localStorage.getItem('token');
      console.log('- Токен:', token ? `Есть (${token.substring(0, 20)}...)` : '❌ Отсутствует');

      if (!token) {
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите в систему.');
      }

      // 5. Отправка запроса
      console.log('5️⃣ Отправка запроса...');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.FILES.UPLOAD}`;
      console.log('- URL:', url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 6. Обработка ответа
      console.log('6️⃣ Обработка ответа:');
      console.log('- HTTP статус:', response.status, response.statusText);
      console.log('- Заголовки ответа:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });

      const responseText = await response.text();
      console.log('- Тело ответа:', responseText);

      if (!response.ok) {
        console.error('❌ Сервер вернул ошибку');
        
        // Пробуем распарсить ошибку
        let errorDetail;
        try {
          const errorJson = JSON.parse(responseText);
          errorDetail = JSON.stringify(errorJson, null, 2);
        } catch {
          errorDetail = responseText;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorDetail}`);
      }

      // 7. Парсинг успешного ответа
      console.log('7️⃣ Парсинг успешного ответа:');
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('- JSON парсинг: ✅ Успешно');
      } catch (e) {
        console.warn('- JSON парсинг: ⚠️ Не удалось, создаем объект вручную');
        result = {
          fileUrl: responseText.trim(),
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
          rawResponse: responseText
        };
      }

      console.log('8️⃣ Результат:', result);
      console.groupEnd();
      
      return result;

    } catch (error) {
      console.error('❌ Ошибка в процессе загрузки:', error);
      console.groupEnd();
      
      // Перебрасываем ошибку дальше
      throw error;
    }
  }

  // Скачивание файла
  async downloadFile(fileUrl, fileName = null) {
    try {
      console.log(`📥 Скачивание файла: ${fileUrl}`);
      
      const token = localStorage.getItem('token');
      
      // Кодируем URL параметр
      const encodedUrl = encodeURIComponent(fileUrl);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.FILES.DOWNLOAD}?fileUrl=${encodedUrl}`;
      
      console.log(`🌐 URL запроса: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      console.log(`📡 Ответ: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка скачивания: ${response.status} - ${errorText}`);
      }

      // Получаем blob
      const blob = await response.blob();
      
      // Получаем имя файла
      let finalFileName = fileName;
      if (!finalFileName) {
        finalFileName = this.getFileNameFromUrl(fileUrl);
      }
      
      // Создаем ссылку для скачивания
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = finalFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Освобождаем память
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        console.log('✅ Память освобождена');
      }, 100);

      console.log(`✅ Файл скачан: ${finalFileName} (${blob.size} байт)`);
      return { 
        success: true, 
        fileName: finalFileName,
        fileSize: blob.size
      };

    } catch (error) {
      console.error('❌ Ошибка скачивания файла:', error);
      throw error;
    }
  }

  // Получение временной ссылки
  async getPresignedUrl(fileUrl, expirySeconds = 3600) {
    try {
      const token = localStorage.getItem('token');
      
      const encodedUrl = encodeURIComponent(fileUrl);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.FILES.PRESIGNED_URL}?fileUrl=${encodedUrl}&expirySeconds=${expirySeconds}`;
      
      console.log(`🌐 Запрос временной ссылки: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения ссылки: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Временная ссылка получена');
      return result;

    } catch (error) {
      console.error('❌ Ошибка получения временной ссылки:', error);
      throw error;
    }
  }

  // Открытие файла в новой вкладке (для изображений и PDF)
  async openFileInNewTab(fileUrl) {
    try {
      const result = await this.getPresignedUrl(fileUrl, 3600);
      if (result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
        return { success: true };
      }
      throw new Error('Не удалось получить ссылку на файл');
    } catch (error) {
      console.error('❌ Ошибка открытия файла:', error);
      throw error;
    }
  }

  // Вспомогательные методы
  getFileNameFromUrl(url) {
    if (!url) return 'file';
    const decoded = decodeURIComponent(url);
    return decoded.split('/').pop().split('?')[0] || 'file';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileName) {
    const extension = (fileName || '').split('.').pop().toLowerCase();
    
    const icons = {
      // Документы
      'pdf': '📄',
      'doc': '📝', 'docx': '📝',
      'txt': '📃',
      'rtf': '📋',
      
      // Таблицы
      'xls': '📊', 'xlsx': '📊', 'csv': '📊',
      
      // Презентации
      'ppt': '📽️', 'pptx': '📽️',
      
      // Архивы
      'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️', 'tar': '🗜️', 'gz': '🗜️',
      
      // Изображения
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
      
      // Видео
      'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬',
      
      // Аудио
      'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵',
      
      // По умолчанию
      'default': '📎'
    };
    
    return icons[extension] || icons['default'];
  }

  // Проверка допустимости типа файла
  isFileTypeAllowed(file) {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ];

    const allowedExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|pdf|txt|doc|docx|xls|xlsx|ppt|pptx|mp4|avi|mov|mkv|mp3|wav|ogg|zip|rar|7z)$/i;

    return allowedTypes.includes(file.type) || allowedExtensions.test(file.name);
  }

  // Получение максимального размера файла
  getMaxFileSize() {
    return 100 * 1024 * 1024; // 100MB (как на сервере для messages)
  }
}

export const fileService = new FileService();