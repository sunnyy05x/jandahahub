-- Supabase Database Schema for JandahaHub
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table (Extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'shopkeeper', 'driver', 'delivery', 'admin')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles (or you can restrict to just their own)
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  category TEXT NOT NULL CHECK (category IN ('food', 'grocery', 'essentials')),
  subcategory TEXT,
  shop_name TEXT,
  in_stock BOOLEAN DEFAULT true,
  unit TEXT,
  rating NUMERIC DEFAULT 0,
  prep_time TEXT,
  freshness TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
-- Only admins/shopkeepers should modify this, but for simplicity we allow read to all.


-- 3. Rides Table (Available Rides/Shuttles)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  distance TEXT,
  price NUMERIC NOT NULL,
  vehicle_type TEXT,
  departure_times TEXT[],
  total_seats INTEGER,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rides are viewable by everyone." ON public.rides FOR SELECT USING (true);


-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  shop_name TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'COD',
  rider_id UUID REFERENCES public.profiles(id),
  rider_earnings NUMERIC DEFAULT 20,
  placed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Everyone can select orders for now to make frontend dev easier, but ideally restrict to owner/shopkeeper/driver
CREATE POLICY "Orders viewable by all." ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders insertable by all." ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders updatable by all." ON public.orders FOR UPDATE USING (true);


-- 5. Insert Initial Mock Data
-- Let's add a few products so your app isn't empty!
INSERT INTO public.products (name, description, price, image, category, subcategory, shop_name) VALUES
('Veg Thali', 'Dal, Rice, Roti, Sabzi, Salad', 80, '🍛', 'food', 'dhaba', 'Sharma Ji Ka Dhaba'),
('Aata 10kg', 'Premium Wheat Flour', 350, '🌾', 'grocery', 'kirana', 'Gupta Kirana Store'),
('Full Cream Milk 1L', 'Farm Fresh', 60, '🥛', 'essentials', 'mandi', 'Local Dairy');

INSERT INTO public.rides (from_location, to_location, distance, price, vehicle_type, icon) VALUES
('Jandaha', 'Hajipur', '45 km', 80, 'Shared Auto', '🛺'),
('Jandaha', 'Patna', '60 km', 200, 'Shared Cab', '🚕');
