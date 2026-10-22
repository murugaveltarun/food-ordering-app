# Import Blueprint, request, and jsonify from flask
from flask import Blueprint, request, jsonify
# Import database, CartItem, and FoodItem models
from models import db, CartItem, FoodItem
# Import token_required decorator to secure user cart actions
from utils.auth import token_required

# Create a Blueprint for user shopping cart routes
cart_bp = Blueprint('cart_bp', __name__)

# Route to get all items currently in the authenticated user's cart
@cart_bp.route('', methods=['GET'])
@token_required
def get_cart(current_user):
    # Fetch all cart entries belonging to the logged-in user
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    # Serialize items to dictionary list
    serialized = [item.to_dict() for item in cart_items]

    # Calculate overall cart total price
    total_amount = sum(
        (item['food']['final_price'] * item['quantity'])
        for item in serialized if item.get('food')
    )

    # Return serialized items and total bill
    return jsonify({
        'success': True,
        'count': len(cart_items),
        'items': serialized,
        'total_amount': round(total_amount, 2)
    }), 200

# Route to add a food item to the user's cart
@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart(current_user):
    # Parse request JSON payload
    data = request.get_json() or {}
    food_id = data.get('food_id')
    quantity = int(data.get('quantity', 1))

    # Validate that food_id is provided and quantity is positive
    if not food_id or quantity <= 0:
        return jsonify({'success': False, 'message': 'Valid food_id and quantity are required!'}), 400

    # Verify that the food item exists in the database
    food = FoodItem.query.get(food_id)
    if not food:
        return jsonify({'success': False, 'message': 'Food item does not exist!'}), 404

    # Check if stock is available
    if food.stock < quantity:
        return jsonify({'success': False, 'message': f'Only {food.stock} items left in stock!'}), 400

    # Check if the food item is already in user's cart
    existing_item = CartItem.query.filter_by(user_id=current_user.id, food_id=food_id).first()
    if existing_item:
        # Increment existing quantity
        existing_item.quantity += quantity
    else:
        # Create a new cart entry
        new_item = CartItem(user_id=current_user.id, food_id=food_id, quantity=quantity)
        db.session.add(new_item)

    # Commit changes to database
    db.session.commit()

    # Return success confirmation
    return jsonify({
        'success': True,
        'message': f'"{food.name}" added to your cart!'
    }), 200

# Route to update quantity of a specific cart item
@cart_bp.route('/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(current_user, item_id):
    # Parse request JSON payload
    data = request.get_json() or {}
    new_quantity = int(data.get('quantity', 1))

    # Find cart item belonging to this user
    cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    if not cart_item:
        return jsonify({'success': False, 'message': 'Cart item not found!'}), 404

    # If quantity is 0 or negative, remove the item from cart
    if new_quantity <= 0:
        db.session.delete(cart_item)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Item removed from cart!'}), 200

    # Update item quantity
    cart_item.quantity = new_quantity
    db.session.commit()

    # Return updated item
    return jsonify({
        'success': True,
        'message': 'Cart updated successfully!',
        'item': cart_item.to_dict()
    }), 200

# Route to remove an item from user's cart
@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(current_user, item_id):
    # Find cart item belonging to this user
    cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    if not cart_item:
        return jsonify({'success': False, 'message': 'Cart item not found!'}), 404

    # Delete the cart entry
    db.session.delete(cart_item)
    db.session.commit()

    # Return success response
    return jsonify({
        'success': True,
        'message': 'Item removed from your cart!'
    }), 200

# Route to clear all items from the user's cart
@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_cart(current_user):
    # Delete all cart entries for this user
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()

    # Return success confirmation
    return jsonify({
        'success': True,
        'message': 'Cart cleared successfully!'
    }), 200
