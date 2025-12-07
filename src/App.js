import AuthPage from './pages/AuthPage/AuthPage';
import MainPage from './pages/MainPage/MainPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { initializationThemeFun } from './functions/ThemeFun';

function App() {
  const [isAuth, setIsAuth] = useState(null);
  useEffect(() => {
    const themeSettingRaw = localStorage.getItem('usersettings');
    const themeSetting = themeSettingRaw ? JSON.parse(themeSettingRaw) : null;
    console.log(themeSettingRaw)

    if (!themeSetting) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    else {
      initializationThemeFun();
    }
  }, [])



  useEffect(() => {
    const userId = localStorage.getItem('userid');
    setIsAuth(!!userId); // true если нет userId, false если есть
  }, []); // ← Пустой массив = выполнить один раз
  //gkufgtuifj
  return (
    <BrowserRouter>
      <Routes>
        {/* /auth должен быть доступен только НЕавторизованным */}
        <Route
          path="/auth"
          element={
            !isAuth ? // Изменено: !isAuth вместо isAuth
              <AuthPage isAuth={isAuth} setIsAuth={setIsAuth} /> :
              <Navigate to="/" replace />
          }
        />

        {/* / должен быть доступен только авторизованным */}
        <Route
          path="/"
          element={
            isAuth ? // Изменено: isAuth вместо !isAuth
              <MainPage /> :
              <Navigate to="/auth" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
