const theme = () => {
  const html = document.querySelector("html");
  const isDark = document.querySelector("main")?.classList?.contains("is-dark");
  if (isDark) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }

  const currentMode = localStorage.getItem("theme");
  if (currentMode === "dark") {
    html.classList.add("dark");
  } else if (currentMode === "light") {
    html.classList.remove("dark");
  }
  const themeController = document.querySelector(".theme-controller");
  themeController.addEventListener("click", function () {
    html.classList.toggle("dark");
    const currentMode = html.classList.contains("dark");
    if (currentMode) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
};

export default theme;
