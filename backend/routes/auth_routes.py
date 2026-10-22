# Import Blueprint, request, and jsonify from flask
from flask import Blueprint, request, jsonify
# Import database and User model
from models import db, User
# Import auth utilities for hashing, checking passwords, and JWT tokens
from utils.auth import hash_password, check_password, generate_token, token_required

# Create a Blueprint for authentication routes
auth_bp = Blueprint('auth_bp', __name__)

# Register route to create a new user account
@auth_bp.route('/register', methods=['POST'])
def register():
    # Parse JSON payload from request body
    data = request.get_json() or {}
    
    # Extract form fields
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'user') # default to user, can be admin if authorized or specified

    # Validate mandatory inputs
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required!'}), 400

    # Check if a user with this email already exists in the database
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this email already exists!'}), 409

    # Hash the plain text password securely using bcrypt
    hashed = hash_password(password)

    # Instantiate new User model
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed,
        role=role if role in ['user', 'admin'] else 'user'
    )

    # Save new user to the database
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT authentication token for immediate login
    token = generate_token(new_user)

    # Return success response with token and user profile
    return jsonify({
        'success': True,
        'message': 'Account registered successfully!',
        'token': token,
        'user': new_user.to_dict()
    }), 201

# Login route to verify credentials and return JWT token
@auth_bp.route('/login', methods=['POST'])
def login():
    # Parse JSON payload from request body
    data = request.get_json() or {}
    
    # Extract email and password credentials
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validate that both email and password are provided
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required!'}), 400

    # Query the user from the database by email
    user = User.query.filter_by(email=email).first()

    # Check if user exists and verify password against bcrypt hash
    if not user or not check_password(password, user.password_hash):
        return jsonify({'success': False, 'message': 'Invalid email or password!'}), 401

    # Check if user account has been disabled by an admin
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Your account has been deactivated. Contact admin.'}), 403

    # Generate a fresh JWT token for the user session
    token = generate_token(user)

    # Return successful login response with token and user details
    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'token': token,
        'user': user.to_dict()
    }), 200

# Me route to fetch profile of currently logged-in user using token
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    # Return active user's profile information
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200
