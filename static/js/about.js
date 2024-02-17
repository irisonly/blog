document.addEventListener("DOMContentLoaded", () => {
  const logout = document.getElementById("logout_link");
  logout.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    window.location.href = "./login.html";
  });
  if (localStorage.getItem("user_id")) {
    document.getElementById("login_link").style.display = "none";
    document.getElementById("register_link").style.display = "none";
    document.getElementById("logout_link").style.display = "block";
  } else {
    document.getElementById("logout_link").style.display = "none";
  }
});
