from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(180), unique=False, nullable=False)
    salt = db.Column(db.String(120), unique=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=db.func.now(), )
    updated_at = db.Column(db.DateTime(timezone=True), default=db.func.now(), onupdate=db.func.now(),)

    