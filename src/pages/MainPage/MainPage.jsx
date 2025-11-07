import styles from "./MainPage.module.css";
import BurgerMenuBtn from "../../components/common/Buttons/BurgerMenu/BurgerMenu";
import { useEffect, useState } from "react";
import SearchField from "../../components/common/SearchField/SearchField";
import ChatUi from "../../components/ui/Chat/ChatUi";
import CreateNewChatModal from "../../components/layout/CreateNewChatModal/CreateNewChatModal";
import ThemeToggle from "../../components/common/ThemeToggle/ThemeToggle";
import AboutChat from "./AboutChat";
import logo from "../../logo.svg";
import { AnimatePresence } from "framer-motion";
import AddFriendModal from "../../components/layout/AddFrinedModal/AddFriendModal";
import SettingsWindow from "../../components/layout/SettingsWindow/SettingsWindow";

const MainPage = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addNewChat, setAddNewChat] = useState(false);
  const [addButton, setAddButton] = useState(false);
  const [addFrined, setAddFrined] = useState(false);
  const [search, setSearch] = useState("");
  const [pageNum, setPageNumb] = useState(1);
  const [filteredChats, setFilteredChats] = useState([]);

  const handleOpenSettingsWindow = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettingsWindow = () => {
    setIsSettingsOpen(false);
  };

  const handleChatClock = (chat) => {
    setSelectedChat(chat);

    // try {
    //   const { authService } = await import("../../services/api/AuthService");
    //   authService.Logout();
    // }
    // catch{}
  };

  const handleAddNewChat = (prev) => {
    setAddNewChat((prev) => !prev);
  };

  const handleAddNewFrined = (prev) => {
    setAddFrined((prev) => !prev);
  };

  const handleAddButtonClick = (prev) => {
    setAddButton((prev) => !prev);
  };

  const loadChats = async (append = false) => {
    const { chatsService } = await import("../../services/api/ChatsService");
    try {
      setLoading(true);
      const userData = { page, pageSize: 10 };
      const newChats = await chatsService.GetUserChats(userData);

      if (append) {
        setChats((prev) => [...prev, ...newChats]);
      } else {
        setChats(newChats);
      }

      setHasMore(newChats.length === 10);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { usersService } = await import("../../services/api/UsersService");

    try {
      const UsersList = await usersService.GetAllUsers({
        page: pageNum,
        pageSize: 25,
        searchTerm: search,
      });
      setFilteredChats(UsersList.users || []);
    } catch (error) {}
  };

  useEffect(() => {
    if (filteredChats.length === 0 && search.trim() !== "") {
      loadUsers(search);
    } else {
      setChats([]);
    }
  }, [filteredChats, search]);

  // useEffect(() => {
  //   loadChats();
  // }, []);

  const loadMore = () => {
    setPage((prev) => prev + 1);
    loadChats(true);
  };

  const searchChats = (e) => {
    setSearch(e.target.value);
  };

  const chats2 = [
    {
      id: 1,
      img: logo,
      name: "Kacher Twink",
      time: "19:49",
      msgText: "Окей, вчера полная помойка",
    },
    {
      id: 2,
      img: logo,
      name: "James Wilson",
      time: "19:03",
      msgText: "Тб мне нужно файл E..",
    },
    {
      id: 3,
      img: logo,
      name: "Joseph Stalin",
      time: "18:42",
      msgText: "Мой танк уже в тёплой пол окно...",
    },
  ];
  return (
    <div className={styles["mainPage-container"]}>
      <AnimatePresence>
        {addNewChat && <CreateNewChatModal onClick={handleAddNewChat} />}
        {addFrined && <AddFriendModal onClick={handleAddNewFrined} />}
        {isSettingsOpen && (
          <SettingsWindow onClick={handleCloseSettingsWindow} />
        )}
      </AnimatePresence>
      <div className={styles["chatsList-container"]}>
        <div className={styles["logo-menu"]}>
          <p>
            <ThemeToggle />
            <b>Raven Chat</b>
          </p>
          <div className={styles["logo-menu-burger"]}>
            <BurgerMenuBtn
              isOpen={isSettingsOpen}
              onClick={handleOpenSettingsWindow}
            />
          </div>
        </div>
        <div className={styles["searchField-container"]}>
          <SearchField onChange={searchChats} />
        </div>
        <div className={styles["chatsUi-container"]}>
          {!addButton ? (
            <div className={styles["chats-container"]}>
              {loading && <div className={styles.loader}></div>}
              {chats2.length === 0 && !loading ? (
                <div className={styles["no-chats-placeholder"]}>
                  <p>У вас нет чатов. Создайте новый!</p>
                </div>
              ) : (
                chats2
                  .filter((chat) =>
                    chat.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((chat) => (
                    <ChatUi
                      key={chat.id}
                      img={chat.img}
                      name={chat.name}
                      time={chat.time}
                      msgText={chat.msgText}
                      isSelected={selectedChat === chat.id}
                      onClick={() => handleChatClock(chat)}
                    />
                  ))
              )}
            </div>
          ) : (
            <div className={styles["chats-container"]}>
              <button
                className={styles["chatsAddButtons"]}
                onClick={handleAddNewChat}
              >
                Создать групповой чат
              </button>
              <button
                className={styles["chatsAddButtons"]}
                onClick={handleAddNewFrined}
              >
                Добавить друга
              </button>
            </div>
          )}
          <div className={styles["add-newchat"]} onClick={handleAddButtonClick}>
            <button className={styles["add-newchat-btn"]}>+</button>{" "}
          </div>
        </div>
      </div>
      <div className={styles["chat-container"]}>
        <div className={styles["aboutchat-container"]}>
          {selectedChat &&(
            <AboutChat avatar={selectedChat.img} name={selectedChat.name} isOnline={true} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
