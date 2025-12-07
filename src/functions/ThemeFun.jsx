export const initializationThemeFun = () => {
  const userTheme = JSON.parse(localStorage.getItem("usersettings"));
  if (!userTheme) document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.setAttribute("data-theme", userTheme.theme);
  console.log(userTheme.theme);
};

export const setThemeFun = (theme) => {
    const userTheme = JSON.parse(localStorage.getItem("usersettings"));
    userTheme.theme = theme;
    localStorage.setItem("usersettings", JSON.stringify(userTheme));
    initializationThemeFun();
}

