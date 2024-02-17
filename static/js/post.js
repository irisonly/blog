END_POINT = "http://127.0.0.1:5000";

function comments(commentList, _id) {
  fetch(END_POINT + "/comments?id=" + _id, {
    method: "GET",
    //   headers: { Authorization: "Bearer " + get_token() },
  })
    .then(response => response.json()) // 将响应转换为JSON
    .then(data => {
      // console.log(data["response"]);
      if (data) {
        data["response"].forEach(element => {
          const li = document.createElement("li");
          commentList.appendChild(li);
          const div = document.createElement("div");
          div.className = "commenterImage";
          li.appendChild(div);
          const img = document.createElement("img");
          img.src = "https://placekitten.com/50/50";
          div.appendChild(img);
          const div2 = document.createElement("div");
          div2.className = "commentText";
          li.appendChild(div2);
          const p = document.createElement("p");
          p.textContent = element["comment"];
          div2.appendChild(p);
          const span = document.createElement("span");
          span.className = "date sub-text";
          span.textContent = element["user"];
          div2.appendChild(span);
        });
      }
    })
    .catch(error => {
      console.error("请求失败:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const logout = document.getElementById("logout_link");
  logout.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    window.location.href = "./login.html";
  });
  const query_string = window.location.search;
  const query_url = new URLSearchParams(query_string);
  const _id = query_url.get("id");
  console.log(_id);
  fetch(END_POINT + "/blog?id=" + _id, {
    method: "GET",
    //   headers: { Authorization: "Bearer " + get_token() },
  })
    .then(response => response.json()) // 将响应转换为JSON
    .then(data => {
      console.log(data["response"]);
      const masthead = document.getElementById("masthead");
      masthead.style.backgroundImage =
        "url(" + data["response"]["img_url"] + ")";
      const t = document.getElementById("t");
      t.textContent = data["response"]["title"];
      const st = document.getElementById("st");
      st.textContent = data["response"]["subtitle"];
      const au = document.getElementById("au");
      au.textContent = data["response"]["author"];
      const dt = document.getElementById("dt");
      dt.textContent = data["response"]["date"];
      const pb = document.getElementById("pb");
      pb.innerHTML = data["response"]["body"];
      const div = document.createElement("div");
      div.className = "d-flex justify-content-end mb-4";
      pb.appendChild(div);
      const a = document.createElement("a");
      a.href = "./make-post.html?id=" + _id;
      a.className = "btn btn-primary float-right";
      a.textContent = "Edit Post";
      if (data["response"]["user_id"] != localStorage.getItem("user_id")) {
        a.style.display = "none";
      }
      div.appendChild(a);
      const comment = document.createElement("div");
      comment.className = "comment";
      pb.appendChild(comment);
      const form = document.createElement("form");
      form.className = "add_post";
      form.id = "project_form";
      form.method = "post";
      comment.appendChild(form);
      const title_div = document.createElement("div");
      title_div.className = "comments";
      form.appendChild(title_div);
      const label = document.createElement("label");
      label.textContent = "Comment";
      title_div.appendChild(label);
      const input = document.createElement("input");
      input.type = "text";
      input.name = "comment";
      input.id = "comment";
      title_div.appendChild(input);
      const button_div = document.createElement("div");
      button_div.className = "button_are";
      form.appendChild(button_div);
      const button = document.createElement("button");
      button.type = "submit";
      button.textContent = "Add Comment";
      button_div.appendChild(button);
      form.addEventListener("submit", e => {
        e.preventDefault();
        const comment = document.getElementById("comment").value;
        const data = {
          comment: comment,
          post_id: _id,
          user_id: localStorage.getItem("user_id"),
        };
        fetch(END_POINT + "/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("access_token"),
          },
          body: JSON.stringify(data),
        })
          .then(response => response.json()) // 将响应转换为JSON
          .then(data => {
            console.log(data);
            if (data["msg"] == "Not enough segments") {
              window.location.href = "./login.html";
            }
          })
          .catch(error => {
            console.error("请求失败:", error);
          });
      });
      const commentList = document.createElement("ul");
      commentList.className = "commentList";
      comment.appendChild(commentList);
      comments(commentList, _id);
    })
    .catch(error => {
      console.error("请求失败:", error);
    });
  if (localStorage.getItem("user_id")) {
    document.getElementById("login_link").style.display = "none";
    document.getElementById("register_link").style.display = "none";
    document.getElementById("logout_link").style.display = "block";
  } else {
    document.getElementById("logout_link").style.display = "none";
  }
});
