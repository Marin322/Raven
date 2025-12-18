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

            const result = await response.json();

            localStorage.setItem("userProfile", JSON.stringify(result));

            if (result.avatarUrl) {
                await this.GetUserAvatar(result);
            }

            return result;
        }
        catch (error) { };
    };

    async GetUserAvatar(profileData = null) {
        try {
            let profile = profileData;
            if (!profile) {
                const profileStr = localStorage.getItem('userProfile');
                if (profileStr) {
                    profile = JSON.parse(profileStr);
                } else {
                    console.warn('Профиль не найден в localStorage');
                    return;
                }
            }

            const token = localStorage.getItem('token');
            const avatarUrl = profile.avatarUrl;

            if (!avatarUrl) {
                console.warn('Нет avatarUrl в профиле');
                return profile;
            }

            const mediaResponse = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.AVATARS.GETCHATAVATAR}?fileUrl=${encodeURIComponent(avatarUrl)}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!mediaResponse.ok) {
                console.warn('Не удалось получить аватар, используем исходный URL');
                return profile;
            }

            const mediaData = await mediaResponse.json();

            // Обновляем avatarUrl
            if (mediaData.avatarUrl) {
                profile.avatarUrl = mediaData.avatarUrl;
                localStorage.setItem('userProfile', JSON.stringify(profile));
            }
            return profile;
        }
        catch { }
    }

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
            return result;
        }
        catch (error) {
            console.error(error);
        };
    };
};

export const userProfile = new UserProfile();