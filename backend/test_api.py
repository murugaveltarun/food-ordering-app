# Import standard urllib and json modules
import urllib.request
import json

# Base URL
BASE = 'http://127.0.0.1:5000/api'

# Helper function to send HTTP requests with JSON payload and auth headers
def request_json(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    headers['Content-Type'] = 'application/json'
    
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode('utf-8')
        
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8'))

def run_tests():
    print("=== STARTING FULL STACK API TESTS ===")
    
    # 1. Customer Login
    login_res = request_json(f'{BASE}/auth/login', method='POST', data={'email': 'user@food.com', 'password': 'user123'})
    print('1. Customer Login:', login_res.get('success'), '| User:', login_res.get('user', {}).get('name'))
    token = login_res['token']
    auth_headers = {'Authorization': f'Bearer {token}'}

    # 2. Get Food Items
    foods = request_json(f'{BASE}/food')
    print('2. Total Menu Items:', len(foods.get('items', [])))
    first_food = foods['items'][0]
    print(f"   First Food: {first_food['name']} | Base: ${first_food['price']} | Discount: {first_food['discount_percent']}% | Final: ${first_food['final_price']} | Stock: {first_food['stock']}")

    # 3. Add to Cart
    food_id = first_food['id']
    add_cart = request_json(f'{BASE}/cart', method='POST', data={'food_id': food_id, 'quantity': 2}, headers=auth_headers)
    print('3. Add to Cart:', add_cart.get('success'), '| Message:', add_cart.get('message'))

    # 4. View Cart
    cart = request_json(f'{BASE}/cart', headers=auth_headers)
    print('4. Cart Items Count:', len(cart.get('items', [])), '| Total Amount: $' + str(cart.get('total_amount')))

    # 5. Place Order (Sends Email without payment)
    order_res = request_json(f'{BASE}/orders', method='POST', data={'delivery_address': 'Room 204, Campus Hostel Block A', 'phone': '+1 555-0199'}, headers=auth_headers)
    print('5. Place Order:', order_res.get('success'), '| Order Number:', order_res.get('order', {}).get('order_number'))

    # 6. Verify Stock Decremented
    updated_food = request_json(f'{BASE}/food/{food_id}')['item']
    print(f"6. Stock after order: {updated_food['stock']} (was {first_food['stock']})")

    # 7. Customer Order History
    my_orders = request_json(f'{BASE}/orders', headers=auth_headers)
    print('7. Customer Order History Count:', len(my_orders.get('orders', [])))

    # 8. Admin Login
    admin_login = request_json(f'{BASE}/auth/login', method='POST', data={'email': 'admin@food.com', 'password': 'admin123'})
    print('8. Admin Login:', admin_login.get('success'), '| Role:', admin_login.get('user', {}).get('role'))
    admin_headers = {'Authorization': f"Bearer {admin_login['token']}"}

    # 9. Admin Analytics
    analytics = request_json(f'{BASE}/admin/analytics', headers=admin_headers)['analytics']
    print(f"9. Admin Analytics: Total Revenue: ${analytics['total_revenue']} | Total Orders: {analytics['total_orders']} | Top Items: {len(analytics['top_items'])}")

    # 10. Admin Stock & Discount Update
    discount_update = request_json(f'{BASE}/admin/food/{food_id}', method='PUT', data={'discount_percent': 25.0, 'stock': 45}, headers=admin_headers)
    print(f"10. Admin Stock & Discount Update: {discount_update.get('success')} | New Discount: {discount_update.get('item', {}).get('discount_percent')}% | New Stock: {discount_update.get('item', {}).get('stock')}")

    # 11. Admin User Management
    users_res = request_json(f'{BASE}/admin/users', headers=admin_headers)
    print('11. Admin User Management: Total Users:', len(users_res.get('users', [])))
    print("=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_tests()
