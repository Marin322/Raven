import InputField from "../../common/InputField/InputField";
import { useState } from "react";
import RegButton from "../../common/RegButton/RegButton";
const AuthFrame = ({ isAuth, setIsAuth }) => {
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isCorrectAuth, setIsCorrectAuth] = useState();
  const changeAuthEmail = (event) => {
    setAuthEmail(event.target.value);
  };

  const changeAuthPassword = (event) => {
    setAuthPassword(event.target.value);
  };

  const EnterAccount = async () => {
    const { authService } = await import("../../../services/api/AuthService");
    const deviceid = localStorage.getItem('deviceid');
    try {
      const enterUser = await authService.Authorization({
        email: authEmail,
        password: authPassword,
        deviceId: deviceid
      });

      if (enterUser.status === 200) {
        setIsCorrectAuth(true);
        setIsAuth(true);
      } else {
        setIsCorrectAuth(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <InputField
        key="login-email"
        header="Эл. Почта"
        placeholder="Введите эл.почту..."
        type="text"
        onChange={changeAuthEmail}
      ></InputField>
      <InputField
        key="login-password"
        header="Пароль"
        placeholder="Введите свой пароль..."
        type="text"
        onChange={changeAuthPassword}
      ></InputField>
      <div className="authorregbutton">
        {isCorrectAuth && (
          <p className="text-green-400 text-lg">Авторизация успешна!</p>
        )}
        <RegButton color="blue" size="medium" onClick={EnterAccount}>
          Войти
        </RegButton>
      </div>
    </div>
  );
};

export default AuthFrame;
