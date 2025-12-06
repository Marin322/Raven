import styles from "../../../styles/components/layout/SettingsWindow/SettingsParams.module.css";
import ThemeToggle from "../../common/ThemeToggle/ThemeToggle";


export const AccountSetting = () => {

}

export const AppearanceSetting = () => {
    const userSettingsStr = localStorage.getItem("usersettings");
    const userSettings = userSettingsStr ? JSON.parse(userSettingsStr) : null;

    const saveChanges = async () => {
        const { settingsService } = await import("../../../services/api/SettingsService");

        const result = settingsService.ChangeAppearance("light")
        console.log(result)
    }
    return (
        <div className={styles["settings-container"]}>
            <div>
                <ThemeToggle/>
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