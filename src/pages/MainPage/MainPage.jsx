import styles from "./MainPage.module.css";
import BurgerMenuBtn from "../../components/common/Buttons/BurgerMenu/BurgerMenu";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSignalR } from "../../hooks/useSignalR";
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
import Message from "../../components/ui/Chat/MessageForm";
import { initializationThemeFun } from "../../functions/ThemeFun";
import ChatSideBar from "../../components/layout/ChatSideBar/ChatSideBar";
import { fileService } from "../../services/api/FileService";

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
  const [chatInfo, setChatInfo] = useState(false);
  const [userStatus, setUserStatus] = useState();
  const fileInputRef = useRef(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const {
    isConnected,
    messages,
    typingUsers,
    startTyping,
    stopTyping,
    loadingMessages,
    loadingMore,
    hasMoreMessages,
    messagesContainerRef,
    sendMessage,
    loadMoreMessages,
  } = useSignalR(selectedChat?.id);

  const currentUserId = localStorage.getItem("userid");
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
  
    if (!selectedChat) {
      alert('Сначала выберите чат');
      return;
    }
  
    // Фильтруем файлы
    const validFiles = files.filter(file => {
      if (file.size > fileService.getMaxFileSize()) {
        alert(`Файл "${file.name}" слишком большой. Максимальный размер: ${fileService.formatFileSize(fileService.getMaxFileSize())}`);
        return false;
      }
      if (!fileService.isFileTypeAllowed(file)) {
        alert(`Файл "${file.name}" имеет неподдерживаемый формат`);
        return false;
      }
      return true;
    });
  
    if (validFiles.length === 0) return;

    
  
    for (const file of validFiles) {
      try {
        setUploadingFiles(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          name: file.name, 
          status: 'uploading' 
        }]);
  
        console.log(`📤 Загрузка файла: ${file.name}`);
        
        // 1. Загружаем файл на сервер
        const uploadResult = await fileService.uploadFile(file, selectedChat.id);
        console.log('✅ Файл загружен:', uploadResult);
  
        // 2. Подготавливаем данные для сообщения
        const { messageService } = await import("../../services/api/MessagesService");
        
        // ВАЖНО: Создаем объект attachment
        const attachment = {
          fileName: uploadResult.fileName || file.name,
          fileUrl: uploadResult.fileUrl || uploadResult.data?.fileUrl,
          fileSize: uploadResult.fileSize || file.size,
          contentType: uploadResult.contentType || file.type,
          // Добавляем тип для удобства
          fileType: file.type
        };
  
        console.log('📎 Attachment данные:', attachment);
  
        // 3. Отправляем сообщение С attachment
        const messageResult = await messageService.sendMessage(
          `${fileService.getFileIcon(file.name)} ${file.name}`, // Текст сообщения
          selectedChat.interlocutorId,
          selectedChat.id,
          attachment // Передаем attachment объект
        );
  
        console.log('✅ Сообщение с файлом отправлено:', messageResult);
  
        // 4. Обновляем статус загрузки
        setUploadingFiles(prev => prev.map(f => 
          f.name === file.name ? { ...f, status: 'success' } : f
        ));
  
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        }, 3000);
  
      } catch (error) {
        console.error(`❌ Ошибка загрузки файла ${file.name}:`, error);
        
        setUploadingFiles(prev => prev.map(f => 
          f.name === file.name ? { ...f, status: 'error' } : f
        ));
  
        alert(`Не удалось отправить файл "${file.name}": ${error.message}`);
      }
    }
  
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Функция для перетаскивания файлов
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Прокрутка к последнему сообщению при получении нового
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     // Проверяем, было ли добавлено новое сообщение (последнее по времени)
  //     const lastMessage = messages[messages.length - 1];
  //     const isNewMessage =
  //       lastMessage.senderId === currentUserId &&
  //       Date.now() - new Date(lastMessage.createdAt).getTime() < 5000;

  //     if (isNewMessage) {
  //       scrollToBottom();
  //     }
  //   }
  // }, [messages, currentUserId]);

  // Ручная прокрутка к последнему сообщению
  const scrollToBottomManual = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Обработчик скролла
  const handleMessagesScroll = useCallback((e) => {
    const container = e.target;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
    } else {
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializationThemeFun();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Обработчик изменения input
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Запускаем индикатор печати
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Обработчик отправки сообщения
  const handleSendMessage = async () => {
    const { messageService } = await import(
      "../../services/api/MessagesService"
    );
    if (!inputMessage.trim() || !selectedChat) return;

    try {
      // Используем сервис
      const result = await messageService.sendMessage(
        inputMessage,
        selectedChat.interlocutorId,
        selectedChat.chatId // targetUserId // chatId
      );

      setInputMessage("");
      stopTyping();
      console.log("✅ Сообщение отправлено:", result);
    } catch (error) {
      console.error("❌ Ошибка отправки:", error);
    }
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenSettingsWindow = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettingsWindow = () => {
    setIsSettingsOpen(false);
  };

  const handleChatClick = async (chat) => {
    setSelectedChat(chat);
  };

  const handleAddNewChat = (prev) => {
    setAddNewChat((prev) => !prev);
  };

  const handleAddNewFrined = async (prev) => {
    // setAddFrined((prev) => !prev);

    try {
      const { authService } = await import("../../services/api/AuthService");
      authService.Logout();
    } catch {}

    //     localStorage.removeItem('userid');
    // localStorage.removeItem('usersettings');
    // localStorage.removeItem('token');
    // localStorage.removeItem('refreshtoken');
    // localStorage.removeItem('userProfile');
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

  const handleSelectLocalUser = (chatData) => {
    setSelectedChat(null); // Открываем чат справа
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
    setLocalChatIsOpen((prev) => !prev);
  };

  const handleCloseChat = (e) => {
    if (e.key === "Esc" && !e.shiftKey) {
      e.preventDefault();
      setSelectedChat(null);
    }
  };

  const handleOpenChatInfo = () => {
    setChatInfo((prev) => !prev);
  };

  return (
    <div className={styles["mainPage-container"]} onKeyPress={handleCloseChat}>
      <AnimatePresence>
        {addNewChat && <CreateNewChatModal onClick={handleAddNewChat} />}
        {addFrined && <AddFriendModal onClick={handleAddNewFrined} />}
        {isSettingsOpen && (
          <SettingsWindow onClick={handleCloseSettingsWindow} />
        )}
        {localChatIsOpen && (
          <CreateLocalChatModal
            onClick={openCreateLocalChatModal}
            onSelectUser={handleSelectLocalUser}
          />
        )}
      </AnimatePresence>
      <div className={styles["chatsList-container"]}>
        <div className={styles["logo-menu"]}>
          <p>
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
                  <button onClick={openCreateLocalChatModal}>
                    Создать новый чат
                  </button>
                </div>
              ) : (
                chats
                  .filter((chat) =>
                    chat.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((chat) => (
                    <ChatUi
                      key={chat.id}
                      img={chat.avatarUrl}
                      name={chat.name}
                      time={chat.time}
                      msgText={chat.lastMessage}
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
              <button
                className={styles["chatsAddButtons"]}
                onClick={openCreateLocalChatModal}
              >
                Создать новый чат
              </button>
            </div>
          )}
          <div className={styles["add-newchat"]} onClick={handleAddButtonClick}>
            <button className={styles["add-newchat-btn"]}>
              <svg
                width="43"
                height="43"
                viewBox="0 0 43 43"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M41.9083 8.84844C43 11.4834 43 14.8207 43 21.5C43 28.1793 43 31.519 41.9083 34.1516C40.4535 37.6634 37.6634 40.4535 34.1516 41.9083C31.519 43 28.1793 43 21.5 43H14.3333C7.57756 43 4.19728 43 2.09983 40.9002C-1.42389e-07 38.8027 0 35.4224 0 28.6667V21.5C0 14.8207 7.11944e-08 11.4834 1.09172 8.84844C2.54646 5.33661 5.33661 2.54646 8.84844 1.09172C11.4834 7.11944e-08 14.8207 0 21.5 0C28.1793 0 31.519 7.11944e-08 34.1516 1.09172C37.6634 2.54646 40.4535 5.33661 41.9083 8.84844ZM11.9444 16.7222C11.9444 16.0886 12.1961 15.481 12.6441 15.033C13.0921 14.585 13.6998 14.3333 14.3333 14.3333H28.6667C29.3002 14.3333 29.9079 14.585 30.3559 15.033C30.8039 15.481 31.0556 16.0886 31.0556 16.7222C31.0556 17.3558 30.8039 17.9634 30.3559 18.4114C29.9079 18.8594 29.3002 19.1111 28.6667 19.1111H14.3333C13.6998 19.1111 13.0921 18.8594 12.6441 18.4114C12.1961 17.9634 11.9444 17.3558 11.9444 16.7222ZM11.9444 26.2778C11.9444 25.6442 12.1961 25.0366 12.6441 24.5886C13.0921 24.1406 13.6998 23.8889 14.3333 23.8889H21.5C22.1336 23.8889 22.7412 24.1406 23.1892 24.5886C23.6372 25.0366 23.8889 25.6442 23.8889 26.2778C23.8889 26.9114 23.6372 27.519 23.1892 27.967C22.7412 28.415 22.1336 28.6667 21.5 28.6667H14.3333C13.6998 28.6667 13.0921 28.415 12.6441 27.967C12.1961 27.519 11.9444 26.9114 11.9444 26.2778Z"
                  fill="#A0B8FF"
                />
              </svg>
            </button>{" "}
          </div>
        </div>
      </div>
      <div
        className={`${styles["chat-container"]} ${
          !selectedChat ? styles.mobileHidden : ""
        }`}
      >
        {selectedChat ? (
          <div className={styles["chat-layout"]}>
            {/* Заголовок чата */}
            <div className={styles["aboutchat"]}>
              <AboutChat
                avatar={selectedChat.avatar || selectedChat.img}
                name={selectedChat.name}
                isOnline={selectedChat.isOnline}
                onClick={handleOpenChatInfo}
              />
            </div>

            {/* Сообщения */}
            <div className={styles["chat-main"]}>
              {chatInfo && (
                <div className={styles["chatSidebar-container"]}>
                  <ChatSideBar chatId={selectedChat.id} />
                </div>
              )}
              <div
                className={styles["messages-container"]}
                onScroll={handleMessagesScroll}
                ref={messagesContainerRef}
              >
                {messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const prevMessage = messages[index - 1];
                  const nextMessage = messages[index + 1];

                  // Определяем, нужно ли показывать отправителя
                  const showSender =
                    !isOwn &&
                    (!prevMessage ||
                      prevMessage.senderId !== message.senderId ||
                      new Date(message.createdAt) -
                        new Date(prevMessage.createdAt) >
                        300000); // 5 минут

                  // Определяем, первое ли это сообщение в группе
                  const isFirstInGroup =
                    !prevMessage ||
                    prevMessage.senderId !== message.senderId ||
                    new Date(message.createdAt) -
                      new Date(prevMessage.createdAt) >
                      300000;

                  // Определяем, последнее ли это сообщение в группе
                  const isLastInGroup =
                    !nextMessage ||
                    nextMessage.senderId !== message.senderId ||
                    new Date(nextMessage.createdAt) -
                      new Date(message.createdAt) >
                      300000;

                  // Проверяем, нужно ли показывать разделитель дат
                  const showDateSeparator =
                    !prevMessage ||
                    new Date(message.createdAt).toDateString() !==
                      new Date(prevMessage.createdAt).toDateString();
                  return (
                    <Message
                      key={`${message.id}_${index}`}
                      message={{
                        ...message,
                        showDateSeparator,
                      }}
                      isOwn={isOwn}
                      showSender={showSender}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      currentUserId={currentUserId} // Добавьте это
                      chatId={selectedChat?.id}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Поле ввода */}
            <div
              className={styles["chat-input"]}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {/* Кнопка прикрепления файла */}
              <button
                type="button"
                className={styles["attach-file-btn"]}
                onClick={() => fileInputRef.current?.click()}
                title="Прикрепить файл"
              >
                📎
              </button>

              {/* Скрытый input для выбора файлов */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: "none" }}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.mp4,.mp3,.wav,.ogg,.xls,.xlsx,.ppt,.pptx"
              />

              {/* Поле ввода текста */}
              <input
                type="text"
                placeholder="Напишите сообщение..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onBlur={stopTyping}
              />

              {/* Кнопка отправки */}
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={styles["send-btn"]}
              >
                Отправить
              </button>
            </div>

            {/* Индикатор загрузки файлов */}
            {uploadingFiles.length > 0 && (
              <div className={styles["uploading-files"]}>
                <div className={styles["uploading-files-header"]}>
                  <span>Загрузка файлов:</span>
                  <button
                    onClick={() => setUploadingFiles([])}
                    className={styles["close-uploads-btn"]}
                    title="Скрыть"
                  >
                    ✕
                  </button>
                </div>
                {uploadingFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`${styles["uploading-file"]} ${
                      styles[`status-${file.status}`]
                    }`}
                  >
                    <span className={styles["file-name"]}>{file.name}</span>
                    <span className={styles["file-status"]}>
                      {file.status === "uploading" && "🔄 Загрузка..."}
                      {file.status === "success" && "✅ Успешно"}
                      {file.status === "error" && "❌ Ошибка"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles["no-chat-selected"]}></div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
