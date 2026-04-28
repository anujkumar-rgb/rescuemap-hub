# RescueTrack - Disaster Management System

## PWA Features
- Offline Support: Critical pages (Dashboard, Teams, Alerts) are cached.
- Offline Sync: Status updates are queued locally when offline and auto-sync when connection returns.
- Installation: Install as a native app on mobile/desktop.

## Authentication Whitelist Setup
To restrict access to the RescueTrack system, follow these steps:

1. **Database Setup**:
   - Run the full database schema located in `supabase_schema.sql` using your **Supabase SQL Editor**. 
   - This script initializes all tables (Incidents, Teams, Vehicles, Drones, Risk Points, etc.) and sets up the required RLS policies.
   - Make sure to add your authorized emails to the `allowed_users` table during the initial setup.

2. **Supabase Auth Configuration**:
   Go to **Supabase Dashboard** → **Authentication** → **Users** → **Add User** and create accounts for the emails inserted above.

3. **Environment Variables**:
   Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env` file.
