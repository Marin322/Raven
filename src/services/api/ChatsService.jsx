import { API_CONFIG } from "../config/config";

class ChatsService {
  async GetUserChats(userData) {
    try {
      const { page = 1, pageSize = 25 } = userData || {};

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен не найден. Пожалуйста, авторизуйтесь заново.");
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.CHATS.GETUSERCHATS}?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Не удалось спарсить JSON:", parseError);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} (тело не JSON)`
        );
      }

      if (!response.ok) {
        console.error(
          "Серверная ошибка (полный объект):",
          JSON.stringify(result, null, 2)
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userid");
          localStorage.removeItem("usersettings");
          throw new Error("Сессия истекла. Пожалуйста, авторизуйтесь заново.");
        }

        if (response.status === 400) {
          // Специально для chat: логируем и парсим
          const chatErrors = result.errors?.chat || [];
          console.error("Детали chat ошибки:", chatErrors); // Здесь текст! Массив строк
          if (chatErrors.length > 0) {
            console.error("Полный текст первой chat ошибки:", chatErrors[0]); // Основная подсказка
          }

          const validationErrors = result.errors
            ? Object.entries(result.errors)
                .map(
                  ([field, msgs]) =>
                    `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
                )
                .join("; ")
            : result.title || "Валидация не прошла";
          throw new Error(`Bad Request (валидация): ${validationErrors}`);
        }

        throw new Error(
          `${response.status}: ${result.title || response.statusText}`
        );
      }

      console.log("Чаты загружены успешно:", result.length || 0, "чатов");
      return result;
    } catch (error) {
      console.error("Ошибка при получении чатов:", error);
      throw error;
    }
  }

  async CreateGroupChat() {
    
  }

  async CreatePersonalChat(targetUserId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHATS.CREATEPERSONALCHAT}${targetUserId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(targetUserId),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(response.status);

    console.log("Чат создан");
  };
};

export const chatsService = new ChatsService();
