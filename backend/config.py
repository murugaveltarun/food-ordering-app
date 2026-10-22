# Import os module to read environment variables
import os
# Import dotenv to load variables from .env file
from dotenv import load_dotenv

# Load all environment variables from .env file
load_dotenv()

# Configuration class to hold all app parameters
class Config:
    # Read database host from environment or default to localhost
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    # Read database port from environment or default to 3306
    DB_PORT = os.getenv('DB_PORT', '3306')
    # Read database username from environment or default to root
    DB_USER = os.getenv('DB_USER', 'root')
    # Read database password from environment or default to empty string
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    # Read database name from environment or default to food_ordering_db
    DB_NAME = os.getenv('DB_NAME', 'food_ordering_db')

    # Construct the MySQL database URI using PyMySQL driver
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    # Disable SQLAlchemy event tracking to save memory
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT secret key for signing tokens
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_secret_key_123')
    # JWT expiration time in hours
    JWT_EXPIRE_HOURS = 24

    # Email configuration settings
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 'yes']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'orders@foodordering.com')

    # Flask app port
    PORT = int(os.getenv('PORT', 5000))
