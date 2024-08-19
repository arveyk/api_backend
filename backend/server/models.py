from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()


def gen_uuid():
    """Generates UUID string
    Args: none
    Return: uuid string
    """
    return uuid.uuid4().hex


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(40),
                   primary_key=True, unique=True, default=gen_uuid())
    email = db.Column(db.String(250), unique=True)
    _password = db.Column(db.Text, nullable=False)
