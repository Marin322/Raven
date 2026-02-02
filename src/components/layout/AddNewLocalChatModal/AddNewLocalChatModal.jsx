import { useState } from "react";
import styles from "../../../styles/components/layout/AddNewLocalChatModal/AddNewLocalChatModal.module.css";
import { motion } from "framer-motion";

const CreateLocalChatModal = ({ onClick, onSelectUser }) => {
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null); // ← Добавлено

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const GetUsers = async () => {
    const { usersService } = await import("../../../services/api/UsersService");

    try {
      setUsers([]);
      const UsersList = await usersService.GetAllUsers({
        page: pageNum,
        pageSize: 25,
        searchTerm: userName,
      });
      const newUsers = UsersList.users || [];

      setUsers((prevUsers) => {
        const existingIds = new Set(prevUsers.map((user) => user.id));
        const filteredNewUsers = newUsers.filter(
          (user) => !existingIds.has(user.id)
        );
        return [...prevUsers, ...filteredNewUsers];
      });
      setUserName("");
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ← Новый: выбор пользователя
  const toggleUser = (user) => {
    setSelectedUser((prev) => (prev?.id === user.id ? null : user));
  };

  const handleGoToChat = async () => {
    if (selectedUser) {
      const { chatsService } = await import("../../../services/api/ChatsService");
      try {
        chatsService.CreatePersonalChat(selectedUser.id);
      }
      catch{};
      const chatData = {
        id: `${selectedUser.id}`,
        name: `${selectedUser.firstName} ${selectedUser.lastName || ""}`.trim(),
        avatar: selectedUser.avatarUrl,
        isOnline: selectedUser.isOnline,
      };
      onSelectUser(chatData);
      onClick();
    }
  };

  return (
    <div className={styles["create-localchat-blur"]}>
      <motion.div
        className={styles["create-localchat-window"]}
        initial={{ y: "200%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "200%", opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles["create-localchat-container"]}>
          <div className={styles["create-localchat-header"]}>
            <p className="text-text-heading">Найдите собеседника</p>
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

          <div className={styles["create-localchat-main"]}>
            <div className={styles["create-localchat-main-inputfield"]}>
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.50019 10C5.50019 9.40905 5.61658 8.82389 5.84273 8.27792C6.06887 7.73196 6.40034 7.23588 6.8182 6.81802C7.23607 6.40016 7.73214 6.06869 8.27811 5.84254C8.82408 5.6164 9.40924 5.5 10.0002 5.5C10.5911 5.5 11.1763 5.6164 11.7223 5.84254C12.2682 6.06869 12.7643 6.40016 13.1822 6.81802C13.6 7.23588 13.9315 7.73196 14.1576 8.27792C14.3838 8.82389 14.5002 9.40905 14.5002 10C14.5002 11.1935 14.0261 12.3381 13.1822 13.182C12.3383 14.0259 11.1937 14.5 10.0002 14.5C8.80671 14.5 7.66212 14.0259 6.8182 13.182C5.97429 12.3381 5.50019 11.1935 5.50019 10ZM10.0002 2.5C8.83068 2.50012 7.67742 2.77374 6.63251 3.299C5.58759 3.82426 4.68 4.5866 3.98222 5.52512C3.28443 6.46365 2.8158 7.55235 2.61375 8.70427C2.4117 9.85619 2.48184 11.0394 2.81856 12.1594C3.15528 13.2794 3.74925 14.3051 4.55302 15.1546C5.35679 16.0041 6.3481 16.6539 7.44774 17.052C8.54739 17.4502 9.72491 17.5856 10.8862 17.4476C12.0476 17.3095 13.1605 16.9018 14.1362 16.257L18.9392 21.061C19.2206 21.3424 19.6022 21.5005 20.0002 21.5005C20.3981 21.5005 20.7798 21.3424 21.0612 21.061C21.3426 20.7796 21.5007 20.398 21.5007 20C21.5007 19.602 21.3426 19.2204 21.0612 18.939L16.2572 14.136C17.0045 13.0056 17.4315 11.6939 17.493 10.3402C17.5545 8.98652 17.248 7.64148 16.6063 6.44801C15.9645 5.25454 15.0114 4.25724 13.8482 3.56209C12.685 2.86694 11.3553 2.49991 10.0002 2.5Z"
                  fill="#7B818A"
                />
              </svg>
              <input
                placeholder="Введите @username..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    GetUsers();
                  }
                }}
                onChange={handleChangeUserName}
              />
            </div>

            {/* ← Список пользователей — кликабельный */}
            <div
              className={styles["create-localchat-main-addedusers-container"]}
            >
              {users.map((user) => (
                <div
                  className={`${styles["create-localchat-main-addedusers"]} ${
                    selectedUser?.id === user.id ? styles.selected : ""
                  }`}
                  key={user.id}
                  onClick={() => toggleUser(user)} // ← Выбор по клику
                >
                  <img alt="" src={user.avatarUrl} className="w-8 h-8 rounded-3xl mr-2" />
                  <p>{user.firstName}</p>
                  {selectedUser?.id === user.id && (
                    <span style={{ marginLeft: "8px", color: "#4CAF50" }}>
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ← Кнопка вызывает handleGoToChat */}
            <button
              className={styles["create-localchat-main-createbtn"]}
              onClick={handleGoToChat}
              disabled={!selectedUser}
            >
              Перейти в чат
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateLocalChatModal;
