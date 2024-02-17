from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, exc, ForeignKey
from werkzeug.security import check_password_hash


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class BlogPost(db.Model):
    __tablename__ = "blog_posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    subtitle: Mapped[str] = mapped_column(String(250), nullable=False)
    date: Mapped[str] = mapped_column(String(250), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str] = mapped_column(String(250), nullable=False)
    img_url: Mapped[str] = mapped_column(String(250), nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", name="fk_blog_posts_user_id"), nullable=False
    )
    comments = relationship("Comments", backref="comment_to")


class Users(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(250), nullable=False)
    email: Mapped[str] = mapped_column(String(250), nullable=False)
    blogs = relationship("BlogPost", backref="blog_by")
    comment = relationship("Comments", backref="comment_by")


class Comments(db.Model):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    comment: Mapped[str] = mapped_column(String(250), unique=False, nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", name="fk_comments_user_id"), nullable=False
    )
    post_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("blog_posts.id", name="fk_comments_user_id"), nullable=False
    )


class DataBase:
    def __init__(self):
        self.db = db

    def create_table(self):
        self.db.create_all()

    def get_all_posts(self):
        records = (
            self.db.session.execute(self.db.select(BlogPost).order_by(BlogPost.id))
            .scalars()
            .all()
        )
        if len(records) > 0:
            records_output = [
                {
                    "id": i.id,
                    "title": i.title,
                    "subtitle": i.subtitle,
                    "date": i.date,
                    "original_author": i.author,
                    "user_id": i.user_id,
                    "author": i.blog_by.name,
                }
                for i in records
            ]
            return records_output

    def get_post(self, _id):
        record = self.db.session.execute(
            self.db.select(BlogPost).where(BlogPost.id == _id)
        ).scalar()
        if record is not None:
            record_output = {
                "id": record.id,
                "title": record.title,
                "subtitle": record.subtitle,
                "date": record.date,
                "body": record.body,
                "original_author": record.author,
                "img_url": record.img_url,
                "user_id": record.user_id,
                "author": record.blog_by.name,
            }
            return record_output

    def add_post(self, title, subtitle, date, body, author, img_url, user_id):
        record = BlogPost(
            title=title,
            subtitle=subtitle,
            date=date,
            body=body,
            author=author,
            img_url=img_url,
            user_id=user_id,
        )
        self.db.session.add(record)
        try:
            self.db.session.commit()
        except exc.IntegrityError:
            return False
        else:
            return True

    def del_post(self, _id):
        record = self.db.session.execute(
            self.db.select(BlogPost).where(BlogPost.id == _id)
        ).scalar()
        if record is not None:
            self.db.session.delete(record)
            self.db.session.commit()
            return True

    def modify_post(self, _id, title, subtitle, date, body, author, img_url, user_id):
        record = self.db.session.execute(
            self.db.select(BlogPost).where(BlogPost.id == _id)
        ).scalar()
        if record is not None:
            record.title = title
            record.subtitle = subtitle
            record.date = date
            record.body = body
            record.author = author
            record.img_url = img_url
            record.user_id = user_id
            try:
                self.db.session.commit()
            except exc.IntegrityError:
                return False
            else:
                return True

    def add_user(self, name, password, email):
        record = Users(name=name, password=password, email=email)
        self.db.session.add(record)
        try:
            self.db.session.flush()
            self.db.session.commit()
        except exc.IntegrityError:
            return False
        else:
            record_output = {
                "id": record.id,
                "name": record.name,
                "password": record.password,
                "email": record.email,
            }
            return record_output

    def get_user_list(self):
        records = (
            self.db.session.execute(self.db.select(Users).order_by(Users.id))
            .scalars()
            .all()
        )
        if len(records) > 0:
            records_output = [
                {
                    "id": i.id,
                    "name": i.name,
                    "password": i.password,
                    "email": i.email,
                    "posts": [
                        {
                            "id": record.id,
                            "title": record.title,
                            "subtitle": record.subtitle,
                            "date": record.date,
                            "body": record.body,
                            "original_author": record.author,
                            "img_url": record.img_url,
                            "user_id": record.user_id,
                            "comments": [
                                {"id": i.comment, "user": i.comment_by.name}
                                for i in i.comment
                            ],
                        }
                        for record in i.blogs
                    ],
                }
                for i in records
            ]
            return records_output

    def get_user(self, name, password):
        record = self.db.session.execute(
            self.db.select(Users).where(Users.name == name)
        ).scalar()
        if record is not None:
            if check_password_hash(record.password, password):
                record_output = {
                    "id": record.id,
                    "name": record.name,
                    "password": record.password,
                    "email": record.email,
                }
                return record_output

    def get_comments(self, post_id):
        records = (
            self.db.session.execute(
                self.db.select(Comments)
                .where(Comments.post_id == post_id)
                .order_by(Comments.id)
            )
            .scalars()
            .all()
        )
        if len(records) > 0:
            return [
                {
                    "id": i.id,
                    "user": i.comment_by.name,
                    "post": i.comment_to.title,
                    "comment": i.comment,
                }
                for i in records
            ]

    def add_comment(self, user_id, post_id, comment):
        record = Comments(user_id=user_id, post_id=post_id, comment=comment)
        self.db.session.add(record)
        try:
            self.db.session.commit()
        except exc.IntegrityError:
            return False
        else:
            return True
