from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from models import db, User
from flask_bcrypt import Bcrypt
from flask_session import Session
from config import ApplicationConfig

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

bcrypt = Bcrypt(app)
server_session = Session(app)


db.init_app(app)
with app.app_context():
    db.create_all()


@app.route("/user", methods=["GET"])
def current_user():
    """Retrives the current user's credentials
    Args: None
    Return: the  
        response email and id
    """
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email
        })

@app.route("/users", methods=["GET"])
def users_list():
    """Retrives the current users from records
    Args: None
    Return: the  
        response email and id
    """
    users = User.query.order_by(User.email).all()
    return jsonify({"users": str(users)})

@app.route("/register", methods=["POST"])
def register():
    """Registers a user
    Args:
        request: request object with parameters, email and password
    Returns: the user id
    """
    email = request.json["email"]
    password = request.json["password"]
    user = User.query.filter_by(email=email).first() is not None
    if user:
        return jsonify({"error": "User with given email already registers"}), 409
    hash_pwd = bcrypt.generate_password_hash(password)
    new_user = User(email=email, _password=hash_pwd)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "id": new_user.id,
        "email": user.email
        })

@app.route("/login", methods=["POST"])
def logIn():
    """Logs in a user
    Args:
        request, with email and password params
    Returns
        User id
    """
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email).first()
    if user is None:
        return jsonify({"error": "Unauthorized"}), 401
    if not bcrypt.check_password_hash(user._password, password):
        return jsonify({"error": "Unauthorized"}), 401
    session["user_id"] = user.id
    
    return jsonify({
        "id": user.id,
        "email": user.email
        })

@app.route("/unregister", methods=["DELETE"])
def delete_account():
    """Removes in a user
    Args:
        request, with email and password params
    Returns
        User id
    """
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email).first()
    if user is None:
        return jsonify({"error": "User does not exist"}), 404
    if not bcrypt.check_password_hash(user._password, password):
        return jsonify({"error": "Unauthorized"}), 401
    session["user_id"] = user.id
    User.session.delete(user)
    User.session.commit()
    

    return jsonify({
        "email": email,
        "status": "removed"
        })


if __name__ == "__main__":
    app.run(debug=True)
