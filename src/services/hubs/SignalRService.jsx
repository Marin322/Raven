// services/signalRService.js
import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    connect = async (token) => {
        try {
            console.log('🔄 Начинаем подключение SignalR...');
            
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('https://ravenapp.ru/chatHub', {
                    accessTokenFactory: () => token,
                    // Включаем все транспорты
                    skipNegotiation: false,
                    transport: signalR.HttpTransportType.WebSockets | 
                              signalR.HttpTransportType.ServerSentEvents | 
                              signalR.HttpTransportType.LongPolling
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Debug) // Включаем детальное логирование
                .build();

            // Регистрируем обработчики
            this.setupEventHandlers();

            console.log('🔄 Запускаем соединение...');
            await this.connection.start();
            
            this.isConnected = true;
            console.log('✅ SignalR успешно подключен!');
            
            // Регистрируем пользователя
            try {
                await this.connection.invoke('RegisterUser');
                console.log('✅ Пользователь зарегистрирован в хабе');
            } catch (regError) {
                console.warn('⚠️ Не удалось зарегистрировать пользователя:', regError);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Критическая ошибка подключения SignalR:', error);
            this.isConnected = false;
            
            // Детальный анализ ошибки
            if (error.message.includes('WebSocket failed to connect')) {
                console.error('🔧 Проблема: WebSocket не может подключиться к серверу');
                console.error('🔧 Возможные причины:');
                console.error('   - CORS не настроен на сервере');
                console.error('   - SignalR Hub не зарегистрирован');
                console.error('   - Проблемы с прокси/файрволом');
            }
            
            return false;
        }
    };

    setupEventHandlers = () => {
        // События чата
        this.connection.on('ReceiveMessage', (message) => {
            console.log('📨 Новое сообщение:', message);
            this.triggerEvent('ReceiveMessage', message);
        });

        this.connection.on('MessageUpdated', (message) => {
            console.log('✏️ Сообщение обновлено:', message);
            this.triggerEvent('MessageUpdated', message);
        });

        this.connection.on('MessageDeleted', (messageId) => {
            console.log('🗑️ Сообщение удалено:', messageId);
            this.triggerEvent('MessageDeleted', messageId);
        });

        this.connection.on('UserTyping', (data) => {
            console.log('⌨️ Пользователь печатает:', data);
            this.triggerEvent('UserTyping', data);
        });

        this.connection.on('UserStoppedTyping', (data) => {
            console.log('💤 Пользователь перестал печатать:', data);
            this.triggerEvent('UserStoppedTyping', data);
        });

        // Системные события
        this.connection.on('UserJoined', (data) => {
            console.log('👤 Пользователь присоединился:', data);
            this.triggerEvent('UserJoined', data);
        });

        this.connection.on('UserLeft', (data) => {
            console.log('👤 Пользователь вышел:', data);
            this.triggerEvent('UserLeft', data);
        });

        this.connection.on('Error', (error) => {
            console.error('❌ SignalR Error:', error);
            this.triggerEvent('Error', error);
        });

        // События подключения
        this.connection.onreconnecting((error) => {
            console.log('🔄 SignalR переподключается...', error);
            this.isConnected = false;
            this.triggerEvent('Reconnecting', error);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('✅ SignalR переподключен:', connectionId);
            this.isConnected = true;
            this.triggerEvent('Reconnected', connectionId);
        });

        this.connection.onclose((error) => {
            console.log('🔌 SignalR соединение закрыто', error);
            this.isConnected = false;
            this.triggerEvent('Disconnected', error);
        });
    };

    // ... остальные методы (on, off, triggerEvent, joinChat и т.д.) остаются без изменений
    eventHandlers = new Map();

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    triggerEvent(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Ошибка в обработчике ${event}:`, error);
                }
            });
        }
    }

    joinChat = async (chatId) => {
        if (this.isConnected && this.connection) {
            try {
                await this.connection.invoke('JoinChat', chatId);
                console.log(`✅ Присоединились к чату ${chatId}`);
            } catch (error) {
                console.error(`❌ Ошибка присоединения к чату ${chatId}:`, error);
            }
        }
    };

    leaveChat = async (chatId) => {
        if (this.isConnected && this.connection) {
            try {
                await this.connection.invoke('LeaveChat', chatId);
                console.log(`✅ Покинули чат ${chatId}`);
            } catch (error) {
                console.error(`❌ Ошибка выхода из чата ${chatId}:`, error);
            }
        }
    };

    startTyping = async (chatId) => {
        if (this.isConnected && this.connection) {
            try {
                await this.connection.invoke('SendTypingIndicator', chatId, true);
            } catch (error) {
                console.error('Ошибка отправки индикатора печати:', error);
            }
        }
    };

    stopTyping = async (chatId) => {
        if (this.isConnected && this.connection) {
            try {
                await this.connection.invoke('SendTypingIndicator', chatId, false);
            } catch (error) {
                console.error('Ошибка остановки индикатора печати:', error);
            }
        }
    };

    sendTestMessage = async (message) => {
        if (this.isConnected && this.connection) {
            try {
                await this.connection.invoke('SendTestMessage', message);
                console.log('✅ Тестовое сообщение отправлено');
            } catch (error) {
                console.error('❌ Ошибка отправки тестового сообщения:', error);
            }
        }
    };

    disconnect = async () => {
        if (this.connection) {
            await this.connection.stop();
            this.isConnected = false;
            console.log('🔌 SignalR отключен');
        }
    };

    getStatus = () => {
        return {
            isConnected: this.isConnected,
            connectionState: this.connection ? this.connection.state : 'Disconnected'
        };
    };
}

export default new SignalRService();