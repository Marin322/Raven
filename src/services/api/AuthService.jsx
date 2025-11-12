import { API_CONFIG } from "../config/config";

class AuthService {
  async Registration(userData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.AUTHENTICATION.REGISTRATION}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
          },
          body: JSON.stringify(userData),
        }
      );
      if (!response.ok) throw new Error(`${response.status}`);
      return await response.json();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async Authorization(userData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.AUTHENTICATION.AUTHORIZATION}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(`${response.status}`);

      localStorage.setItem("token", result.token);
      localStorage.setItem("userid", result.userId);
      localStorage.setItem("usersettings", JSON.stringify(result.settings));
      localStorage.setItem("refreshtoken", result.refreshToken);

      return result;
    } catch (error) {
      throw error;
    } // проблема с данными в user
  }

  async Logout() {
    const refreshToken = localStorage.getItem("refreshtoken");
    const token = localStorage.getItem("token");

    const userData = {
      refreshToken
    };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTHENTICATION.LOGOUT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      }
    );
    const result = await response.json();

    if (!response.ok) throw new Error(response.status);

    localStorage.removeItem('userid');
    localStorage.removeItem('usersettings');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('userProfile');
  }
}

export const authService = new AuthService();
