import { useState } from "react";
import styles from "../../../styles/components/layout/CreateNewChatModal/CreateNewChatModal.module.css";
import { motion, AnimatePresence } from "framer-motion";

const CreateNewChatModal = ({ onClick }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [pageNum, setPageNum] = useState(1);

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const GetUsers = async () => {
    const { usersService } = await import("../../../services/api/UsersService");

    try {
      const UsersList = await usersService.GetAllUsers({
        page: pageNum,
        pageSize: 25,
        searchTerm: name,
      });
      setUsers(UsersList.users || []);
    } catch (error) {}
  };
  return (
    <div className={styles["add-newchat-window-container"]}>
      <motion.div
        className={styles["add-newchat-window"]}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles["newchat-main-content"]}>
          <h3>Создать новый чат</h3>
          <input
            className={styles["newchat-input-name"]}
            type="text"
            placeholder="Имя чата"
          />
          <p className={styles["newchat-chooseUsers-title"]}>
            Выберите пользователей
          </p>
          <input
            className={styles["newchat-input-name"]}
            type="text"
            placeholder="Имя пользователя"
            onChange={handleChangeName}
          />
          {users.map((user) => (
            <div key={user.id}>
              <p>{user.firstName}</p>
            </div>
          ))}
        </div>
        <div className={styles["newchat-buttons"]}>
          <button onClick={GetUsers}>Добавить в чат</button>
          <button onClick={onClick}>Закрыть</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateNewChatModal;
