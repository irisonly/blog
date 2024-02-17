END_POINT = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => {
  const logout = document.getElementById("logout_link");
  logout.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    window.location.href = "./login.html";
  });
  // console.log(localStorage.getItem("user_id"));
  if (localStorage.getItem("user_id")) {
    document.getElementById("login_link").style.display = "none";
    document.getElementById("register_link").style.display = "none";
    document.getElementById("logout_link").style.display = "block";
  } else {
    document.getElementById("logout_link").style.display = "none";
  }
  fetch(END_POINT + "/blogs", {
    method: "GET",
    //   headers: { Authorization: "Bearer " + get_token() },
  })
    .then(response => response.json()) // 将响应转换为JSON
    .then(data => {
      const blog_list = document.getElementById("blog_list");
      console.log(data["response"]);
      data["response"].forEach(element => {
        const div = document.createElement("div");
        div.className = "post-preview";
        blog_list.insertBefore(div, blog_list.firstChild);
        const a = document.createElement("a");
        a.href = "./post.html?id=" + element["id"];
        div.appendChild(a);
        const h2 = document.createElement("h2");
        h2.className = "post-title";
        h2.textContent = element["title"];
        a.appendChild(h2);
        const h3 = document.createElement("h3");
        h3.className = "post-subtitle";
        h3.textContent = element["subtitle"];
        a.appendChild(h3);
        const p = document.createElement("p");
        p.className = "post-meta";
        p.textContent = "Posted by ";
        div.appendChild(p);
        const au = document.createElement("a");
        au.textContent = element["author"];
        au.href = "#";
        p.appendChild(au);
        const dt = document.createElement("span");
        dt.textContent = " on " + element["date"];
        p.appendChild(dt);
        const del = document.createElement("a");
        del.dataset.id = element["id"];
        del.textContent = "  " + "Delete";
        del.href = "#";
        p.appendChild(del);
        del.addEventListener("click", e => {
          e.preventDefault();
          if (
            parseInt(localStorage.getItem("user_id"), 10) == element["user_id"]
          ) {
            fetch(END_POINT + "/blog", {
              method: "DELETE", // 指定请求方法为 POST
              headers: {
                // 指定发送的数据类型为 JSON
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: element["id"] }), // 将 JavaScript 对象转换为 JSON 字符串
            })
              .then(response => response.json()) // 解析 JSON 响应
              .then(data => {
                console.log("Success:");
                alert("文章删除成功");
              })
              .catch(error => {
                console.error("Error:", error);
                alert("文章删除失败，请检查");
              });
          }
        });
      });
    })
    .catch(error => {
      console.error("请求失败:", error);
    });
});
