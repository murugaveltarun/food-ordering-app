# Import Blueprint, request, and jsonify from flask
from flask import Blueprint, request, jsonify
# Import database and FoodItem model
from models import db, FoodItem

# Create a Blueprint for food items and public menu routes
food_bp = Blueprint('food_bp', __name__)

# Route to fetch all food items with optional category filtering and search
@food_bp.route('', methods=['GET'])
def get_all_food():
    # Read category query parameter from URL
    category = request.args.get('category', '').strip()
    # Read search query parameter from URL
    search = request.args.get('search', '').strip()

    # Start base query for FoodItem
    query = FoodItem.query

    # Apply category filter if specified
    if category and category.lower() != 'all':
        query = query.filter_by(category=category)

    # Apply search filter across food name or description
    if search:
        query = query.filter(
            (FoodItem.name.ilike(f"%{search}%")) | 
            (FoodItem.description.ilike(f"%{search}%"))
        )

    # Execute query ordered by category and name
    items = query.order_by(FoodItem.category, FoodItem.name).all()

    # Return serialized list of food items
    return jsonify({
        'success': True,
        'count': len(items),
        'items': [item.to_dict() for item in items]
    }), 200

# Route to fetch featured food items for the featured landing page
@food_bp.route('/featured', methods=['GET'])
def get_featured_food():
    # Query items that are marked as featured OR have a discount applied
    featured_items = FoodItem.query.filter(
        (FoodItem.is_featured == True) | (FoodItem.discount_percent > 0)
    ).limit(8).all()

    # If fewer than 4 items found, fallback to latest food items
    if len(featured_items) < 4:
        featured_items = FoodItem.query.order_by(FoodItem.id.desc()).limit(6).all()

    # Return serialized list of featured items
    return jsonify({
        'success': True,
        'items': [item.to_dict() for item in featured_items]
    }), 200

# Route to get list of all unique food categories
@food_bp.route('/categories', methods=['GET'])
def get_categories():
    # Query distinct categories from FoodItem table
    categories = db.session.query(FoodItem.category).distinct().all()
    # Flatten the list of category tuples
    category_list = [c[0] for c in categories if c[0]]

    # Return JSON response containing category names
    return jsonify({
        'success': True,
        'categories': category_list
    }), 200

# Route to fetch a single food item by its ID
@food_bp.route('/<int:food_id>', methods=['GET'])
def get_single_food(food_id):
    # Find food item by primary key
    item = FoodItem.query.get(food_id)
    # Return 404 if item does not exist
    if not item:
        return jsonify({'success': False, 'message': 'Food item not found!'}), 404

    # Return serialized food item data
    return jsonify({
        'success': True,
        'item': item.to_dict()
    }), 200
