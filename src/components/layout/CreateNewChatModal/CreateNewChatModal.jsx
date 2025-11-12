import { useState } from "react";
import styles from "../../../styles/components/layout/CreateNewChatModal/CreateNewChatModal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "../../common/InputField/InputField";

const CreateNewChatModal = ({ onClick }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [infoIsOpen, setInfoIsOpen] = useState(false);

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handleOpenInfo = (prev) => {
    setInfoIsOpen((prev) => !prev);
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
        <div className={styles["add-newchat-window-header"]}>
          <p>Создание группового чата</p>
          <div onClick={onClick}>
            <svg
              width="25"
              height="25"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24.5349 4.48107C24.3875 4.33341 24.2125 4.21626 24.0198 4.13633C23.8271 4.0564 23.6205 4.01525 23.4119 4.01525C23.2033 4.01525 22.9967 4.0564 22.804 4.13633C22.6114 4.21626 22.4363 4.33341 22.289 4.48107L14.5 12.2541L6.71104 4.46514C6.56357 4.31767 6.3885 4.20069 6.19582 4.12089C6.00315 4.04108 5.79664 4 5.58809 4C5.37954 4 5.17303 4.04108 4.98035 4.12089C4.78768 4.20069 4.61261 4.31767 4.46514 4.46514C4.31767 4.61261 4.20069 4.78768 4.12089 4.98035C4.04108 5.17303 4 5.37954 4 5.58809C4 5.79664 4.04108 6.00315 4.12089 6.19582C4.20069 6.3885 4.31767 6.56357 4.46514 6.71104L12.2541 14.5L4.46514 22.289C4.31767 22.4364 4.20069 22.6115 4.12089 22.8042C4.04108 22.9969 4 23.2034 4 23.4119C4 23.6205 4.04108 23.827 4.12089 24.0196C4.20069 24.2123 4.31767 24.3874 4.46514 24.5349C4.61261 24.6823 4.78768 24.7993 4.98035 24.8791C5.17303 24.9589 5.37954 25 5.58809 25C5.79664 25 6.00315 24.9589 6.19582 24.8791C6.3885 24.7993 6.56357 24.6823 6.71104 24.5349L14.5 16.7459L22.289 24.5349C22.4364 24.6823 22.6115 24.7993 22.8042 24.8791C22.9969 24.9589 23.2034 25 23.4119 25C23.6205 25 23.827 24.9589 24.0196 24.8791C24.2123 24.7993 24.3874 24.6823 24.5349 24.5349C24.6823 24.3874 24.7993 24.2123 24.8791 24.0196C24.9589 23.827 25 23.6205 25 23.4119C25 23.2034 24.9589 22.9969 24.8791 22.8042C24.7993 22.6115 24.6823 22.4364 24.5349 22.289L16.7459 14.5L24.5349 6.71104C25.1401 6.10576 25.1401 5.08635 24.5349 4.48107Z"
                fill="#2C2E35"
              />
            </svg>
          </div>
        </div>
        <div className={styles["add-newchat-window-main"]}>
          <p>Название</p>
          <InputField/>
          <p>Описание</p>
          <InputField/>
          <div className={styles["add-newchat-window-privacy-container"]}>
            <div className={styles["add-newchat-window-privacy-text"]}>
              <p className={styles["add-newchat-window-privacy-text-head"]}>Приватная группа</p>
              <p className={styles["add-newchat-window-privacy-text-hint"]}>Пригласить в эту группу сможете только Вы</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateNewChatModal;

{
  /* <div className={styles["newchat-main-content"]}>
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
          <div
            className={styles["newchat-allusers"]}
            onClick={handleOpenInfo}
          ></div>
          {infoIsOpen && (
            <div className={styles["newchat-allusers-info"]}>
              {users.map((user) => (
                <div key={user.id}>
                  <p>{user.firstName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles["newchat-buttons"]}>
          <button onClick={GetUsers}>Добавить в чат</button>
          <button onClick={onClick}>Закрыть</button>
        </div> */
}
