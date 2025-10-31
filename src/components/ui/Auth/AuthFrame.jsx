import InputField from "../../common/InputField/InputField";
import { useState } from "react";
import RegButton from "../../common/RegButton/RegButton";
const AuthFrame = () => {
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const changeAuthEmail = (event) => {
    setAuthEmail(event.target.value);
  };

  const changeAuthPassword = (event) => {
    setAuthPassword(event.target.value);
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
        <RegButton color="blue" size="medium">
          Войти
        </RegButton>
      </div>
    </div>
  );
};

export default AuthFrame;
