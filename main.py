from datetime import timedelta
from flask import Flask, request
from werkzeug.security import generate_password_hash
from database import DataBase
from flask_restful import Resource, Api
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    create_access_token,
    create_refresh_token,
)
from flask_cors import CORS


app = Flask(__name__)
app.config["SECRET_KEY"] = "8BYkEfBA6O6donzWlSihBXox7C0sKR6b"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///posts.db"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
database = DataBase()
db = database.db
api = Api(app)
db.init_app(app)
jwt = JWTManager(app)
CORS(app)


with app.app_context():
    database.create_table()


@app.route("/")
def start():
    return "Api has launched"


class Users(Resource):
    def get(self):
        response = database.get_user_list()
        if response:
            return {"response": response}


class User(Resource):
    def post(self):
        data = request.get_json()
        name = data["name"]
        password = data["password"]
        email = data["email"]
        password_hash = generate_password_hash(
            password, method="pbkdf2:sha256", salt_length=16
        )
        response = database.add_user(name, password_hash, email)
        if response:
            access = create_access_token(response["id"])
            refresh = create_refresh_token(response["id"])
            return {
                "response": {
                    "data": response,
                    "access_token": access,
                    "refresh_token": refresh,
                }
            }
        return {"response": "fail to register the user"}

    def get(self):
        data = request.get_json()
        name = data["name"]
        password = data["password"]
        response = database.get_user(name, password)
        if response:
            return {"response": response}
        return {"response": "name or password error"}


class Login(Resource):
    def post(self):
        data = request.get_json()
        name = data["name"]
        password = data["password"]
        response = database.get_user(name, password)
        if response:
            access = create_access_token(response["id"])
            refresh = create_refresh_token(response["id"])
            return {
                "response": {
                    "data": response,
                    "access_token": access,
                    "refresh_token": refresh,
                }
            }
        return {"response": "name or password error"}


class Blogs(Resource):
    def get(self):
        response = database.get_all_posts()
        if response:
            return {"response": response}


class Blog(Resource):
    def get(self):
        _id = request.args.get("id")
        response = database.get_post(_id)
        if response is not None:
            return {"response": response}

    @jwt_required()
    def post(self):
        data = request.get_json()
        if database.add_post(
            data["title"],
            data["subtitle"],
            data["date"],
            data["body"],
            data["author"],
            data["img_url"],
            int(data["user_id"]),
        ):
            return {"response": "successful add the post"}
        return {"response": "fail to add the post"}

    def delete(self):
        data = request.get_json()
        _id = data["id"]
        response = database.del_post(_id)
        if response:
            return {"response": "successful delete the post"}
        return {"response": "fail to delete the post"}

    @jwt_required()
    def put(self):
        data = request.get_json()
        if database.modify_post(
            data["id"],
            data["title"],
            data["subtitle"],
            data["date"],
            data["body"],
            data["author"],
            data["img_url"],
            data["user_id"],
        ):
            return {"response": "successful modify the post"}
        return {"response": "fail to modify the post"}


class Comments(Resource):
    def get(self):
        post_id = request.args.get("id")
        response = database.get_comments(post_id)
        if response:
            return {"response": response}

    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = data["user_id"]
        post_id = data["post_id"]
        comment = data["comment"]
        response = database.add_comment(user_id, post_id, comment)
        if response:
            return {"response": "successful add the comment"}
        return {"response": "fail to add the comment"}


api.add_resource(Blogs, "/blogs")
api.add_resource(Blog, "/blog")
api.add_resource(Users, "/users")
api.add_resource(User, "/user")
api.add_resource(Login, "/login")
api.add_resource(Comments, "/comments")


if __name__ == "__main__":
    app.run(debug=True, port=5002)
