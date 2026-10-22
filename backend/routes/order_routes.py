# Import Blueprint, request, and jsonify from flask
from flask import Blueprint, request, jsonify
# Import datetime and random for order number generation
from datetime import datetime
import random
# Import database, models
from models import db, Order, OrderItem, CartItem, FoodItem
# Import token_required decorator
from utils.auth import token_required
# Import mail utility to send order confirmation email
from utils.mailer import send_order_confirmation_email

# Create a Blueprint for order processing routes
order_bp = Blueprint('order_bp', __name__)

# Route to place an order from the user's cart without requiring payment
@order_bp.route('', methods=['POST'])
@token_required
def create_order(current_user):
    # Parse request JSON payload
    data = request.get_json() or {}
    delivery_address = data.get('delivery_address', '').strip()
    phone = data.get('phone', '').strip()

    # Validate that delivery address is provided
    if not delivery_address:
        return jsonify({'success': False, 'message': 'Delivery address is required!'}), 400

    # Retrieve all items from the user's shopping cart
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        return jsonify({'success': False, 'message': 'Your cart is empty!'}), 400

    # Verify inventory stock for each item in cart before placing order
    for item in cart_items:
        food = FoodItem.query.get(item.food_id)
        if not food:
            return jsonify({'success': False, 'message': 'A food item in your cart is no longer available.'}), 400
        if food.stock < item.quantity:
            return jsonify({
                'success': False,
                'message': f'Not enough stock for "{food.name}". Available: {food.stock}'
            }), 400

    # Generate a unique order identifier
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

    # Calculate total order amount and prepare order items list
    total_amount = 0.0
    order_items_to_create = []

    for item in cart_items:
        food = FoodItem.query.get(item.food_id)
        # Calculate final price taking discount into account
        discount = food.discount_percent or 0.0
        final_price = round(food.price * (1 - (discount / 100)), 2)
        subtotal = round(final_price * item.quantity, 2)
        total_amount += subtotal

        # Decrement stock in inventory
        food.stock = max(0, food.stock - item.quantity)

        # Create OrderItem record
        order_item = OrderItem(
            food_id=food.id,
            food_name=food.name,
            price=final_price,
            quantity=item.quantity,
            subtotal=subtotal
        )
        order_items_to_create.append(order_item)

    # Instantiate the master Order record
    new_order = Order(
        order_number=order_number,
        user_id=current_user.id,
        total_amount=round(total_amount, 2),
        delivery_address=delivery_address,
        phone=phone,
        status='Pending'
    )

    # Attach order items to the new order
    new_order.items = order_items_to_create

    # Add order to database session
    db.session.add(new_order)

    # Empty user's shopping cart now that order is created
    CartItem.query.filter_by(user_id=current_user.id).delete()

    # Commit all changes and save order to database
    db.session.commit()

    # Send confirmation email to user's registered email address
    try:
        send_order_confirmation_email(current_user.email, current_user.name, new_order)
    except Exception as e:
        print(f"[ORDER EMAIL WARNING] Could not send confirmation email: {e}")

    # Return success response with order details
    return jsonify({
        'success': True,
        'message': f'Order {order_number} created successfully! Confirmation sent to {current_user.email}',
        'order': new_order.to_dict()
    }), 201

# Route to get all orders placed by the current authenticated user
@order_bp.route('', methods=['GET'])
@token_required
def get_user_orders(current_user):
    # Fetch orders sorted by creation time descending (latest first)
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()

    # Return list of serialized orders
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200

# Route to get specific details of a single order by ID
@order_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_order_by_id(current_user, order_id):
    # Query order ensuring it belongs to current user or user is an admin
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found!'}), 404

    # Allow access if user owns order or is an administrator
    if order.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized to view this order!'}), 403

    # Return order details
    return jsonify({
        'success': True,
        'order': order.to_dict()
    }), 200
