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
import CreateLocalChatModal from "../../components/layout/AddNewLocalChatModal/AddNewLocalChatModal";

const MainPage = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // состояние открытия настроек
  const [selectedChat, setSelectedChat] = useState(null); // состояния для компонента чата (для подсветки активного)
  const [chats, setChats] = useState([]); // массив чатов
  const [page, setPage] = useState(1); // страницы для пагинации
  const [hasMore, setHasMore] = useState(true); // я не знаю чё это
  const [loading, setLoading] = useState(false); // состояние для загрузки
  const [addNewChat, setAddNewChat] = useState(false); // состояние для открытия модального окна для создаия группового чата
  const [addButton, setAddButton] = useState(false); // состояние для откртыия панели с созданием чата и добавления в друзья
  const [addFrined, setAddFrined] = useState(false); // состояние для открытия модального окна для добавления в друзья
  const [search, setSearch] = useState(""); // состояние для поиска чатов
  const [pageNum, setPageNumb] = useState(1); // состояние для страниц на пагинацию
  const [filteredChats, setFilteredChats] = useState([]); // массив отфильтрованных чатов
  const [localChatIsOpen, setLocalChatIsOpen] = useState(false);

  const handleOpenSettingsWindow = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettingsWindow = () => {
    setIsSettingsOpen(false);
  };

  const handleChatClick = async (chat) => {
    // setSelectedChat(chat);

    try {
      const { authService } = await import("../../services/api/AuthService");
      authService.Logout();
    }
    catch{}
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
      setLoading(true); // устанавливаем загрузку
      const userData = { page, pageSize: 10 }; // переменная для пагинации
      const newChats = await chatsService.GetUserChats(userData); // запрос к серверу для получения данных о чатах

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

  useEffect(() => {
    loadChats();
  }, []);

  const loadMore = () => {
    setPage((prev) => prev + 1);
    loadChats(true);
  };

  const searchChats = (e) => {
    setSearch(e.target.value);
  };

  const openCreateLocalChatModal = (prev) => {
    setLocalChatIsOpen(prev => !prev);
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
        {localChatIsOpen && <CreateLocalChatModal onClick={openCreateLocalChatModal}/>}
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
              {chats.length === 0 && !loading ? (
                <div className={styles["no-chats-placeholder"]}>
                  <p>У вас нет чатов. Создайте новый!</p>
                  <button onClick={openCreateLocalChatModal}>Создать новый чат</button>
                </div>
              ) : (
                chats
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
                      onClick={() => handleChatClick(chat)}
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
