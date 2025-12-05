import { useEffect, useState } from "react";
import styles from "../../../styles/components/layout/SettingsWindow/SettingsWindow.module.css";
import { motion } from "framer-motion";
import SettingSection from "./SettingSection";
import {
  AccountSvgIcon,
  AppearanceSvgIcon,
  NotificationsSvgIcon,
  ChatsSvgIcon,
  ConfidentialitySvgIcon,
  DevicesSvgIcon,
} from "../../../icons/svg/SettingsSvgIcons";

const SettingsWindow = ({ onClick }) => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isActiveId, setIsActiveId] = useState(0);

  const setActiveSettingPoint = (id) => {
    setIsActiveId(id);
  };

  const LoadSettings = async () => {
    const { userProfile } = await import("../../../services/api/UserProfile");
    try {
      setLoading(true);
      let UserProfileStr = localStorage.getItem("userProfile");
      let profileData = null;

      if (UserProfileStr) {
        try {
          profileData = JSON.parse(UserProfileStr);
        } catch (error) {
          localStorage.removeItem("userProfile");
          console.error(error);
        }
      }

      if (!profileData) {
        profileData = await userProfile.GetUserInfo();
      }
      setUserProfile(profileData);
    } catch (error) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    LoadSettings();
  }, []);
  return (
    <div className={styles["settings-window-container"]}>
      <motion.div
        className={styles["settings-window"]}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles["settings-window-header"]} onClick={onClick}>
          <p>Параметры</p>
        </div>
        <div className={styles["settings-window-main"]}>
          <div className={styles["settings-window-mainsettings"]}>
            {loading && <div className={styles.loader}></div>}
            <div
              className={
                styles["settings-window-mainsettings-avatar-container"]
              }
            >
              {userProfile ? ( // Conditional rendering
                <div className={styles["settings-window-mainsettings-avatar"]}>
                  <img src={userProfile.avatarUrl} alt="" />
                  <p>{userProfile.firstName}</p>
                </div>
              ) : (
                <p>Загрузка профиля...</p> // Плейсхолдер, чтобы не было пустоты
              )}
            </div>
            <div className={styles["settings-window-mainsettings-points"]}>
              <SettingSection
                isActive={isActiveId === 1}
                name="Учётная запись"
                svgIcon={<AccountSvgIcon />}
                onClick={() => setActiveSettingPoint(1)}
              />
              <SettingSection
                isActive={isActiveId === 2}
                name="Внешний вид"
                svgIcon={<AppearanceSvgIcon />}
                onClick={() => setActiveSettingPoint(2)}
              />
              <SettingSection
                isActive={isActiveId === 3}
                name="Уведомления"
                svgIcon={<NotificationsSvgIcon />}
                onClick={() => setActiveSettingPoint(3)}
              />
              <SettingSection
                isActive={isActiveId === 4}
                name="Чаты"
                svgIcon={<ChatsSvgIcon />}
                onClick={() => setActiveSettingPoint(4)}
              />
              <SettingSection
                isActive={isActiveId === 5}
                name="Конфиденциальность"
                svgIcon={<ConfidentialitySvgIcon />}
                onClick={() => setActiveSettingPoint(5)}
              />
              <SettingSection
                isActive={isActiveId === 6}
                name="Устройства"
                svgIcon={<DevicesSvgIcon />}
                onClick={() => setActiveSettingPoint(6)}
              />
            </div>
          </div>
          <div className={styles["settings-window-mainparams"]}></div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsWindow;
