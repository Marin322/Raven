import styles from "../../../styles/components/layout/SettingsWindow/SettingsParams.module.css";
import ThemeToggle from "../../common/ThemeToggle/ThemeToggle";
import { useState, useEffect } from "react";

export const AccountSetting = () => {};

export const AppearanceSetting = () => {
  const userSettingsStr = localStorage.getItem("usersettings");
  const userSettings = userSettingsStr ? JSON.parse(userSettingsStr) : null;
  console.log(userSettings.theme);

  const saveChanges = async () => {
    const { settingsService } = await import(
      "../../../services/api/SettingsService"
    );

    const themeSettingStr = localStorage.getItem("usersettings");
    const themeSetting = themeSettingStr ? JSON.parse(themeSettingStr) : null;
    const result = settingsService.ChangeAppearance(themeSetting.theme);
    console.log(result);
  };
  return (
    <div className={styles["settings-container"]}>
      <div>
        <ThemeToggle />
        <button onClick={saveChanges}>Сохранить</button>
      </div>
    </div>
  );
};

export const NotificationsSetting = () => {};

export const ChatsSetting = () => {};

export const ConfidentialitySetting = () => {};

export const DevicesSetting = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { userProfile } = await import("../../../services/api/UserProfile");
      const getDevices = await userProfile.GetUserDevices();
      console.log(getDevices)
      setDevices(getDevices); // Этот метод должен возвращать данные!
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []); // Загружаем только при монтировании

  if (loading) return <div>Загрузка устройств...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles["devicesParams-container"]}>
      <h2>Устройства</h2>
      <div className={styles["devices-container"]}>
        {devices.map((device) => {
          return (
            <div key={device.id}>
              <p>{device.deviceType}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
