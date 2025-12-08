import { useEffect, useState } from "react";
import {
  initializationThemeFun,
  setThemeFun,
} from "../../../functions/ThemeFun";

import styles from "../../../styles/components/common/ThemeToggle/ThemeToggle.module.css"

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState("dark");

  useEffect(() => {
    // const savedTheme = localStorage.getItem("theme") || "dark";
    // const themeSettingStr = localStorage.getItem('usersettings');
    // const themeSetting = themeSettingStr ? JSON.parse(themeSettingStr) : null
    // setTheme(themeSetting.theme);
    initializationThemeFun();
  }, []);

  const setTheme = (theme) => {
    // setCurrentTheme(theme);
    // document.documentElement.setAttribute("data-theme", theme);
    // localStorage.setItem("theme", theme);

    setThemeFun(theme);
  };

  const toggleTheme = () => {
    const userTheme = JSON.parse(localStorage.getItem("usersettings"));
    const newTheme = userTheme.theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    // <button className="theme-toggle" onClick={toggleTheme}>
    //   {currentTheme === "light" ? "☀️" : "🌙"}
    // </button>
    <div className={styles["toggler"]} onClick={toggleTheme}>
      <input type="checkbox" />
      <div className={styles["check"]}>
        <div></div>
      </div>
    </div>
  );
};

export default ThemeToggle;
