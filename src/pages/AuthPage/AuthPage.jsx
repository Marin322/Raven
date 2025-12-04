import { useState } from "react";
import styles from "./AuthPage.module.css";
import logo from "../../logo.svg";
import AuthFrame from "../../components/ui/Auth/AuthFrame";
import RegFrame from "../../components/ui/Auth/RegFrame";
const AuthPage = ({ isAuth, setIsAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className={styles.page}>
      <div>
        <div className={styles.msglogoandname}>
          <img src={logo} alt="" className={styles.messenglogo}></img>
          <span>Raven</span>
        </div>
        <span className={styles.heading}>Платформа Безопаного Общения</span>
      </div>
      <div
        className={`${styles.authWindow} ${
          isLogin ? styles["auth-login"] : styles["auth-register"]
        }`}
      >
        <div className={styles.authorreg}>
          <span
            className={isLogin ? styles.active : ""}
            onClick={() => setIsLogin(true)}
          >
            Авторизация
          </span>
          <span
            className={!isLogin ? styles.active : ""}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </span>
        </div>
        {isLogin ? (
          <AuthFrame isAuth={isAuth} setIsAuth={setIsAuth} />
        ) : (
          <RegFrame />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
