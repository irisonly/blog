END_POINT = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {
  // localStorage.removeItem("access_token");
  // localStorage.removeItem("refresh_token");
  // localStorage.removeItem("user_id");
  const loginForm = document.querySelector("#project_form");
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.querySelector("#name").value;
    const password = document.querySelector("#password").value;
    fetch(END_POINT + "/login", {
      method: "POST",
      body: JSON.stringify({
        name: username,
        password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          alert(result.error);
        } else {
          console.log(result);
          localStorage.setItem(
            "access_token",
            result["response"]["access_token"]
          );
          localStorage.setItem(
            "refresh_token",
            result["response"]["refresh_token"]
          );
          localStorage.setItem("user_id", result["response"]["data"]["id"]);
          window.location.href = "./index.html";
        }
      });
  });
  if (localStorage.getItem("user_id")) {
    document.getElementById("login_link").style.display = "none";
    document.getElementById("register_link").style.display = "none";
    document.getElementById("logout").style.display = "block";
  } else {
    document.getElementById("logout").style.display = "none";
  }
});
