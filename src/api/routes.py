"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash , check_password_hash
import os 
from base64 import b64encode
from flask_jwt_extended import create_access_token

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)



@api.route('/register', methods=['POST'])
def add_new_user():
    body = request.json
    
    email = body.get("email", None)
    name = body.get("name", None)
    password = body.get("password", None)

    if email is None or password is None or name  is None:
        return jsonify("Todos los datos tienen que estar completos"), 400
    
    else:
        user = User()
        user_exist = user.query.filter_by(email=email).one_or_none()

        if user_exist is not None:
            return jsonify("Usuario ya existe"), 400
        
        salt = b64encode(os.urandom(32)).decode("utf-8")
        password = generate_password_hash(f"{password}{salt}")

        user.name = name
        user.email = email
        user.password = password
        user.salt = salt
        db.session.add(user)

        try:
            db.session.commit()
            return jsonify("Usuario creado sastifactoriamente"), 201
        except Exception as err:
            return jsonify(f"Error: {err.args}"), 500


@api.route('/login', methods=['POST'])
def login():
    try:
        body = request.json
        email = body.get("email", None)
        password = body.get("password", None)

        if email is None or password is None:
            return jsonify({"message" :"Necesitamos email y password"}), 400   

        else:
            user = User.query.filter_by(email=email).one_or_none()

            if user is None:
                return jsonify({"message": "Credenciales erradas"}), 400 
            else:
                if check_password_hash(user.password, f"{password}{user.salt}"):
                    token = create_access_token(identity=user.id)
                    return jsonify({"token":token})
                else:
                    return jsonify({"message": "Credenciales erradas"}), 400 


    except Exception as err:
        return jsonify(f"Error: {err}")