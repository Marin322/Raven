import { API_CONFIG } from "../config/config";

class UsersService {
  async GetAllUsers(userData) {
    try {
      const { page = 1, pageSize = 25, searchTerm = '' } = userData || {};
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен не найден.");
      }
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.USERS.GETALLUSERS}?page=${page}&pageSize=${pageSize}&SearchTerm=${encodeURIComponent(searchTerm)}`;
      console.log(url)
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
  };

  async GetTargetUserStatus(targetUserId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS.GETUSERSTATUS}${targetUserId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if(!response.ok) throw new Error(response.status);

      return response.json();
    }
    catch(error) {

    };
  };
}

export const usersService = new UsersService();
