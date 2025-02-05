from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, User, Product, Order, OrderItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash , check_password_hash
import os
import cloudinary.uploader as uploader
from base64 import b64encode
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@api.route('/register', methods=['POST'])
def add_new_user():
    body = request.json
    
    email = body.get("email", None)
    name = body.get("name", None)
    password = body.get("password", None)
    role = body.get("role", "vendedor")

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
        user.role = role
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

        user = User.query.filter_by(email=email).one_or_none()

        if user is None:
            return jsonify({"message": "Credenciales erradas"}), 400 
        else:
            if check_password_hash(user.password, f"{password}{user.salt}"):
                # Crear el token incluyendo el role en el payload
                token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
                return jsonify({"token": token, "role": user.role})  
            else:
                return jsonify({"message": "Credenciales erradas"}), 400 

    except Exception as err:
        return jsonify(f"Error: {err}")
    
@api.route('/products', methods=['POST'])
def add_product():
    name = request.form.get("name")
    price = request.form.get("price")
    stock = request.form.get("stock", "false").lower() == "true"  

    if not name or price is None:
        return jsonify({"error": "Nombre y precio son obligatorios"}), 400

    file = request.files.get("image")

    image_url = None 

    if file and allowed_file(file.filename):
        try:
            result = uploader.upload(file)  
            image_url = result["secure_url"]  
        except Exception as e:
            return jsonify({"error": f"Error al subir la imagen: {str(e)}"}), 500

    
    product = Product(
        name=name,
        price=float(price),
        stock=stock,  
        image_path=image_url  
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Producto creado",
        "product_id": product.id,
        "image_url": image_url
    }), 201

# @api.route('/products/<int:id>', methods=['PUT'])
# def edit_product(id):
#     product = Product.query.get(id)
    
#     if not product:
#         return jsonify({"error": "Producto no encontrado"}), 404

#     name = request.form.get("name")
#     price = request.form.get("price")
#     stock = request.form.get("stock", "false").lower() == "true"  

#     if not name or price is None:
#         return jsonify({"error": "Nombre y precio son obligatorios"}), 400

#     # Si hay una nueva imagen, la subimos
#     file = request.files.get("image")
#     image_url = product.image_path  # Mantener la imagen existente si no se sube una nueva

#     if file and allowed_file(file.filename):
#         try:
#             result = uploader.upload(file)  
#             image_url = result["secure_url"]  
#         except Exception as e:
#             return jsonify({"error": f"Error al subir la imagen: {str(e)}"}), 500

#     # Actualizar el producto con los nuevos datos
#     product.name = name
#     product.price = float(price)
#     product.stock = stock
#     product.image_path = image_url

#     db.session.commit()

#     return jsonify({
#         "message": "Producto actualizado",
#         "product_id": product.id,
#         "image_url": image_url
#     }), 200


@api.route('/orders', methods=['POST'])
def create_order():
    body = request.json
    user_id = body.get("user_id")
    items = body.get("items")  

    if not user_id or not items:
        return jsonify({"error": "Faltan datos"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Crear la orden
    order = Order(user_id=user_id)
    db.session.add(order)
    db.session.flush()  
    for item in items:
        product = Product.query.get(item["product_id"])
        if not product or not product.stock:  
            return jsonify({"error": f"Producto {item['product_id']} sin stock suficiente"}), 400

        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=item["quantity"])
        db.session.add(order_item)

        
        product.stock = product.stock - item["quantity"] > 0  

    db.session.commit()
    return jsonify({"message": "Orden creada", "order_id": order.id}), 201



    
@api.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()  
    
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "price": p.price,
        "stock": p.stock,
        "image": p.image_path  
    } for p in products]), 200




@api.route('/users', methods=['GET'])
@jwt_required()  
def get_users():
    try:
        current_user_id = get_jwt_identity()  
        current_user = User.query.get(current_user_id)  
        print (current_user_id)

        if not current_user:
            return jsonify({"message": "Usuario no encontrado"}), 404

        if current_user.role != "admin":  
            return jsonify({"message": "No tienes permisos para ver esta información"}), 403

        users = User.query.all()
        users_list = [{
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        } for user in users]

        return jsonify({"users": users_list}), 200

    except Exception as e:
        print(f"Error en get_users: {e}")  
        return jsonify({"message": "Ha ocurrido un error"}), 500  
