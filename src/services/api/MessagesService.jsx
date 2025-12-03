// services/api/MessagesService.js
export default class MessageService {
    async sendMessage(content, targetUserId, chatId, file = null) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            console.log('📤 Отправка сообщения на: http://ravenapp.ru/api/messages/send');

            // Создаем URL с query параметром targetUserId
            let url = 'http://ravenapp.ru/api/messages/send';
            
            // Добавляем targetUserId как query параметр, если он есть
            if (targetUserId && targetUserId !== 'undefined' && targetUserId !== 'null') {
                url += `?targetUserId=${targetUserId}`;
            }
            
            console.log('🔗 Финальный URL:', url);

            // Создаем FormData
            const formData = new FormData();
            formData.append('Content', content);
            
            // ChatId передаем в FormData, если нужно
            if (chatId && chatId !== 'undefined' && chatId !== 'null') {
                formData.append('ChatId', chatId);
            }
            
            if (file) {
                formData.append('File', file);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            console.log('📨 Ответ сервера:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Ошибка сервера:', errorText);
                
                let errorMessage = `Ошибка ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Сообщение успешно отправлено:', result);
            return result;

        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            throw error;
        }
    }

    // Получение сообщений чата - ВАЖНЫЙ МЕТОД!
    async getMessages(chatId, page = 1, pageSize = 50) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            console.log('📨 Запрос сообщений для чата:', chatId);
            console.log('🔗 URL:', `http://ravenapp.ru/api/messages/${chatId}?page=${page}&pageSize=${pageSize}`);

            const response = await fetch(`http://ravenapp.ru/api/messages/${chatId}?page=${page}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('📨 Ответ сервера:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Ошибка HTTP:', errorText);
                
                // Если 404, возможно чат не существует или нет сообщений
                if (response.status === 404) {
                    return [];
                }
                
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Получены сообщения:', result);
            
            // Исходя из вашего контроллера, Result<T> возвращает Data
            if (result && result.isSuccess !== undefined) {
                // Если структура Result<T>
                return result.data || [];
            } else if (result && result.data !== undefined) {
                // Если структура { data: [...] }
                return result.data || [];
            } else if (Array.isArray(result)) {
                // Если просто массив
                return result;
            }
            
            console.warn('⚠️ Неизвестная структура ответа:', result);
            return [];
            
        } catch (error) {
            console.error('❌ Ошибка получения сообщений:', error);
            // Вместо выбрасывания ошибки возвращаем пустой массив
            return [];
        }
    }

    // Редактирование сообщения
    async editMessage(messageId, content) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            const response = await fetch(`http://ravenapp.ru/api/messages/edit/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка редактирования сообщения:', error);
            throw error;
        }
    }

    // Удаление сообщения
    async deleteMessage(messageId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            const response = await fetch(`http://ravenapp.ru/api/messages/delete/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка удаления сообщения:', error);
            throw error;
        }
    }

    // Поиск сообщений
    async searchMessages(chatId, searchTerm, page = 1, pageSize = 25) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            const response = await fetch(`http://ravenapp.ru/api/messages/search/${chatId}?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка поиска сообщений:', error);
            throw error;
        }
    }

    // Получение количества непрочитанных сообщений
    async getUnreadCount(chatId = null) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            let url = 'http://ravenapp.ru/api/messages/unread-count';
            if (chatId) {
                url += `?chatId=${chatId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения непрочитанных:', error);
            throw error;
        }
    }
}

export const messageService = new MessageService();