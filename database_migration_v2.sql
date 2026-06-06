-- JandahaHub Database Migration V2 — Production Ready
-- Run this in your Supabase SQL Editor AFTER the initial schema

-- ============================================================
-- 1. Ride Bookings Table (Customer → Driver flow)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ride_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  vehicle_type TEXT,
  price NUMERIC NOT NULL,
  seats INTEGER DEFAULT 1,
  booking_date TEXT,
  departure_time TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  driver_id UUID REFERENCES public.profiles(id),
  driver_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ride_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ride bookings viewable by all." ON public.ride_bookings FOR SELECT USING (true);
CREATE POLICY "Ride bookings insertable by all." ON public.ride_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Ride bookings updatable by all." ON public.ride_bookings FOR UPDATE USING (true);

-- ============================================================
-- 2. Add shop_id to profiles for shopkeepers
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_name TEXT;

-- ============================================================
-- 3. Add missing columns to products table
-- ============================================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);

-- ============================================================
-- 4. Enable Realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- ============================================================
-- 5. Seed more complete product data (replace sparse initial data)
-- ============================================================
DELETE FROM public.products;

INSERT INTO public.products (name, description, price, image, category, subcategory, shop_name, rating, prep_time, unit, in_stock) VALUES
-- Dhaba items
('Veg Thali', 'Dal, Rice, Roti, Sabzi, Salad', 80, '🍛', 'food', 'dhaba', 'Sharma Ji Ka Dhaba', 4.5, '25 min', NULL, true),
('Non-Veg Thali', 'Chicken Curry, Rice, Roti, Salad', 120, '🍗', 'food', 'dhaba', 'Baba Hotel', 4.3, '30 min', NULL, true),
('Paratha Set', '2 Aloo Paratha + Curd + Pickle', 50, '🫓', 'food', 'dhaba', 'Maa Ki Rasoi', 4.7, '15 min', NULL, true),
('Chole Bhature', '2 Bhature + Chole + Onion', 70, '🍽️', 'food', 'dhaba', 'Sharma Ji Ka Dhaba', 4.4, '20 min', NULL, true),
('Dal Chawal', 'Dal Tadka + Steamed Rice', 60, '🍚', 'food', 'dhaba', 'Maa Ki Rasoi', 4.2, '15 min', NULL, true),
('Paneer Butter Masala', 'Rich Creamy Paneer Curry', 130, '🧈', 'food', 'dhaba', 'New Jandaha Restaurant', 4.6, '25 min', NULL, true),
('Egg Curry Rice', 'Egg Curry + Steamed Rice', 90, '🥚', 'food', 'dhaba', 'Baba Hotel', 4.1, '20 min', NULL, true),
('Biryani (Veg)', 'Fragrant Veg Dum Biryani', 110, '🍲', 'food', 'dhaba', 'New Jandaha Restaurant', 4.5, '35 min', NULL, true),
('Biryani (Chicken)', 'Authentic Chicken Dum Biryani', 160, '🍖', 'food', 'dhaba', 'Baba Hotel', 4.8, '40 min', NULL, true),
('Fish Fry', 'Crispy Fried Fish (2 pcs)', 140, '🐟', 'food', 'dhaba', 'New Jandaha Restaurant', 4.3, '20 min', NULL, true),

-- Bakery items
('Pizza Margherita', 'Classic Cheese Pizza (8 inch)', 149, '🍕', 'food', 'bakery', 'Jandaha Bakery', 4.2, '20 min', NULL, true),
('Cheese Burger', 'Veg Cheese Burger', 89, '🍔', 'food', 'bakery', 'New Star Fast Food', 4.0, '10 min', NULL, true),
('Chicken Burger', 'Crispy Chicken Burger', 109, '🍔', 'food', 'bakery', 'New Star Fast Food', 4.3, '12 min', NULL, true),
('Birthday Cake (1kg)', 'Vanilla/Chocolate — Custom Message', 499, '🎂', 'food', 'bakery', 'Royal Bakers', 4.7, '2 hrs', NULL, true),
('Pastry', 'Fresh Cream Pastry', 35, '🧁', 'food', 'bakery', 'Jandaha Bakery', 4.1, '5 min', NULL, true),
('Samosa (2pc)', 'Crispy Aloo Samosa', 20, '🥟', 'food', 'bakery', 'New Star Fast Food', 4.5, '5 min', NULL, true),
('Bread Pakora', 'Stuffed Bread Pakora (2pc)', 15, '🍞', 'food', 'bakery', 'Jandaha Bakery', 4.0, '5 min', NULL, true),
('Veg Puff', 'Flaky Vegetable Puff', 25, '🥐', 'food', 'bakery', 'Royal Bakers', 4.2, '5 min', NULL, true),
('Cold Coffee', 'Chilled Coffee with Ice Cream', 49, '☕', 'food', 'bakery', 'New Star Fast Food', 4.4, '5 min', NULL, true),
('Chocolate Shake', 'Thick Chocolate Milkshake', 69, '🥤', 'food', 'bakery', 'Jandaha Bakery', 4.3, '5 min', NULL, true),

-- Kirana / Grocery items
('Aata 10kg', 'Premium Wheat Flour (Ashirvaad)', 350, '🌾', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, '10 kg', true),
('Rice 5kg', 'Sona Masoori Rice', 280, '🍚', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, '5 kg', true),
('Toor Dal 1kg', 'Unpolished Toor Dal', 145, '🫘', 'grocery', 'kirana', 'Yadav General Store', 0, NULL, '1 kg', true),
('Sugar 5kg', 'Refined White Sugar', 230, '🍬', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, '5 kg', true),
('Mustard Oil 1L', 'Pure Kachi Ghani Mustard Oil', 185, '🫗', 'grocery', 'kirana', 'Yadav General Store', 0, NULL, '1 L', true),
('Salt 1kg', 'Tata Iodized Salt', 25, '🧂', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, '1 kg', true),
('Tea (Tata) 250g', 'Tata Gold Premium Tea', 110, '🍵', 'grocery', 'kirana', 'Yadav General Store', 0, NULL, '250 g', true),
('Surf Excel 1kg', 'Surf Excel Easy Wash', 180, '🧼', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, '1 kg', true),
('Haldi Powder 200g', 'Pure Turmeric Powder', 45, '🟡', 'grocery', 'kirana', 'Yadav General Store', 0, NULL, '200 g', true),
('Maggi (Pack of 12)', 'Maggi 2-Minute Noodles', 120, '🍜', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, 'Pack of 12', true),
('Biscuit (Parle-G)', 'Parle-G Glucose Biscuits', 10, '🍪', 'grocery', 'kirana', 'Yadav General Store', 0, NULL, '1 pack', true),
('Monthly Ration Kit', 'Aata, Rice, Dal, Oil, Sugar, Salt, Tea, Masala', 1999, '📦', 'grocery', 'kirana', 'Gupta Kirana Store', 0, NULL, 'Full Kit', true),

-- Mandi / Fresh items
('Full Cream Milk 1L', 'Farm Fresh Cow Milk', 60, '🥛', 'essentials', 'mandi', 'Local Dairy', 0, NULL, '1 L', true),
('Eggs (12pc)', 'Farm Fresh Country Eggs', 84, '🥚', 'essentials', 'mandi', 'Local Dairy', 0, NULL, '12 pc', true),
('Tomato 1kg', 'Fresh Red Tomatoes', 40, '🍅', 'essentials', 'mandi', 'Sabzi Mandi', 0, NULL, '1 kg', true),
('Onion 1kg', 'Fresh Onions', 35, '🧅', 'essentials', 'mandi', 'Sabzi Mandi', 0, NULL, '1 kg', true),
('Potato 1kg', 'Fresh Potatoes', 30, '🥔', 'essentials', 'mandi', 'Sabzi Mandi', 0, NULL, '1 kg', true),
('Green Chili 250g', 'Hot Green Chilies', 15, '🌶️', 'essentials', 'mandi', 'Sabzi Mandi', 0, NULL, '250 g', true),
('Coriander Bunch', 'Fresh Dhania Leaves', 10, '🌿', 'essentials', 'mandi', 'Sabzi Mandi', 0, NULL, '1 bunch', true),
('Paneer 250g', 'Fresh Homemade Paneer', 80, '🧀', 'essentials', 'mandi', 'Local Dairy', 0, NULL, '250 g', true),
('Curd 500g', 'Fresh Dahi (Yogurt)', 30, '🥣', 'essentials', 'mandi', 'Local Dairy', 0, NULL, '500 g', true),
('Banana (Dozen)', 'Ripe Yellow Bananas', 50, '🍌', 'essentials', 'mandi', 'Sabzi Mandi', 0, NULL, '1 dozen', true);

-- ============================================================
-- 6. Seed ride routes
-- ============================================================
DELETE FROM public.rides;

INSERT INTO public.rides (from_location, to_location, distance, price, vehicle_type, departure_times, total_seats, icon) VALUES
('Jandaha', 'Hajipur', '45 km', 80, 'Shared Auto', ARRAY['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'], 6, '🛺'),
('Jandaha', 'Patna', '60 km', 200, 'Shared Cab', ARRAY['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM'], 4, '🚕'),
('Jandaha', 'Vaishali', '20 km', 50, 'Shared Auto', ARRAY['7:00 AM', '9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'], 6, '🛺'),
('Jandaha', 'Mahua', '15 km', 40, 'Shared Auto', ARRAY['6:30 AM', '8:30 AM', '10:30 AM', '12:30 PM', '2:30 PM', '4:30 PM'], 6, '🛺'),
('Jandaha', 'Lalganj', '25 km', 60, 'Shared Auto', ARRAY['7:00 AM', '10:00 AM', '1:00 PM', '4:00 PM'], 6, '🛺'),
('Jandaha', 'Muzaffarpur', '55 km', 150, 'Shared Cab', ARRAY['7:00 AM', '10:00 AM', '1:00 PM', '4:00 PM'], 4, '🚕');
