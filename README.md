# 🍔 FoodieBite — Online Food Ordering Platform

A clean, modern, full-stack food ordering web application built with React, Tailwind CSS, Python Flask, and MySQL.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite) + **Tailwind CSS v3** + React Router + Lucide Icons + Axios
- **Backend**: Python Flask + Flask-SQLAlchemy + PyMySQL + PyJWT + bcrypt + smtplib
- **Database**: MySQL (`food_ordering_db`)
- **Authentication**: JWT (JSON Web Tokens) with secure bcrypt password hashing
- **Notifications**: Automated order confirmation email delivery via Google SMTP (no payment required)

---

## 📁 Folder Structure

```
food-ordering-app/
├── backend/
│   ├── .env                  # Parameterized settings (DB credentials, JWT key, Mail settings)
│   ├── config.py             # Configuration loader with single-line comments
│   ├── models.py             # SQLAlchemy models (User, FoodItem, CartItem, Order, OrderItem)
│   ├── app.py                # Main Flask application & auto-seed
│   ├── database.sql          # Complete MySQL schema & data population script
│   ├── requirements.txt      # Python dependencies
│   ├── test_api.py           # End-to-end integration test script
│   ├── utils/
│   │   ├── auth.py           # JWT generation, verification, and bcrypt hashing
│   │   └── mailer.py         # Order confirmation email notification utility (Google SMTP)
│   └── routes/
│       ├── auth_routes.py    # Login, register, profile
│       ├── food_routes.py    # Menu, featured items, categories
│       ├── cart_routes.py    # Cart CRUD actions & stock checks
│       ├── order_routes.py   # Order placement, real-time stock deduction, order history
│       └── admin_routes.py   # Analytics, stock & discount management, user management
│
└── frontend/
    ├── .env                  # Parameterized backend API Base URL
    ├── package.json          # Node dependencies
    ├── tailwind.config.js    # Tailwind CSS v3 configuration
    ├── postcss.config.js     # PostCSS configuration
    ├── index.html            # Main HTML with Outfit Google font
    └── src/
        ├── api.js            # Axios client with JWT interceptor
        ├── main.jsx          # React DOM entry
        ├── App.jsx           # Routing & protected routes
        ├── index.css         # Tailwind CSS directives
        ├── context/
        │   ├── AuthContext.jsx # Global user auth & JWT token state
        │   └── CartContext.jsx # Global shopping cart state
        ├── components/
        │   ├── Navbar.jsx    # Responsive header with cart counter & admin navigation
        │   └── FoodCard.jsx  # Card with image, discount badge, stock status & out-of-stock overlay
        └── pages/
            ├── Featured.jsx  # Hero interactive carousel, demand urgency & delivery highlights
            ├── Menu.jsx      # Menu browsing, search, and category filters
            ├── Cart.jsx      # Cart review, delivery address, place order
            ├── Orders.jsx    # Past orders & live delivery status tracking
            ├── Login.jsx     # Login with 1-click Demo filler buttons
            ├── Register.jsx  # Customer & Admin sign-up
            └── admin/
                ├── AdminDashboard.jsx  # Business analytics, sales, top items, orders
                ├── StockManagement.jsx # Inventory stock & discount % manager
                └── UserManagement.jsx  # User account oversight & active/deactivate toggle
```

---

## 🗄️ Database Setup & Population (`database.sql`)

The repository includes a complete SQL file: **`backend/database.sql`**.

This file automatically:
1. Creates the `food_ordering_db` database.
2. Creates all tables (`users`, `food_items`, `cart_items`, `orders`, `order_items`) with foreign keys and cascade rules.
3. Inserts initial users with bcrypt-hashed passwords.
4. Populates **22 gourmet food items** across 8 categories with accurate high-res food photos, prices, discounts, and inventory counts.
5. Populates sample orders and order items so the Admin Analytics Dashboard displays live sales metrics immediately.

### How to Run `database.sql`:

#### Option A — Via MySQL Command Line (Terminal / PowerShell):
```bash
cd backend
mysql -u root -p < database.sql
```
*(Enter your MySQL root password when prompted)*

#### Option B — Via MySQL Workbench:
1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Click **File** &rarr; **Open SQL Script...** and select `backend/database.sql`.
3. Click the ⚡ **Execute** (lightning bolt) icon to run all queries.
4. Refresh the schema list on the left to see `food_ordering_db` populated with tables and data.

#### Option C — Via phpMyAdmin / XAMPP:
1. Open **http://localhost/phpmyadmin**.
2. Click the **Import** tab at the top.
3. Click **Choose File** and select `backend/database.sql`.
4. Click **Go** at the bottom to run the import.

---

## 🔑 Default Login Credentials

| Role | Email | Password | Access & Features |
|------|-------|----------|-------------------|
| **Admin** | `admin@food.com` | `admin123` | Full access to Admin Portal, Stock Management, Discounts, Analytics & User Management |
| **Customer** | `user@food.com` | `user123` | Browse menu, interactive hero carousel, add to cart, and place orders with email receipts |

> 💡 **Tip**: On the **Sign In** page, click the **"Fill Customer"** or **"Fill Admin"** button for instant one-click login!

---

## 📧 Email Notification Setup (Google SMTP)

When a customer places an order, an itemized order receipt is dispatched directly to their registered email address using Google SMTP.

The credentials are parameterized in `backend/.env`:
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_16_character_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
```

*Note: For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) rather than your standard account password.*

---

## ⚙️ How to Run the Application

### 1. Set Up the MySQL Database (Load `database.sql`)
Before launching the backend, create the database and populate all tables:
* **Option A — Terminal / PowerShell:**
  ```bash
  cd backend
  mysql -u root -p < database.sql
  ```
* **Option B — MySQL Workbench / phpMyAdmin:**
  Open `backend/database.sql`, select all, and click **Execute (⚡)**.

This creates the `food_ordering_db` schema, builds all foreign key tables, and seeds default accounts and 22 gourmet menu items.

### 2. Configure Backend Environment
Verify or update `backend/.env` with your local MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=food_ordering_db
```

### 3. Start the Flask Backend (Port 5000)
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```

### 4. Start the React Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 📦 Features Summary

### 👤 User Portal
1. **Interactive Hero Carousel**: Auto-advancing showcase of daily featured specials with urgency indicators (*"Selling Fast! Only X Left"*), direct one-click ordering, and price tags.
2. **Food-Delivery Highlights**: Quick highlights for 30-min delivery, freshly prepared food, and contactless drop-off.
3. **Explore Menu**: Filter dishes across 8 categories (*Burgers, Pizza, Sides, Asian, Pasta, Seafood, Indian, Desserts, Beverages*), real-time name/description search, and "Offers Only" discount filter.
4. **Out-of-Stock Protection**:
   - Out-of-stock dishes display a prominent `"Out of Stock"` overlay.
   - The `"Add to Cart"` and `"Order Now"` buttons are disabled with `cursor-not-allowed`.
   - Backend APIs reject quantities exceeding available stock (`400 Bad Request`).
   - Placing an order automatically deducts inventory in real-time.
5. **Shopping Cart & Checkout (No Payment)**: Review items, adjust quantities, see original vs. discounted totals, enter delivery address & phone; an instant email confirmation is dispatched upon order creation.
6. **My Orders**: View previous orders, itemized receipts, and delivery statuses (*Pending, Preparing, Out for Delivery, Delivered*).

### 🛡️ Admin Portal
1. **Analytics Dashboard**: Live overview of Total Revenue, Total Orders, Registered Users, Low Stock Warnings, Top Selling Dishes, and Recent Orders.
2. **Stock & Discount Management**:
   - Add new food items with name, category, price, discount percentage, stock, and image URL.
   - Quick inline stock increment/decrement buttons (`+5`, `-5`).
   - Edit pricing, discounts, and toggle "Featured" status.
   - Delete items from the menu.
3. **User Management**: View all registered accounts, see roles (*Customer* vs. *Admin*), and toggle account active/deactivated status.
4. **Order Status Controls**: Change order statuses in real-time (*Pending* &rarr; *Preparing* &rarr; *Out for Delivery* &rarr; *Delivered*).

---

## 🧪 Automated Testing
Run the included integration test suite:
```bash
cd backend
python test_api.py
```
