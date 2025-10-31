import InputField from "../../common/InputField/InputField";
import RegButton from "../../common/RegButton/RegButton";
import { useState } from "react";
const RegFrame = () => {
  const [regEmail, setRegEmail] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const changeRegEmail = (event) => {
    setRegEmail(event.target.value);
  };

  const changeRegLastName = (event) => {
    setRegLastName(event.target.value);
  };

  const changeRegFirstName = (event) => {
    setRegFirstName(event.target.value);
  };

  const changeRegPassword = (event) => {
    setRegPassword(event.target.value);
  };

  const CreateAccount = async () => {
    const { authService } = await import("../../../services/api/AuthService");
    try {
      const newUser = await authService.Registration({
        email: regEmail,
        password: regPassword,
        firstname: regFirstName,
        lastname: regLastName,
      });
      console.log("user created!");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <InputField
        key="register-email"
        header="Эл. Почта"
        placeholder="Введите эл.почту..."
        type="text"
        onChange={changeRegEmail}
      ></InputField>
      <InputField
        key="register-name"
        header="Имя пользователя"
        placeholder="Введите ваше имя..."
        type="text"
        onChange={changeRegFirstName}
      ></InputField>
      <InputField
        key="register-lastname"
        header="Фамилия пользователя"
        placeholder="Введите вашу фамилию..."
        type="text"
        onChange={changeRegLastName}
      ></InputField>
      <InputField
        key="register-password"
        header="Пароль"
        placeholder="Введите свой пароль..."
        type="text"
        onChange={changeRegPassword}
      ></InputField>
      <div className="authorregbutton">
        <RegButton color="blue" size="medium" onClick={CreateAccount}>
          Зарегистрироваться
        </RegButton>
      </div>
    </div>
  );
};

export default RegFrame;
