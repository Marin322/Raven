import styles from "./AboutChat.module.css";

const AboutChat = ({ avatar, name, isOnline, onClick }) => {
  return (
    <div className={styles["aboutchat-container"]}>
      <div className={styles["aboutchat-user-container"]}>
        <div className={styles["aboutchat-avatar"]}>
        <img src={avatar} alt="" />
        </div>
      <div className={styles["aboutchat-name"]}>
        <p>{name}</p>
      </div>
      <div className={styles["aboutchat-status-container"]}>
        <div
          className={
            isOnline
              ? styles["aboutchat-status-online"]
              : styles["aboutchat-status-ofline"]
          }
        ></div>
        {isOnline ? <p>В сети</p> : <p>Не в сети</p>}
      </div>
      </div>
     <div className={styles["aboutchat-sidebar-btn"]}>
        <button onClick={onClick}>···</button>
     </div>
    </div>
  );
};

export default AboutChat;
