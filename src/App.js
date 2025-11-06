import AuthPage from './pages/AuthPage/AuthPage';
import MainPage from './pages/MainPage/MainPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function App() {
  const [isLogin, setIsLogin] = useState(null);
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark').matches;
    const savedTheme = localStorage.getItem('theme');

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
  })

  useEffect(() => {
    const userId = localStorage.getItem('userid');
    setIsLogin(!userId); // true если нет userId, false если есть
  }, []); // ← Пустой массив = выполнить один раз

  return (
    <BrowserRouter>
      <Routes>
        {/* Редирект с /auth на / если пользователь авторизован */}
        <Route
          path="/auth"
          element={
            isLogin ?
              <AuthPage /> :
              <Navigate to="/" replace />
          }
        />

        {/* Редирект с / на /auth если пользователь НЕ авторизован */}
        <Route
          path="/"
          element={
            isLogin ?
              <Navigate to="/auth" replace /> :
              <MainPage />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
