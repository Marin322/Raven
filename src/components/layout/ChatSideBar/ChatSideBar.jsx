import { useEffect, useState } from "react";
import styles from "../../../styles/components/layout/ChatSideBar/ChatSideBar.module.css";

const ChatSideBar = ({ chatId }) => {
  const [chatInfo, setChatInfo] = useState(null);

  useEffect(() => {
    GetChatInfo();
    console.log(chatInfo);
  }, []);

  const GetChatInfo = async () => {
    const { chatsService } = await import("../../../services/api/ChatsService");
    try {
      const chatInfo = await chatsService.GetChatInfo(chatId);
      setChatInfo(chatInfo);
    } catch {}
  };

  return (
    <div className={styles["chatSideBar-container"]}>
      {chatInfo && (
        <div className="w-full h-full flex items-center flex-col p-3">
          <div className={styles["chatSideBar-avatar"]}>
            <img />
            <a>{chatInfo.name}</a>
          </div>
          <div className={styles["chatSideBar-desc"]}>{chatInfo.description}</div>
        </div>
      )}
    </div>
  );
};

export default ChatSideBar;
