END_POINT = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {
  // localStorage.removeItem("access_token");
  // localStorage.removeItem("refresh_token");
  // localStorage.removeItem("user_id");
  document.querySelector("#project_form").onsubmit = () => {
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fetch(END_POINT + "/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
        if (result.error) {
          alert(result.error);
        } else {
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

    return false;
  };
  if (localStorage.getItem("user_id")) {
    document.getElementById("login_link").style.display = "none";
    document.getElementById("register_link").style.display = "none";
    document.getElementById("logout").style.display = "block";
  } else {
    document.getElementById("logout").style.display = "none";
  }
});
