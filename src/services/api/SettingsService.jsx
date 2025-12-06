import { API_CONFIG } from "../config/config";

class SettingsService {
    async ChangeAppearance(theme, fontSize, language) {
        const token = localStorage.getItem('token');
        const dataForm = {
            theme,
            fontSize,
            language
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.SETTINGS.CHANGEAPPEARANCESETTINGS}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dataForm)
        });

        if (!response.ok) throw new Error(response.status);

        return response.status;
    }
}

export const settingsService = new SettingsService();