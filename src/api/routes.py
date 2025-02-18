from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, User, Product, Order, OrderItem, Invoice
from api.utils import generate_sitemap, APIException, generate_invoice
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import cloudinary.uploader as uploader
from base64 import b64encode
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import tempfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime, timedelta

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

sales_report_bp = Blueprint("sales_report_bp", __name__)

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
            return jsonify({"message": "Necesitamos email y password"}), 400   

        user = User.query.filter_by(email=email).one_or_none()

        if user is None:
            return jsonify({"message": "Credenciales erradas"}), 400 
        
        # 🔹 Verificar si el usuario está deshabilitado
        if not user.is_active:
            return jsonify({"message": "Tu cuenta ha sido deshabilitada. Contacta al administrador."}), 403

        # 🔹 Verificar credenciales
        if check_password_hash(user.password, f"{password}{user.salt}"):
            token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
            return jsonify({"token": token, "role": user.role})  
        else:
            return jsonify({"message": "Credenciales erradas"}), 400 

    except Exception as err:
        return jsonify(f"Error: {err}"), 500

    
@api.route('/products', methods=['POST'])
@jwt_required()
def add_product():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"message": "No tienes permisos para agregar productos"}), 403

    name = request.form.get("name")
    price = request.form.get("price")
    stock = request.form.get("stock", 0)

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
        stock=int(stock),  
        image_path=image_url  
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Producto creado",
        "product_id": product.id,
        "image_url": image_url
    }), 201

@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()  
def delete_product(product_id):
    current_user_id = get_jwt_identity()  
    current_user = User.query.get(current_user_id)

    # 🔹 Verificar si el usuario es administrador
    if not current_user or current_user.role != "admin":
        return jsonify({"message": "No tienes permisos para eliminar productos"}), 403

    # 🔹 Buscar el producto en la base de datos
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    try:
        db.session.delete(product)  # Eliminar producto
        db.session.commit()  # Guardar cambios en la base de datos

        return jsonify({"message": "Producto eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()  # Revertir en caso de error
        return jsonify({"error": f"Error al eliminar el producto: {str(e)}"}), 500

@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def edit_product(product_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"message": "No tienes permisos para editar productos"}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Producto no encontrado"}), 404

    body = request.json
    product.name = body.get("name", product.name)
    product.price = body.get("price", product.price)
    product.stock = body.get("stock", product.stock)

    try:
        db.session.commit()
        return jsonify({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "stock": product.stock
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al actualizar el producto: {str(e)}"}), 500



@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    body = request.json
    items = body.get("items")

    if not items:
        return jsonify({"error": "Faltan datos"}), 400

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    order = Order(user_id=current_user_id)
    db.session.add(order)
    db.session.flush()

    total_price = 0
    for item in items:
        product = Product.query.get(item["product_id"])
        if not product or product.stock < item["quantity"]:
            return jsonify({"error": f"Producto {item['product_id']} sin stock suficiente"}), 400

        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=item["quantity"])
        db.session.add(order_item)

        product.stock -= item["quantity"]
        total_price += product.price * item["quantity"]

    db.session.commit()

    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = temp_file.name

    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.drawString(100, 750, f"Factura para la Orden #{order.id}")
    c.drawString(100, 730, f"Cliente: {user.name}")
    c.drawString(100, 710, f"Email: {user.email}")
    c.drawString(100, 690, "Detalles de la compra:")

    y_position = 670
    for item in items:
        product = Product.query.get(item["product_id"])
        c.drawString(100, y_position, f"{product.name} - {item['quantity']} x ${product.price:.2f}")
        y_position -= 20

    c.drawString(100, y_position - 20, f"Total: ${total_price:.2f}")
    c.save()

    
    upload_result = cloudinary.uploader.upload(pdf_path, resource_type="raw")

    
    invoice = Invoice(order_id=order.id, file_url=upload_result["secure_url"])
    db.session.add(invoice)
    db.session.commit()

   
    os.remove(pdf_path)

    return jsonify({"message": "Orden creada", "order_id": order.id, "invoice_url": upload_result["secure_url"]}), 201



    
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
            "is_active": user.is_active  # ➡️ Agregar estado activo/inactivo
        } for user in users]

        return jsonify({"users": users_list}), 200

    except Exception as e:
        print(f"Error en get_users: {e}")  
        return jsonify({"message": "Ha ocurrido un error"}), 500
  
    
@api.route('/orders', methods=['GET'])
@jwt_required()  
def get_orders():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"message": "No tienes permisos para ver esta información"}), 403

    
    orders = db.session.query(Order).order_by(Order.created_at.desc()).all()

    orders_list = [
        {
            "id": order.id,
            "created_at": order.created_at.isoformat(),
            "seller": {
                "id": order.user_id,
                "name": db.session.get(User, order.user_id).name if db.session.get(User, order.user_id) else "Desconocido"
            },
            "total_price": sum(item.product.price * item.quantity for item in order.items),
            "items": [
                {
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "price": item.product.price
                }
                for item in order.items
            ]
        }
        for order in orders
    ]

    return jsonify({"orders": orders_list}), 200

@api.route('/orders/<int:order_id>/invoice', methods=['GET'])
@jwt_required()
def get_invoice(order_id):
    """Devuelve la URL de la factura en Cloudinary para una orden específica"""
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Orden no encontrada"}), 404

    invoice = Invoice.query.filter_by(order_id=order.id).first()
    if not invoice:
        return jsonify({"error": "Factura no encontrada para esta orden"}), 404

    return jsonify({
        "message": "Factura encontrada",
        "invoice_url": invoice.file_url
    }), 200




@api.route("/salesreport", methods=["GET"])
def get_sales_report():
    start_date_str = request.args.get("start_date", None)  
    end_date_str = request.args.get("end_date", None)  

    if not start_date_str or not end_date_str:
        return jsonify({"error": "Debes proporcionar start_date y end_date en formato YYYY-MM-DD"}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d") + timedelta(days=1)  
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido. Usa YYYY-MM-DD"}), 400

    
    orders = Order.query.filter(Order.created_at >= start_date, Order.created_at < end_date).all()

    total_sales = len(orders)
    total_revenue = 0.0
    product_summary = {}

    for order in orders:
        for item in order.items:
            total_revenue += item.product.price * item.quantity
            product_name = item.product.name
            if product_name in product_summary:
                product_summary[product_name]["quantity"] += item.quantity
                product_summary[product_name]["revenue"] += item.product.price * item.quantity
            else:
                product_summary[product_name] = {
                    "quantity": item.quantity,
                    "revenue": item.product.price * item.quantity
                }

    return jsonify({
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "products_sold": [
            {
                "name": name,
                "quantity": data["quantity"],
                "revenue": data["revenue"]
            }
            for name, data in product_summary.items()
        ]
    }), 200
    
@api.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_user_status(user_id):
    """Habilita o deshabilita un usuario (solo admin)"""
    
    admin_id = get_jwt_identity()  
    admin = User.query.get(admin_id)

    if not admin or admin.role != "admin":
        return jsonify({"error": "Acceso no autorizado"}), 403  

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    user.is_active = not user.is_active  
    db.session.commit()

    return jsonify({"message": f"Usuario {'habilitado' if user.is_active else 'deshabilitado'}", "is_active": user.is_active}), 200