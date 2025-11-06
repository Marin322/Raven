import styles from '../../../styles/components/layout/SettingsWindow/SettingsWindow.module.css';

const SettingsWindow = ({ onClick }) => {
    return (
        <div className={styles["settings-window-container"]}>
            <div className={styles["settings-window"]}>
                <div className={styles["settings-window-header"]} onClick={onClick}></div>
            </div>
        </div>
    );
};

export default SettingsWindow;