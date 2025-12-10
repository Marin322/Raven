import { applyGeneratorOptions } from "framer-motion";
import { API_CONFIG } from "../config/config";

class UserProfile {
    async GetUserInfo() {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userid');

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PROFILE.GETPROFILE}${userId}`,
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
                return result;
            }
            catch(error) {
                throw new Error(error);
            };
        }
        catch(error) {
            throw new Error(error)
        };
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
        catch(error) {
            console.error(error);
        };
    };
};

export const userProfile = new UserProfile();