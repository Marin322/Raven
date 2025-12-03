import styles from "../../../styles/components/ui/Chat/ChatUi.module.css";
const ChatUi = ({ img, name, time, msgText, isSelected, onClick }) => {
  return (
    <button
      className={`${styles["chatui-container"]} ${
        isSelected ? styles.selected : ""
      }`}
      onClick={onClick}
    >
      <div className={styles["avatar-container"]}>
        <img src={img} alt=""/>
      </div>
      <div className={styles["main-container"]}>
        <div className={styles["msg-container"]}>
          <div>{name}</div>
          <div className={styles["msg-time"]}>{time}</div>
        </div>
        <div className={styles["msg-text"]}>{msgText}</div>
      </div>
    </button>
  );
};

export default ChatUi;
