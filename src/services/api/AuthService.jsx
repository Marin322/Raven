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
      console.log(response.status)
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
      localStorage.setItem("deviceid", result.deviceId)

      return {
        status: response.status,
        ok: response.ok
      }
    } catch (error) {
      throw error;
    } 
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

    if (!response.ok) throw new Error(response.status);

    localStorage.removeItem('userid');
    localStorage.removeItem('usersettings');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('deviceId');
  }

  async getNewToken() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshtoken');

    const userData = {
      token,
      refreshToken
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTHENTICATION.REFRESHTOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if(!response.ok) throw new Error(response.status);

    const result = await response.json();
    console.log(result)
    localStorage.setItem('token', result.token);
    localStorage.setItem('refreshtoken', result.refreshToken);
    return result;
  }
}

export const authService = new AuthService();
