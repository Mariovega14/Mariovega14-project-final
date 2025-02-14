from flask import jsonify, url_for
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from flask import send_file



class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)





def generate_invoice(order, file_path):
    """Genera un PDF de factura y lo guarda en file_path."""
    
    c = canvas.Canvas(file_path, pagesize=letter)
    c.drawString(100, 750, f"Factura - Orden #{order.id}")
    c.drawString(100, 730, f"Cliente: {order.user.name}")
    c.drawString(100, 710, f"Fecha: {order.created_at.strftime('%Y-%m-%d')}")

    y_position = 680
    c.drawString(100, y_position, "Productos vendidos:")
    y_position -= 20

    total = 0
    for item in order.items:
        line = f"{item.product.name} - Cantidad: {item.quantity} - Precio: ${item.product.price}"
        c.drawString(100, y_position, line)
        y_position -= 20
        total += item.product.price * item.quantity

    c.drawString(100, y_position - 20, f"Total: ${total}")

    c.save()
    return file_path


def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)



    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"