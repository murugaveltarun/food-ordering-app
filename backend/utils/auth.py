# Import bcrypt for secure password hashing
import bcrypt
# Import jwt for creating and decoding JSON Web Tokens
import jwt
# Import datetime and timedelta to set token expiry
from datetime import datetime, timedelta
# Import functools wraps to preserve function signatures in decorators
from functools import wraps
# Import request and jsonify from flask to handle HTTP headers and JSON errors
from flask import request, jsonify
# Import Config to access JWT secret key and expiry
from config import Config
# Import User model to fetch current user from database
from models import User

# Hash a plain text password using bcrypt with salt
def hash_password(plain_password):
    # Convert plain password string to bytes and generate salt and hash
    return bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Verify a plain text password against a stored bcrypt hash
def check_password(plain_password, hashed_password):
    # Compare plain password bytes against the stored hash bytes
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Generate a JWT token containing user id, email, and role
def generate_token(user):
    # Calculate token expiration timestamp
    expiration_time = datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRE_HOURS)
    # Define payload with user identification and expiry
    payload = {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': expiration_time
    }
    # Encode and sign the JWT payload using the secret key
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

# Decorator to protect routes and require a valid JWT token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Initialize token variable
        token = None
        # Check if Authorization header is present in the request
        if 'Authorization' in request.headers:
            # Extract header value
            auth_header = request.headers['Authorization']
            # Bearer token split check
            parts = auth_header.split(' ')
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
        
        # Return 401 error if token is missing
        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is missing!'}), 401
        
        try:
            # Decode the token using the secret key
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            # Fetch the user from the database
            current_user = User.query.get(data['id'])
            # Check if user exists and is active
            if not current_user or not current_user.is_active:
                return jsonify({'success': False, 'message': 'Account is invalid or deactivated!'}), 401
        except jwt.ExpiredSignatureError:
            # Return error if token has expired
            return jsonify({'success': False, 'message': 'Token has expired! Please log in again.'}), 401
        except Exception as e:
            # Return error if token verification failed
            return jsonify({'success': False, 'message': 'Invalid token!'}), 401
        
        # Pass current_user to the decorated route function
        return f(current_user, *args, **kwargs)
    return decorated

# Decorator to restrict access to admin users only
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # First ensure the user is authenticated via token
        return token_required(lambda current_user, *a, **k: (
            # Verify that the authenticated user has the 'admin' role
            f(current_user, *a, **k) if current_user.role == 'admin' 
            else (jsonify({'success': False, 'message': 'Admin access required!'}), 403)
        ))(*args, **kwargs)
    return decorated
