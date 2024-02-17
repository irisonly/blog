END_POINT = "http://127.0.0.1:5000";

function editor_content() {
  const content = my_editor.getData();
  return content;
}

document.addEventListener("DOMContentLoaded", () => {
  const logout = document.getElementById("logout");
  logout.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    window.location.href = "./login.html";
  });
  const dt = new Date();
  const date_api = dt.getMonth() + " " + dt.getDate() + "," + dt.getFullYear();
  ClassicEditor.create(document.querySelector("#editor"))
    .then(editor => {
      my_editor = editor;
    })
    .catch(error => {
      console.error(error);
    });
  const query_string = window.location.search;
  const query_url = new URLSearchParams(query_string);
  const _id = query_url.get("id");
  const form = document.getElementById("project_form");

  if (_id) {
    console.log("edit mode");
    fetch(END_POINT + "/blog?id=" + _id, {
      method: "GET",
      //   headers: { Authorization: "Bearer " + get_token() },
    })
      .then(response => response.json()) // 将响应转换为JSON
      .then(data => {
        console.log(data["response"]);
        const title_input = document.getElementById("title");
        title_input.value = data["response"]["title"];
        const subtitle_input = document.getElementById("subtitle");
        subtitle_input.value = data["response"]["subtitle"];
        const author_input = document.getElementById("author");
        author_input.value = data["response"]["author"];
        const img_url = document.getElementById("img_url");
        img_url.value = data["response"]["img_url"];
        my_editor.setData(data["response"]["body"]);
        form.addEventListener("submit", e => {
          e.preventDefault();
          const form_data = new FormData(form);
          form_api = {};
          form_data.forEach((value, key) => {
            form_api[key] = value;
          });
          form_api["body"] = editor_content();
          form_api["date"] = date_api;
          form_api["id"] = _id;
          form_api["user_id"] = localStorage.getItem("user_id");
          console.log(form_api);
          fetch(END_POINT + "/blog", {
            method: "PUT", // 指定请求方法为 POST
            headers: {
              // 指定发送的数据类型为 JSON
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("access_token"),
            },
            body: JSON.stringify(form_api), // 将 JavaScript 对象转换为 JSON 字符串
          })
            .then(response => response.json()) // 解析 JSON 响应
            .then(data => {
              console.log("Success:", form_api);
              // alert("文章发布成功");
              window.location.href = "./index.html";
            })
            .catch(error => {
              console.error("Error:", error);
              alert("文章更新失败，请检查");
            });
        });
      })
      .catch(error => {
        console.error("请求失败:", error);
      });
  } else {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const form_data = new FormData(form);
      form_api = {};
      form_data.forEach((value, key) => {
        form_api[key] = value;
      });
      form_api["body"] = editor_content();
      form_api["date"] = date_api;
      form_api["user_id"] = localStorage.getItem("user_id");
      console.log(form_api);
      fetch(END_POINT + "/blog", {
        method: "POST", // 指定请求方法为 POST
        headers: {
          // 指定发送的数据类型为 JSON
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify(form_api), // 将 JavaScript 对象转换为 JSON 字符串
      })
        .then(response => response.json()) // 解析 JSON 响应
        .then(data => {
          console.log("Success:", data);
          if (data["msg"] == "Not enough segments") {
            window.location.href = "./login.html";
          } else {
            alert("文章发布成功");
            window.location.href = "./index.html";
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("文章发布失败，请检查");
        });
    });
  }
  if (localStorage.getItem("user_id")) {
    document.getElementById("login_link").style.display = "none";
    document.getElementById("register_link").style.display = "none";
    document.getElementById("logout").style.display = "block";
  } else {
    document.getElementById("logout").style.display = "none";
  }
});
