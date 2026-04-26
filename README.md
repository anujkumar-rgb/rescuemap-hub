# RescueTrack - Disaster Management System

## PWA Features
- Offline Support: Critical pages (Dashboard, Teams, Alerts) are cached.
- Offline Sync: Status updates are queued locally when offline and auto-sync when connection returns.
- Installation: Install as a native app on mobile/desktop.

## Authentication Whitelist Setup
To restrict access to the RescueTrack system, follow these steps:

1. **Database Setup**:
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   CREATE TABLE allowed_users (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     email text UNIQUE NOT NULL,
     full_name text,
     role text DEFAULT 'operator',
     is_active boolean DEFAULT true,
     created_at timestamp DEFAULT now()
   );

   -- Add your authorized team emails here
   INSERT INTO allowed_users (email, full_name, role) VALUES
   ('anujkumarjha@gmaill.com', 'Anuj Kumar Jha', 'admin'),
   ('operator1@rescuetrack.com', 'Operator One', 'operator'),
   ('operator2@rescuetrack.com', 'Operator Two', 'operator');

   ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Only allowed users can read"
   ON allowed_users FOR SELECT
   USING (auth.email() = email);
   ```

2. **Supabase Auth Configuration**:
   Go to **Supabase Dashboard** → **Authentication** → **Users** → **Add User** and create accounts for the emails inserted above.

3. **Environment Variables**:
   Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env` file.
