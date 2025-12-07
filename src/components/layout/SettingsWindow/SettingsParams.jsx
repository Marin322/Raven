import styles from "../../../styles/components/layout/SettingsWindow/SettingsParams.module.css";
import ThemeToggle from "../../common/ThemeToggle/ThemeToggle";


export const AccountSetting = () => {

}

export const AppearanceSetting = () => {
    const userSettingsStr = localStorage.getItem("usersettings");
    const userSettings = userSettingsStr ? JSON.parse(userSettingsStr) : null;
    console.log(userSettings.theme)

    const saveChanges = async () => {
        const { settingsService } = await import("../../../services/api/SettingsService");

        const themeSettingStr = localStorage.getItem('usersettings');
        const themeSetting = themeSettingStr ? JSON.parse(themeSettingStr) : null;
        const result = settingsService.ChangeAppearance(themeSetting.theme);
        console.log(result);
    }
    return (
        <div className={styles["settings-container"]}>
            <div>
                <ThemeToggle />
                <button onClick={saveChanges}>Сохранить</button>
            </div>
        </div>
    );
};

export const NotificationsSetting = () => {
    
}

export const ChatsSetting = () => {
    
}

export const ConfidentialitySetting = () => {
    
}

export const DevicesSetting = () => {
    
}