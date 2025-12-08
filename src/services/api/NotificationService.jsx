// services/notificationService.js
class NotificationService {
    constructor() {
        this.permission = null;
        this.isSupported = 'Notification' in window;
        this.init();
    }

    async init() {
        if (!this.isSupported) return;
        
        this.permission = Notification.permission;
        
        if (this.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
                console.log('🔔 Разрешение на уведомления:', this.permission);
            } catch (error) {
                console.error('❌ Ошибка запроса разрешения:', error);
            }
        }
    }

    async requestPermission() {
        if (!this.isSupported) return false;
        
        try {
            this.permission = await Notification.requestPermission();
            return this.permission === 'granted';
        } catch (error) {
            console.error('❌ Ошибка запроса разрешения:', error);
            return false;
        }
    }

    showNewMessageNotification(message) {
        if (!this.isSupported || this.permission !== 'granted') return null;
        
        // Не показываем уведомление если вкладка активна
        if (document.hasFocus()) return null;
        
        // Не показываем уведомление для активного чата
        const activeChatId = window.location.hash.replace('#chat-', '');
        if (activeChatId === message.chatId) return null;

        const title = `💬 ${message.senderName}`;
        const options = {
            body: message.content.length > 100 
                ? message.content.substring(0, 100) + '...' 
                : message.content,
            icon: message.senderAvatar || '/default-avatar.png',
            tag: 'chat-message',
            renotify: true,
            silent: false
        };

        const notification = new Notification(title, options);

        notification.onclick = () => {
            window.focus();
            notification.close();
            
            // Навигация к чату
            if (message.chatId) {
                window.location.hash = `#chat-${message.chatId}`;
            }
        };

        setTimeout(() => notification.close(), 5000);
        
        return notification;
    }

    playNotificationSound() {
        try {
            // Используем встроенный звук или создаем свой
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('🔇 Не удалось воспроизвести звук:', error);
        }
    }

    getStatus() {
        return {
            isSupported: this.isSupported,
            permission: this.permission,
            hasPermission: this.isSupported && this.permission === 'granted'
        };
    }
}

export default new NotificationService();