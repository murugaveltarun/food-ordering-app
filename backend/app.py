# Import Flask and jsonify
from flask import Flask, jsonify
# Import CORS to allow cross-origin requests from React frontend
from flask_cors import CORS
# Import app configuration class
from config import Config
# Import SQLAlchemy db instance and models
from models import db, User, FoodItem
# Import password hashing function to create initial admin and demo user
from utils.auth import hash_password
# Import all route blueprints
from routes.auth_routes import auth_bp
from routes.food_routes import food_bp
from routes.cart_routes import cart_bp
from routes.order_routes import order_bp
from routes.admin_routes import admin_bp

# Initialize the Flask application
app = Flask(__name__)

# Apply configuration parameters from Config class
app.config.from_object(Config)

# Enable CORS for all routes so the React frontend can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Bind SQLAlchemy to the Flask app
db.init_app(app)

# Register route blueprints with their respective API URL prefixes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(food_bp, url_prefix='/api/food')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(order_bp, url_prefix='/api/orders')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Root health check endpoint
@app.route('/')
def home():
    # Return basic API status message
    return jsonify({
        'status': 'online',
        'message': 'Food Ordering API is running smoothly!'
    })

# Function to seed the database with initial admin, demo user, and appetizing food items
def seed_database():
    # Check if admin user already exists
    admin_user = User.query.filter_by(email='admin@food.com').first()
    if not admin_user:
        # Create default admin account with hashed password
        admin = User(
            name='Master Admin',
            email='admin@food.com',
            password_hash=hash_password('admin123'),
            role='admin',
            is_active=True
        )
        db.session.add(admin)
        print("[DATABASE SEED] Created default admin account: admin@food.com / admin123")

    # Check if demo customer user exists
    demo_user = User.query.filter_by(email='user@food.com').first()
    if not demo_user:
        # Create default customer account with hashed password
        user = User(
            name='John Doe',
            email='user@food.com',
            password_hash=hash_password('user123'),
            role='user',
            is_active=True
        )
        db.session.add(user)
        print("[DATABASE SEED] Created demo user account: user@food.com / user123")

    # Check if food items table is empty
    if FoodItem.query.count() == 0:
        # Sample food items with delicious descriptions, realistic images, stock, and discounts
        sample_foods = [
            FoodItem(
                name="Truffle Mushroom Burger",
                description="Juicy Angus beef patty topped with sautéed wild mushrooms, Swiss cheese, and truffle aioli on a brioche bun.",
                category="Burgers",
                price=14.99,
                discount_percent=15.0,
                stock=30,
                image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                is_featured=True
            ),
            FoodItem(
                name="Woodfired Margherita Pizza",
                description="Authentic Neapolitan pizza topped with San Marzano tomato sauce, fresh buffalo mozzarella, and fresh basil.",
                category="Pizza",
                price=16.50,
                discount_percent=10.0,
                stock=25,
                image_url="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80",
                is_featured=True
            ),
            FoodItem(
                name="Crispy Spicy Chicken Wings",
                description="Double-fried golden crispy chicken wings tossed in our signature smoky buffalo glaze with ranch dip.",
                category="Sides",
                price=11.99,
                discount_percent=0.0,
                stock=40,
                image_url="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80",
                is_featured=True
            ),
            FoodItem(
                name="Japanese Tonkotsu Ramen",
                description="Rich 12-hour pork broth served with ramen noodles, tender chashu pork, soft-boiled ajitsuke egg, and scallions.",
                category="Asian",
                price=15.50,
                discount_percent=20.0,
                stock=20,
                image_url="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
                is_featured=True
            ),
            FoodItem(
                name="BBQ Bacon Smash Burger",
                description="Two crispy beef patties, Applewood smoked bacon, melted cheddar cheese, onion rings, and tangy BBQ sauce.",
                category="Burgers",
                price=13.99,
                discount_percent=0.0,
                stock=35,
                image_url="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
                is_featured=False
            ),
            FoodItem(
                name="Creamy Alfredo Fettuccine",
                description="Fresh fettuccine pasta in rich garlic parmesan cream sauce, garnished with parsley and cracked black pepper.",
                category="Pasta",
                price=13.50,
                discount_percent=5.0,
                stock=20,
                image_url="https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80",
                is_featured=False
            ),
            FoodItem(
                name="Chocolate Lava Molten Cake",
                description="Warm, decadent Belgian dark chocolate cake with a gooey flowing center, served with vanilla bean ice cream.",
                category="Desserts",
                price=8.99,
                discount_percent=10.0,
                stock=15,
                image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
                is_featured=True
            ),
            FoodItem(
                name="Mango Passionfruit Smoothie",
                description="Chilled tropical blend of ripe alphonso mango, passionfruit nectar, and creamy Greek yogurt.",
                category="Beverages",
                price=5.99,
                discount_percent=0.0,
                stock=50,
                image_url="https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
                is_featured=False
            ),
            FoodItem(
                name="Classic Pepperoni Pizza",
                description="Crispy golden crust loaded with savory pepperoni slices, melted whole-milk mozzarella, and oregano.",
                category="Pizza",
                price=15.99,
                discount_percent=0.0,
                stock=30,
                image_url="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
                is_featured=False
            )
        ]
        # Add all sample food items to database session
        for food in sample_foods:
            db.session.add(food)
        print("[DATABASE SEED] Seeded sample menu items with discounts & stock levels.")

    # Commit all seed data to database
    db.session.commit()

# Helper function to initialize database tables and seed data
def init_db():
    with app.app_context():
        # Create all tables on MySQL database
        db.create_all()
        print("[DATABASE] Connected to MySQL and initialized tables successfully.")
        # Seed initial admin, user, and food items
        seed_database()

# Main entry point to start the Flask development server
if __name__ == '__main__':
    # Initialize database tables and initial seed data
    init_db()
    # Run server on configured port with debug mode enabled
    print(f"[SERVER] Starting Food Ordering API server on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
