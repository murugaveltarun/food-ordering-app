-- ========================================================
-- Database: food_ordering_db
-- FoodieBite - Online Food Ordering Platform Database Dump
-- ========================================================
-- How to run this file:
--   Option 1: In MySQL CLI / Terminal:
--       mysql -u root -p < database.sql
--   Option 2: In MySQL Workbench / phpMyAdmin:
--       Open this file, select all, and execute.
-- ========================================================

CREATE DATABASE IF NOT EXISTS `food_ordering_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `food_ordering_db`;

-- Disable foreign key checks while resetting tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `food_items`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- 1. Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'user',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Table structure for `food_items`
-- --------------------------------------------------------
CREATE TABLE `food_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50) NOT NULL DEFAULT 'General',
  `price` FLOAT NOT NULL,
  `discount_percent` FLOAT DEFAULT 0.0,
  `stock` INT DEFAULT 50,
  `image_url` VARCHAR(300),
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Table structure for `cart_items`
-- --------------------------------------------------------
CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `food_id` INT NOT NULL,
  `quantity` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `total_amount` FLOAT NOT NULL,
  `delivery_address` TEXT,
  `phone` VARCHAR(20),
  `status` VARCHAR(50) DEFAULT 'Pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Table structure for `order_items`
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `food_id` INT NOT NULL,
  `food_name` VARCHAR(100) NOT NULL,
  `price` FLOAT NOT NULL,
  `quantity` INT NOT NULL,
  `subtotal` FLOAT NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- DATA POPULATION
-- ========================================================

-- --------------------------------------------------------
-- Dumping data for table `users`
-- Default Admin:    admin@food.com / admin123
-- Default Customer: user@food.com  / user123
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`) VALUES
  (1, 'System Administrator', 'admin@food.com', '$2b$12$caEspVKXrIlVbBBkkBBRcOFnBaKsxj73Q5KQIvikuneo9mwQ7UWom', 'admin', 1),
  (2, 'Demo Customer', 'user@food.com', '$2b$12$PlQyn4tQpo4MlyLG7BFfhe4yrmYMIDTxjRLlGWu7.5a4OmEndfSqK', 'user', 1);

-- --------------------------------------------------------
-- Dumping data for table `food_items` (22 Gourmet Dishes)
-- --------------------------------------------------------
INSERT INTO `food_items` (`id`, `name`, `description`, `category`, `price`, `discount_percent`, `stock`, `image_url`, `is_featured`) VALUES
  (1, 'Truffle Mushroom Burger', 'Juicy Angus beef patty topped with sautéed wild mushrooms, Swiss cheese, and truffle aioli on a brioche bun.', 'Burgers', 14.99, 15.0, 29, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1),
  (2, 'Woodfired Margherita Pizza', 'Authentic Neapolitan pizza topped with San Marzano tomato sauce, fresh buffalo mozzarella, and fresh basil.', 'Pizza', 16.50, 10.0, 24, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80', 1),
  (3, 'Crispy Spicy Chicken Wings', 'Double-fried golden crispy chicken wings tossed in our signature smoky buffalo glaze with ranch dip.', 'Sides', 11.99, 0.0, 39, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', 1),
  (4, 'Japanese Tonkotsu Ramen', 'Rich 12-hour pork broth served with ramen noodles, tender chashu pork, soft-boiled ajitsuke egg, and scallions.', 'Asian', 15.50, 25.0, 45, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80', 1),
  (5, 'BBQ Bacon Smash Burger', 'Two crispy beef patties, Applewood smoked bacon, melted cheddar cheese, onion rings, and tangy BBQ sauce.', 'Burgers', 13.99, 0.0, 35, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', 0),
  (6, 'Creamy Alfredo Fettuccine', 'Fresh fettuccine pasta in rich garlic parmesan cream sauce, garnished with parsley and cracked black pepper.', 'Pasta', 13.50, 5.0, 20, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80', 0),
  (7, 'Chocolate Lava Molten Cake', 'Warm, decadent Belgian dark chocolate cake with a gooey flowing center, served with vanilla bean ice cream.', 'Desserts', 8.99, 10.0, 12, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', 1),
  (8, 'Mango Passionfruit Smoothie', 'Chilled tropical blend of ripe alphonso mango, passionfruit nectar, and creamy Greek yogurt.', 'Beverages', 5.99, 0.0, 50, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80', 0),
  (9, 'Classic Pepperoni Pizza', 'Crispy golden crust loaded with savory pepperoni slices, melted whole-milk mozzarella, and oregano.', 'Pizza', 15.99, 0.0, 30, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', 0),
  (10, 'Loaded Nachos Supreme', 'Crispy tortilla chips piled high with melted cheddar, jalapenos, seasoned ground beef, guacamole, and sour cream.', 'Sides', 10.99, 0.0, 35, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80', 0),
  (11, 'Mediterranean Grilled Salmon', 'Fresh Atlantic salmon fillet grilled with lemon herb butter, served with roasted asparagus and quinoa pilaf.', 'Seafood', 22.99, 12.0, 12, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80', 1),
  (12, 'Butter Chicken Curry', 'Tender chicken pieces simmered in a rich creamy tomato-based curry sauce with aromatic Indian spices, served with basmati rice.', 'Indian', 14.99, 10.0, 22, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80', 1),
  (13, 'Classic Caesar Salad', 'Crisp romaine lettuce tossed with creamy Caesar dressing, shaved parmesan, garlic croutons, and a squeeze of fresh lemon.', 'Salads', 9.50, 0.0, 40, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80', 0),
  (14, 'Tiramisu Classico', 'Traditional Italian tiramisu layered with espresso-soaked ladyfingers, mascarpone cream, and dusted with premium cocoa.', 'Desserts', 9.99, 15.0, 10, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', 1),
  (15, 'Iced Caramel Latte', 'Smooth double-shot espresso poured over ice with velvety steamed milk and a generous drizzle of buttery caramel syrup.', 'Beverages', 4.99, 0.0, 60, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80', 0),
  (16, 'Spicy Szechuan Noodles', 'Wok-tossed wheat noodles in a fiery Szechuan chili oil sauce with bok choy, shiitake mushrooms, and crispy tofu.', 'Asian', 12.99, 8.0, 18, 'https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&auto=format&fit=crop&q=80', 0),
  (17, 'Double Cheese Quesadilla', 'Flour tortilla stuffed with a blend of mozzarella and cheddar, grilled chicken, caramelized onions, and served with salsa.', 'Mexican', 11.50, 0.0, 28, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&auto=format&fit=crop&q=80', 0),
  (18, 'Garlic Bread Basket', 'Warm sliced baguette toasted with garlic butter, melted parmesan, and fresh Italian parsley. Perfect appetizer.', 'Sides', 5.99, 0.0, 45, 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop&q=80', 0),
  (19, 'Strawberry Cheesecake', 'Velvety New York-style cheesecake with a buttery graham cracker crust, topped with fresh glazed strawberries.', 'Desserts', 8.50, 5.0, 3, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80', 1),
  (20, 'BBQ Pulled Pork Sandwich', 'Slow-smoked pulled pork piled on a brioche bun with tangy coleslaw, pickled jalapenos, and house-made BBQ sauce.', 'Burgers', 13.49, 0.0, 20, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', 0),
  (21, 'Veggie Supreme Pizza', 'Loaded thin crust pizza with bell peppers, mushrooms, black olives, red onions, artichoke hearts, and fresh mozzarella.', 'Pizza', 15.99, 10.0, 18, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80', 0),
  (22, 'Smoked Truffle Risotto', 'Creamy arborio rice with black winter truffles, aged parmesan and wild porcini mushrooms.', 'Mains', 24.99, 0.0, 0, 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800', 1);

-- --------------------------------------------------------
-- Dumping data for table `orders` (Initial Demo Orders for Analytics)
-- --------------------------------------------------------
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `total_amount`, `delivery_address`, `phone`, `status`) VALUES
  (1, 'ORD-20261022-1011', 2, 42.48, '104 Palm Grove Avenue, Suite 4B', '+1 (555) 234-5678', 'Delivered'),
  (2, 'ORD-20261022-2022', 2, 28.98, '221B Baker Street, Apt 3', '+1 (555) 876-5432', 'Preparing'),
  (3, 'ORD-20261022-3033', 2, 19.98, '742 Evergreen Terrace', '+1 (555) 345-6789', 'Pending');

-- --------------------------------------------------------
-- Dumping data for table `order_items`
-- --------------------------------------------------------
INSERT INTO `order_items` (`id`, `order_id`, `food_id`, `food_name`, `price`, `quantity`, `subtotal`) VALUES
  (1, 1, 1, 'Truffle Mushroom Burger', 12.74, 2, 25.48),
  (2, 1, 3, 'Crispy Spicy Chicken Wings', 11.99, 1, 11.99),
  (3, 1, 8, 'Mango Passionfruit Smoothie', 5.99, 1, 5.99),
  (4, 2, 2, 'Woodfired Margherita Pizza', 13.49, 1, 13.49),
  (5, 2, 4, 'Japanese Tonkotsu Ramen', 12.40, 1, 12.40),
  (6, 3, 10, 'Loaded Nachos Supreme', 10.99, 1, 10.99),
  (7, 3, 7, 'Chocolate Lava Molten Cake', 8.09, 1, 8.09);

-- ========================================================
-- End of Database Population Script
-- ========================================================
