import { API_CONFIG } from "../config/config";

class UsersService {
  async GetAllUsers(userData) {
    try {
      const { page = 1, pageSize = 25, searchTerm = '' } = userData || {};
      const token = localStorage.getItem("token");
      console.log(token)
      if (!token) {
        throw new Error("Токен не найден.");
      }
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.USERS.GETALLUSERS}?page=1&pageSize=${pageSize}&SearchTerm=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url
        ,
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
      } catch (error) {
        throw new Error(response.status);
      }

      if (!response.ok) throw new Error();

      return result;
    } catch (error) {}
  }
}

export const usersService = new UsersService();
