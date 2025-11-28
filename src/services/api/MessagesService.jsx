// services/api/MessagesService.js
export default class MessageService {
    async sendMessage(content, targetUserId, chatId, file = null) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            console.log('📤 Отправка сообщения на: http://ravenapp.ru/api/messages/send');
            console.log('📝 Контент:', content);
            console.log('👥 TargetUserId:', targetUserId);
            console.log('💬 ChatId:', chatId);

            // Создаем FormData
            const formData = new FormData();
            formData.append('Content', content);
            
            if (targetUserId) {
                formData.append('TargetUserId', targetUserId);
            }
            
            if (chatId) {
                formData.append('ChatId', chatId);
            }
            
            if (file) {
                formData.append('File', file);
            }

            const response = await fetch('http://ravenapp.ru/api/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Не устанавливаем Content-Type для FormData!
                },
                body: formData
            });

            console.log('📨 Ответ сервера:', response.status, response.statusText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: response.statusText };
                }
                
                console.error('❌ Ошибка HTTP:', response.status, errorData);
                
                if (response.status === 404) {
                    throw new Error('Эндпоинт не найден. Проверьте URL.');
                } else if (response.status === 401) {
                    throw new Error('Не авторизован');
                } else {
                    throw new Error(errorData.message || `HTTP error ${response.status}`);
                }
            }

            const result = await response.json();
            console.log('✅ Сообщение успешно отправлено:', result);
            return result;

        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            throw error;
        }
    }
}

export const messageService = new MessageService();