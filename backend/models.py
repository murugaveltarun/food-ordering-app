# Import SQLAlchemy instance container
from flask_sqlalchemy import SQLAlchemy
# Import datetime for timestamp fields
from datetime import datetime

# Initialize SQLAlchemy database instance
db = SQLAlchemy()

# User model to store registered user and admin details
class User(db.Model):
    # Table name in database
    __tablename__ = 'users'

    # Unique user ID as primary key
    id = db.Column(db.Integer, primary_key=True)
    # Full name of the user
    name = db.Column(db.String(100), nullable=False)
    # Email address of the user (must be unique)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Password hashed with bcrypt for security
    password_hash = db.Column(db.String(255), nullable=False)
    # Role: 'user' for customers, 'admin' for restaurant administrators
    role = db.Column(db.String(20), default='user')
    # Active status: admin can disable/enable user accounts
    is_active = db.Column(db.Boolean, default=True)
    # Timestamp when the account was registered
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Convert user object to dictionary format for JSON responses
    def to_dict(self):
        # Return user details excluding the sensitive password hash
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

# FoodItem model to store menu items, stock, discounts and featured flag
class FoodItem(db.Model):
    # Table name in database
    __tablename__ = 'food_items'

    # Unique food item ID as primary key
    id = db.Column(db.Integer, primary_key=True)
    # Name of the food item
    name = db.Column(db.String(100), nullable=False)
    # Short description of ingredients or taste
    description = db.Column(db.Text, nullable=True)
    # Category like Burgers, Pizza, Drinks, Desserts
    category = db.Column(db.String(50), nullable=False, default='General')
    # Original price of the food item in dollars/rupees
    price = db.Column(db.Float, nullable=False)
    # Discount percentage offered on this item (0 to 100)
    discount_percent = db.Column(db.Float, default=0.0)
    # Available quantity in inventory stock
    stock = db.Column(db.Integer, default=50)
    # Image URL to display the food photo
    image_url = db.Column(db.String(300), nullable=True)
    # Flag to indicate if item should appear on the Featured page
    is_featured = db.Column(db.Boolean, default=False)
    # Timestamp when food item was added
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Convert food item to dictionary with calculated discounted price
    def to_dict(self):
        # Calculate final discounted price safely
        discount = self.discount_percent or 0.0
        final_price = round(self.price * (1 - (discount / 100)), 2)
        # Return structured food item data
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'price': self.price,
            'discount_percent': self.discount_percent,
            'final_price': final_price,
            'stock': self.stock,
            'image_url': self.image_url,
            'is_featured': self.is_featured,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

# CartItem model to store items added to cart by a logged-in user
class CartItem(db.Model):
    # Table name in database
    __tablename__ = 'cart_items'

    # Unique cart item ID as primary key
    id = db.Column(db.Integer, primary_key=True)
    # ID of the user who owns this cart item
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # ID of the food item in the cart
    food_id = db.Column(db.Integer, db.ForeignKey('food_items.id'), nullable=False)
    # Quantity of this food item ordered
    quantity = db.Column(db.Integer, default=1)

    # Establish relationship to access the related FoodItem
    food = db.relationship('FoodItem', backref='cart_entries')

    # Convert cart item to dictionary including food item details
    def to_dict(self):
        # Return cart entry with nested food information
        return {
            'id': self.id,
            'user_id': self.user_id,
            'food_id': self.food_id,
            'quantity': self.quantity,
            'food': self.food.to_dict() if self.food else None
        }

# Order model to store placed orders
class Order(db.Model):
    # Table name in database
    __tablename__ = 'orders'

    # Unique order ID as primary key
    id = db.Column(db.Integer, primary_key=True)
    # Human-readable order number like ORD-20250101-123
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    # ID of the customer who placed the order
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # Total billed amount of the order
    total_amount = db.Column(db.Float, nullable=False)
    # Delivery address entered by the customer
    delivery_address = db.Column(db.Text, nullable=True)
    # Customer contact phone number
    phone = db.Column(db.String(20), nullable=True)
    # Current order status (e.g., Pending, Preparing, Delivered)
    status = db.Column(db.String(50), default='Pending')
    # Timestamp when order was placed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to user who placed the order
    user = db.relationship('User', backref='orders')
    # Relationship to get all line items of this order
    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan')

    # Convert order object to dictionary with items and customer info
    def to_dict(self):
        # Return complete order details
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'customer_name': self.user.name if self.user else 'Unknown',
            'customer_email': self.user.email if self.user else 'Unknown',
            'total_amount': self.total_amount,
            'delivery_address': self.delivery_address,
            'phone': self.phone,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

# OrderItem model to store individual items inside an order
class OrderItem(db.Model):
    # Table name in database
    __tablename__ = 'order_items'

    # Unique order item ID as primary key
    id = db.Column(db.Integer, primary_key=True)
    # ID of the parent order
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    # ID of the food item ordered
    food_id = db.Column(db.Integer, nullable=False)
    # Saved name of the food item at the time of order
    food_name = db.Column(db.String(100), nullable=False)
    # Unit price at the time of purchase
    price = db.Column(db.Float, nullable=False)
    # Quantity ordered
    quantity = db.Column(db.Integer, nullable=False)
    # Total price for this line item (price * quantity)
    subtotal = db.Column(db.Float, nullable=False)

    # Convert order line item to dictionary
    def to_dict(self):
        # Return line item fields
        return {
            'id': self.id,
            'order_id': self.order_id,
            'food_id': self.food_id,
            'food_name': self.food_name,
            'price': self.price,
            'quantity': self.quantity,
            'subtotal': self.subtotal
        }
