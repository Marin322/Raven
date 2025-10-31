import { useState } from "react";
import styles from "./AuthPage.module.css";
import logo from "../../logo.svg";
import AuthFrame from "../../components/ui/Auth/AuthFrame";
import RegFrame from "../../components/ui/Auth/RegFrame";
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  // const [authEmail, setAuthEmail] = useState('');
  // const [authPassword, setAuthPassword] = useState('');

  // const changeAuthEmail = (event) => {
  //   setAuthEmail(event.target.value);
  // };

  // const changeAuthPassword = (event) => {
  //   setAuthPassword(event.target.value);
  // };


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
          // <>
          //   <InputField
          //     key="login-email"
          //     header="Эл. Почта"
          //     placeholder="Введите эл.почту..."
          //     type="text"
          //     onChange={changeAuthEmail}
          //   ></InputField>
          //   <InputField
          //     key="login-password"
          //     header="Пароль"
          //     placeholder="Введите свой пароль..."
          //     type="text"
          //     onChange={changeAuthPassword}
          //   ></InputField>
          //   <div className="authorregbutton">
          //     <RegButton color="blue" size="medium">
          //       Войти
          //     </RegButton>
          //   </div>
          // </>
          <AuthFrame/>
        ) : (
          <RegFrame/>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
