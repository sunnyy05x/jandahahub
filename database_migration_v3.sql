-- JandahaHub Database Migration V3 — Bidding & Product CRUD
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. Create ride_bids table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ride_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.ride_bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  driver_name TEXT NOT NULL,
  vehicle_name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  bid_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ride_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ride bids are viewable by all." ON public.ride_bids FOR SELECT USING (true);
CREATE POLICY "Ride bids are insertable by all." ON public.ride_bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Ride bids are updatable by all." ON public.ride_bids FOR UPDATE USING (true);

-- ============================================================
-- 2. Enable Realtime for ride_bids
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_bids;

-- ============================================================
-- 3. Update ride_bookings status constraint (Adding 'searching')
-- ============================================================
-- We drop the old constraint and add a new one so 'searching' is allowed
ALTER TABLE public.ride_bookings DROP CONSTRAINT IF EXISTS ride_bookings_status_check;
ALTER TABLE public.ride_bookings ADD CONSTRAINT ride_bookings_status_check 
  CHECK (status IN ('searching', 'requested', 'accepted', 'in_progress', 'completed', 'cancelled'));

-- ============================================================
-- 4. Ensure products can be modified by Shopkeepers/Admins
-- ============================================================
-- Previously, we only added a SELECT policy for products.
DROP POLICY IF EXISTS "Products insertable by all" ON public.products;
DROP POLICY IF EXISTS "Products updatable by all" ON public.products;
DROP POLICY IF EXISTS "Products deletable by all" ON public.products;

CREATE POLICY "Products insertable by all" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products updatable by all" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products deletable by all" ON public.products FOR DELETE USING (true);

-- (In a true production app, we would restrict INSERT/UPDATE/DELETE to WHERE auth.uid() = owner_id or role = 'admin'. 
-- For MVP testing ease, we leave it open to true).
