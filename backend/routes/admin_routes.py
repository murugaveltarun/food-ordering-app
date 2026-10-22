# Import Blueprint, request, and jsonify from flask
from flask import Blueprint, request, jsonify
# Import database, models
from models import db, User, FoodItem, Order, OrderItem
# Import admin_required decorator to secure all admin endpoints
from utils.auth import admin_required
# Import func from sqlalchemy for aggregation queries
from sqlalchemy import func

# Create a Blueprint for administration routes
admin_bp = Blueprint('admin_bp', __name__)

# Route to get analytical summary metrics for the admin dashboard
@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics(current_user):
    # Total revenue calculated by summing all order amounts
    total_revenue = db.session.query(func.coalesce(func.sum(Order.total_amount), 0.0)).scalar()

    # Total number of orders placed in the system
    total_orders = Order.query.count()

    # Total registered customer accounts
    total_users = User.query.filter_by(role='user').count()

    # Total food items in the restaurant menu
    total_food_items = FoodItem.query.count()

    # Items that have low inventory stock (less than or equal to 10 units)
    low_stock_items = FoodItem.query.filter(FoodItem.stock <= 10).all()

    # Top 5 most ordered food items aggregated from OrderItem table
    top_items_query = db.session.query(
        OrderItem.food_name,
        func.sum(OrderItem.quantity).label('total_qty'),
        func.sum(OrderItem.subtotal).label('total_sales')
    ).group_by(OrderItem.food_name).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    top_items = [
        {'name': item[0], 'quantity_sold': int(item[1]), 'total_revenue': round(float(item[2]), 2)}
        for item in top_items_query
    ]

    # Fetch 5 most recent orders for quick display on dashboard
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()

    # Return aggregated analytics response
    return jsonify({
        'success': True,
        'analytics': {
            'total_revenue': round(float(total_revenue), 2),
            'total_orders': total_orders,
            'total_users': total_users,
            'total_food_items': total_food_items,
            'low_stock_count': len(low_stock_items),
            'low_stock_items': [item.to_dict() for item in low_stock_items],
            'top_items': top_items,
            'recent_orders': [order.to_dict() for order in recent_orders]
        }
    }), 200

# Route to fetch all food items for admin stock and discount management
@admin_bp.route('/food', methods=['GET'])
@admin_required
def get_admin_food_items(current_user):
    # Fetch all food items sorted by category and name
    items = FoodItem.query.order_by(FoodItem.id.desc()).all()
    # Return list of food items
    return jsonify({
        'success': True,
        'items': [item.to_dict() for item in items]
    }), 200

# Route to add a new food item with stock and discount parameters
@admin_bp.route('/food', methods=['POST'])
@admin_required
def add_food_item(current_user):
    # Parse request payload
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    price = data.get('price')

    # Validate required fields
    if not name or price is None:
        return jsonify({'success': False, 'message': 'Food name and price are required!'}), 400

    # Create new FoodItem model instance
    new_food = FoodItem(
        name=name,
        description=data.get('description', '').strip(),
        category=data.get('category', 'General').strip(),
        price=float(price),
        discount_percent=float(data.get('discount_percent', 0.0)),
        stock=int(data.get('stock', 50)),
        image_url=data.get('image_url', '').strip(),
        is_featured=bool(data.get('is_featured', False))
    )

    # Save to database
    db.session.add(new_food)
    db.session.commit()

    # Return created food item
    return jsonify({
        'success': True,
        'message': f'"{new_food.name}" added successfully!',
        'item': new_food.to_dict()
    }), 201

# Route to update an existing food item (stock, discount, pricing, etc.)
@admin_bp.route('/food/<int:food_id>', methods=['PUT'])
@admin_required
def update_food_item(current_user, food_id):
    # Find food item by primary key
    item = FoodItem.query.get(food_id)
    if not item:
        return jsonify({'success': False, 'message': 'Food item not found!'}), 404

    # Parse request updates
    data = request.get_json() or {}

    # Update item properties if provided in request
    if 'name' in data:
        item.name = data['name'].strip()
    if 'description' in data:
        item.description = data['description'].strip()
    if 'category' in data:
        item.category = data['category'].strip()
    if 'price' in data:
        item.price = float(data['price'])
    if 'discount_percent' in data:
        item.discount_percent = float(data['discount_percent'])
    if 'stock' in data:
        item.stock = int(data['stock'])
    if 'image_url' in data:
        item.image_url = data['image_url'].strip()
    if 'is_featured' in data:
        item.is_featured = bool(data['is_featured'])

    # Commit changes to database
    db.session.commit()

    # Return updated item
    return jsonify({
        'success': True,
        'message': f'"{item.name}" updated successfully!',
        'item': item.to_dict()
    }), 200

# Route to delete a food item from the menu
@admin_bp.route('/food/<int:food_id>', methods=['DELETE'])
@admin_required
def delete_food_item(current_user, food_id):
    # Find food item by primary key
    item = FoodItem.query.get(food_id)
    if not item:
        return jsonify({'success': False, 'message': 'Food item not found!'}), 404

    # Remove from database
    db.session.delete(item)
    db.session.commit()

    # Return success confirmation
    return jsonify({
        'success': True,
        'message': f'"{item.name}" deleted successfully!'
    }), 200

# Route to list all registered users for user management
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    # Query all users ordered by creation date
    users = User.query.order_by(User.id.desc()).all()
    # Return serialized user list
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    }), 200

# Route to activate or deactivate a user account
@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def toggle_user_status(current_user, user_id):
    # Find user by ID
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found!'}), 404

    # Prevent admin from deactivating their own account
    if user.id == current_user.id:
        return jsonify({'success': False, 'message': 'You cannot deactivate your own account!'}), 400

    # Toggle the is_active status
    user.is_active = not user.is_active
    db.session.commit()

    # Status message
    status_str = "activated" if user.is_active else "deactivated"
    # Return updated user
    return jsonify({
        'success': True,
        'message': f'User {user.name} has been {status_str}!',
        'user': user.to_dict()
    }), 200

# Route to get all orders for admin review and status management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders(current_user):
    # Fetch all orders ordered by creation date descending
    orders = Order.query.order_by(Order.created_at.desc()).all()
    # Return serialized orders
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200

# Route to update status of an order (e.g. Preparing, Out for Delivery, Delivered)
@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(current_user, order_id):
    # Find order by ID
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found!'}), 404

    # Parse new status from request
    data = request.get_json() or {}
    new_status = data.get('status', '').strip()

    # Validate that status is provided
    if not new_status:
        return jsonify({'success': False, 'message': 'Status is required!'}), 400

    # Update order status
    order.status = new_status
    db.session.commit()

    # Return updated order
    return jsonify({
        'success': True,
        'message': f'Order #{order.order_number} status updated to "{new_status}"!',
        'order': order.to_dict()
    }), 200
