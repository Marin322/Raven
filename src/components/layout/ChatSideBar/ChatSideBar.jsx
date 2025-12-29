import { useEffect, useState } from 'react';
import styles from '../../../styles/components/layout/ChatSideBar/ChatSideBar.module.css';

const ChatSideBar = ({ chatId }) => {
    const [chatInfo, setChatInfo] = useState(null);

    useEffect(() => {
        GetChatInfo();
        console.log(chatInfo)
    }, []);

    const GetChatInfo = async () => {
        const { chatsService } = await import('../../../services/api/ChatsService');
        try {
            const chatInfo = await chatsService.GetChatInfo(chatId)
            setChatInfo(chatInfo);
        }
        catch {}
    }

    return (
        <div>
            {chatInfo && (
                <div>{chatInfo.name}</div>
            )}
        </div>
    );
};

export default ChatSideBar;