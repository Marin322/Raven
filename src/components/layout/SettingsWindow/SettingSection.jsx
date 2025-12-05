import styles from "../../../styles/components/layout/SettingsWindow/SettingSection.module.css";

const SettingSection = ({name, onClick, svgIcon, isActive}) => {
    return (
        <div className={`${styles["settingSection-container"]} ${isActive ? styles.active : ""}`} onClick={onClick}>
            <div>{svgIcon}</div>
            <p>{name}</p>
        </div>
    );
};

export default SettingSection;