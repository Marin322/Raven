import { applyGeneratorOptions } from "framer-motion";
import { API_CONFIG } from "../config/config";

class UserProfile {
    async GetUserInfo() {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PROFILE.GETPROFILE}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
            );

            if (!response.ok) throw new Error(response.status);

            let result;

            try {
                result = await response.json();
                localStorage.setItem("userProfile", JSON.stringify(result));
                const profile = JSON.parse(localStorage.getItem('userProfile'));
                const mediaResponse = await fetch(
                    `${API_CONFIG.BASE_URL}/api/UserMedia/media`, // Эндпоинт для медиа пользователя
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!mediaResponse.ok) {
                    console.warn('Не удалось получить медиа пользователя, используем дефолтные значения');
                    return userProfile;
                }

                const mediaData = await mediaResponse.json();

                // 4. Обновляем avatarUrl в профиле
                if (mediaData.avatarUrl) {
                    userProfile.avatarUrl = mediaData.avatarUrl;
                    return result;
                }

                localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
            }
            catch (error) {
                throw new Error(error)
            };
        }
        catch(error) {};
    };

    async GetUserDevices() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PROFILE.GETUSERDEVICES}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error(response.status);

                const result = await response.json();
                console.log(result);
            }
            catch (error) {
                console.error(error);
            };
        };
    };

    export const userProfile = new UserProfile();