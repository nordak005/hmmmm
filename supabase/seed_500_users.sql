-- TrustFlow 500 Mock Users Seeder
-- Copy and paste this script into your Supabase SQL Editor to instantly populate your database with 500 users.

DO $$
DECLARE
  new_user_id UUID;
  i INT;
  platforms_array TEXT[] := ARRAY['Uber', 'Upwork', 'Swiggy', 'Zomato', 'Fiverr', 'Zepto', 'Blinkit'];
  p_name TEXT;
  random_score INT;
BEGIN
  FOR i IN 1..500 LOOP
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Insert dummy auth.users (Bypass auth restrictions as postgres admin)
    -- This ensures we satisfy the foreign key constraints 
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'trustflow_mock_' || i || '@example.com', 'fake_password_hash', now(), now(), now());

    -- Generate a random trust score between 400 and 900
    random_score := floor(random() * 500 + 400);

    -- Insert into trust_scores
    INSERT INTO trust_scores (user_id, score, platforms_connected, created_at)
    VALUES (new_user_id, random_score, floor(random() * 3 + 1), now() - (random() * interval '30 days'));
    
    -- Insert a connected platform randomly for this user
    p_name := platforms_array[floor(random() * 7 + 1)];
    INSERT INTO connected_platforms (user_id, platform_name, earnings, status, created_at)
    VALUES (new_user_id, p_name, floor(random() * 20000 + 1000), 'synced', now());

    -- Insert a mock active micro loan if score is high enough (arbitrary 30% chance)
    IF random_score > 600 AND random() > 0.7 THEN
      INSERT INTO micro_loans (user_id, amount, fee, total_repayment, daily_deduction, trust_score, status, created_at)
      VALUES (
        new_user_id, 
        2000, 
        100, 
        2100, 
        150, 
        random_score, 
        'approved', 
        now() - (random() * interval '5 days')
      );
    END IF;

  END LOOP;
END $$;
