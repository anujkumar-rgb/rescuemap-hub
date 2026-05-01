-- ============================================================
--  ResqNet · Supabase Schema & Seed Data
--  Tables: teams, incidents, vehicles, alerts, field_updates,
--          supplies, volunteers, drones, risk_points
--  Run this entire file once in the Supabase SQL Editor.
-- ============================================================

-- 0. CLEAN SLATE (Drops all existing tables to prevent schema conflicts)
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.incidents CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.field_updates CASCADE;
DROP TABLE IF EXISTS public.supplies CASCADE;
DROP TABLE IF EXISTS public.volunteers CASCADE;
DROP TABLE IF EXISTS public.drones CASCADE;
DROP TABLE IF EXISTS public.risk_points CASCADE;
DROP TABLE IF EXISTS public.sos_reports CASCADE;
DROP TABLE IF EXISTS public.allowed_users CASCADE;

-- ────────────────────────────────────────────────────────────
-- 1. TEAMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    leader      TEXT NOT NULL,
    members     INTEGER DEFAULT 0,
    vehicle     TEXT,
    zone        TEXT,
    status      TEXT CHECK (status IN ('En Route', 'On Site', 'Returning', 'Standby')),
    pin_x       FLOAT NOT NULL DEFAULT 0,
    pin_y       FLOAT NOT NULL DEFAULT 0,
    color       TEXT CHECK (color IN ('red', 'blue', 'green')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_select" ON public.teams;
CREATE POLICY "teams_select" ON public.teams
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.teams (id, name, leader, members, vehicle, zone, status, pin_x, pin_y, color) VALUES
  ('T-01', 'Alpha Squad',  'Capt. R. Mehta', 8,  'Rescue Van',  'Zone A (Dharavi)',  'On Site',  22, 38, 'red'),
  ('T-02', 'Bravo Unit',   'Lt. S. Khan',    6,  'Ambulance',   'Zone B (Kurla)',    'En Route', 40, 55, 'blue'),
  ('T-03', 'Delta Force',  'Capt. A. Nair',  10, 'Fire Truck',  'Zone C (Andheri)', 'On Site',  58, 30, 'red'),
  ('T-04', 'Eagle Team',   'Lt. P. Verma',   5,  'Helicopter',  'Zone D (Thane)',    'Returning',75, 22, 'green'),
  ('T-05', 'Falcon Squad', 'Capt. M. Iyer',  7,  'Boat',        'Zone E (Borivali)', 'En Route', 30, 70, 'blue'),
  ('T-06', 'Griffin Unit', 'Lt. D. Rao',     9,  'Rescue Van',  'Zone B (Kurla)',    'Standby',  65, 65, 'green')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. INCIDENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incidents (
    id                  TEXT PRIMARY KEY,
    location            TEXT NOT NULL,
    type                TEXT NOT NULL,
    team                TEXT,
    status              TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    time_ago            TEXT,
    response_min        INTEGER,
    latitude            FLOAT,
    longitude           FLOAT,
    description         TEXT,
    optimized_distance  FLOAT,
    eta                 INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incidents_select" ON public.incidents;
CREATE POLICY "incidents_select" ON public.incidents
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.incidents
    (id, location, type, team, status, time_ago, response_min, latitude, longitude, description, optimized_distance)
VALUES
  ('INC-1043', 'Dharavi - Sector 4', 'Flood',              'Alpha Squad',  'In Progress', '12 min ago', 8,  19.0380, 72.8538, 'Heavy flooding in Sector 4. Multiple households stranded.',          0.8),
  ('INC-1042', 'Andheri West',       'Building Collapse',  'Delta Force',  'Open',        '27 min ago', 11, 19.1136, 72.8697, 'Partial collapse of a residential building. 3 people feared trapped.',4.2),
  ('INC-1041', 'Kurla East',         'Medical Emergency',  'Bravo Unit',   'In Progress', '44 min ago', 6,  19.0726, 72.8744, 'Multiple cases of waterborne diseases reported.',                    1.5),
  ('INC-1040', 'Thane Junction',     'Road Block',         'Eagle Team',   'Resolved',    '1 hr ago',   14, 19.2183, 72.9781, 'Major tree fall blocking traffic at the junction.',                  7.8),
  ('INC-1039', 'Borivali Creek',     'Flood',              'Falcon Squad', 'In Progress', '1 hr ago',   9,  19.2307, 72.8567, 'Creek water overflowing into nearby slums.',                         5.4),
  ('INC-1038', 'Andheri MIDC',       'Fire',               'Delta Force',  'Resolved',    '2 hrs ago',  7,  19.1196, 72.8897, 'Short circuit fire in a small industrial unit.',                     2.1),
  ('INC-1037', 'Kurla Depot',        'Fire',               'Griffin Unit', 'Resolved',    '3 hrs ago',  12, 19.0626, 72.8844, 'Refuse fire near the bus depot.',                                    3.9)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. VEHICLES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
    id                      TEXT PRIMARY KEY,
    type                    TEXT NOT NULL,
    driver                  TEXT,
    location                TEXT,
    fuel                    INTEGER DEFAULT 100,
    status                  TEXT CHECK (status IN ('Active', 'Idle', 'Maintenance')),
    latitude                FLOAT,
    longitude               FLOAT,
    assigned_incident_id    TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;
CREATE POLICY "vehicles_select" ON public.vehicles
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.vehicles
    (id, type, driver, location, fuel, status, latitude, longitude, assigned_incident_id)
VALUES
  ('V-201', 'Ambulance',   'R. Singh',       'Kurla East',       78, 'Active',      19.0726, 72.8744, 'INC-1041'),
  ('V-202', 'Fire Truck',  'K. Patil',       'Andheri MIDC',     42, 'Active',      19.1196, 72.8897, NULL),
  ('V-203', 'Rescue Van',  'J. Desai',       'Dharavi Sec 4',    91, 'Active',      19.0380, 72.8538, 'INC-1043'),
  ('V-204', 'Boat',        'S. Pillai',      'Borivali Creek',   55, 'Active',      19.2307, 72.8567, 'INC-1039'),
  ('V-205', 'Helicopter',  'Capt. N. Joshi', 'Thane Helipad',    23, 'Idle',        19.2183, 72.9781, NULL),
  ('V-206', 'Ambulance',   'M. Shah',        'Kurla Depot',       8, 'Maintenance', 19.0626, 72.8844, NULL)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. ALERTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
    id          TEXT PRIMARY KEY,
    severity    TEXT CHECK (severity IN ('critical', 'warning', 'info')),
    title       TEXT NOT NULL,
    description TEXT,
    location    TEXT,
    time_ago    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alerts_select" ON public.alerts;
CREATE POLICY "alerts_select" ON public.alerts
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.alerts (id, severity, title, description, location, time_ago) VALUES
  ('A-01', 'critical', 'Flash Flood Warning - Dharavi',   'Water levels rising rapidly near Sector 4. Immediate evacuation of low-lying homes required.',  'Zone A (Dharavi)', '2 min ago'),
  ('A-02', 'critical', 'Building Collapse Reported',      '3-storey residential building partially collapsed. Civilians possibly trapped under debris.',      'Andheri West',     '18 min ago'),
  ('A-03', 'warning',  'Heavy Rainfall Forecast',         'IMD predicts 200mm+ rainfall over next 6 hours across coastal zones.',                            'All Zones',        '35 min ago'),
  ('A-04', 'warning',  'Vehicle Fuel Low',                'Helicopter V-205 fuel at 23%. Refuel before next deployment.',                                    'Thane Helipad',    '52 min ago'),
  ('A-05', 'info',     'Eagle Team Returning to Base',    'Mission complete at Thane Junction. ETA to base: 22 minutes.',                                    'Zone D (Thane)',   '1 hr ago'),
  ('A-06', 'critical', 'Fire Outbreak - Industrial Area', 'Chemical fire reported at MIDC complex. Hazmat protocol activated.',                               'Andheri MIDC',     '1 hr ago')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 5. FIELD UPDATES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.field_updates (
    id          TEXT PRIMARY KEY,
    time        TEXT NOT NULL,
    unit        TEXT,
    message     TEXT NOT NULL,
    kind        TEXT CHECK (kind IN ('urgent', 'update', 'success')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.field_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "field_updates_select" ON public.field_updates;
CREATE POLICY "field_updates_select" ON public.field_updates
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.field_updates (id, time, unit, message, kind) VALUES
  ('F-06', '14:32', 'Bravo Unit',   'Road blocked on SV Road, taking alternate via LBS Marg',              'update'),
  ('F-05', '14:28', 'Delta Force',  'Reached Zone C, 14 survivors found',                                  'success'),
  ('F-04', '14:21', 'Eagle Team',   'Medical supplies running low, requesting refill',                      'urgent'),
  ('F-03', '14:15', 'Alpha Squad',  'Evacuation underway in Dharavi Sector 4, 32 civilians moved',          'update'),
  ('F-02', '14:08', 'Falcon Squad', 'Boat deployed at Borivali Creek, two children rescued',                'success'),
  ('F-01', '13:55', 'Griffin Unit', 'Fuel critical on V-206, returning to depot immediately',               'urgent')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. SUPPLIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplies (
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    zone        TEXT NOT NULL UNIQUE,
    food        INTEGER DEFAULT 0,
    water       INTEGER DEFAULT 0,
    medical     INTEGER DEFAULT 0,
    blankets    INTEGER DEFAULT 0,
    status      TEXT CHECK (status IN ('Sufficient', 'Low', 'Critical')),
    coverage    INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supplies_select" ON public.supplies;
CREATE POLICY "supplies_select" ON public.supplies
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.supplies (zone, food, water, medical, blankets, status, coverage) VALUES
  ('Zone A (Dharavi)',  1200, 3400, 85,  540, 'Low',       58),
  ('Zone B (Kurla)',    2200, 5100, 140, 820, 'Sufficient', 86),
  ('Zone C (Andheri)',  480,  1100, 32,  210, 'Critical',   24),
  ('Zone D (Thane)',    1900, 4600, 110, 700, 'Sufficient', 78),
  ('Zone E (Borivali)', 980,  2700, 64,  410, 'Low',        49)
ON CONFLICT (zone) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 7. VOLUNTEERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.volunteers (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    phone           TEXT,
    city            TEXT,
    skills          TEXT[],          -- stored as a Postgres array of strings
    availability    TEXT,
    status          TEXT CHECK (status IN ('Available', 'Assigned', 'Off Duty')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "volunteers_select" ON public.volunteers;
CREATE POLICY "volunteers_select" ON public.volunteers
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.volunteers (id, name, phone, city, skills, availability, status) VALUES
  ('V-001', 'Priya Sharma',    '9876543210', 'Mumbai',     ARRAY['First Aid', 'Medical'],           'Immediate',    'Available'),
  ('V-002', 'Rahul Deshmukh', '9123456789', 'Pune',       ARRAY['Driving', 'Search & Rescue'],    'Within 24hrs', 'Assigned'),
  ('V-003', 'Anita Kumar',    '9898989898', 'Thane',      ARRAY['Swimming', 'First Aid'],          'Immediate',    'Available'),
  ('V-004', 'Vikram Singh',   '9777777777', 'Navi Mumbai',ARRAY['Construction', 'Driving'],        'Weekend only', 'Off Duty'),
  ('V-005', 'Meera Patel',    '9666666666', 'Mumbai',     ARRAY['Medical'],                        'Immediate',    'Assigned')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 8. DRONES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.drones (
    id          TEXT PRIMARY KEY,
    city        TEXT NOT NULL,
    latitude    FLOAT NOT NULL,
    longitude   FLOAT NOT NULL,
    mission     TEXT,
    battery     INTEGER DEFAULT 100,
    altitude    TEXT,
    status      TEXT,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drones_select" ON public.drones;
CREATE POLICY "drones_select" ON public.drones
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.drones (id, city, latitude, longitude, mission, battery, altitude, status) VALUES
  ('Drone-1', 'Kurla (Zone B)',    19.0860, 72.8977, 'Aerial Survey',      78,  '120m', 'Active'),
  ('Drone-2', 'Powai (Zone C)',    19.1200, 72.9100, 'Search & Rescue',    45,  '150m', 'Active'),
  ('Drone-3', 'Juhu (Zone C)',     19.1000, 72.8250, 'Damage Assessment',  12,  '80m',  'Returning to base'),
  ('Drone-4', 'Goregaon (Zone E)', 19.1650, 72.8500, 'Flood Mapping',      92,  '200m', 'Active'),
  ('Drone-5', 'Malad (Zone E)',    19.1850, 72.8400, 'Traffic Survey',     100, '0m',   'Charging'),
  ('Drone-6', 'Vikhroli (Zone D)', 19.1100, 72.9300, 'Relief Drop',        65,  '100m', 'Active')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 9. RISK POINTS  (heatmap overlay)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.risk_points (
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    latitude    FLOAT NOT NULL,
    longitude   FLOAT NOT NULL,
    intensity   FLOAT DEFAULT 1.0,   -- 0.0 (low) → 1.0 (high)
    label       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "risk_points_select" ON public.risk_points;
CREATE POLICY "risk_points_select" ON public.risk_points
    FOR SELECT TO authenticated USING (true);

INSERT INTO public.risk_points (latitude, longitude, intensity, label) VALUES
  (19.0760, 72.8777, 1.0, 'Dharavi High Risk'),
  (19.1136, 72.8697, 1.0, 'Andheri West High Risk'),
  (19.0726, 72.8744, 1.0, 'Kurla East High Risk'),
  (19.2307, 72.8567, 1.0, 'Borivali Creek High Risk'),
  (19.1196, 72.8897, 0.6, 'Andheri MIDC Medium Risk'),
  (19.2183, 72.9781, 0.6, 'Thane Junction Medium Risk'),
  (19.0626, 72.8844, 0.6, 'Kurla Depot Medium Risk'),
  (19.1650, 72.8500, 0.3, 'Goregaon Low Risk'),
  (19.1000, 72.8250, 0.3, 'Juhu Low Risk'),
  (19.1100, 72.9300, 0.3, 'Vikhroli Low Risk'),
  (19.1850, 72.8400, 0.3, 'Malad Low Risk'),
  (19.1200, 72.9100, 0.3, 'Powai Low Risk')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 10. SOS REPORTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sos_reports (
    id              BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    message         TEXT NOT NULL,
    emergency_type  TEXT,
    status          TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispatched', 'Resolved')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sos_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sos_reports_insert" ON public.sos_reports;
CREATE POLICY "sos_reports_insert" ON public.sos_reports
    FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "sos_reports_select" ON public.sos_reports;
CREATE POLICY "sos_reports_select" ON public.sos_reports
    FOR SELECT TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────
-- 11. ALLOWED USERS (RBAC)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.allowed_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    role        TEXT CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allowed_users_select" ON public.allowed_users;
CREATE POLICY "allowed_users_select" ON public.allowed_users
    FOR SELECT TO authenticated USING (true);

-- Seed an admin for demo
INSERT INTO public.allowed_users (email, role) VALUES 
  ('admin@rescuemap.hub', 'admin'),
  ('operator@rescuemap.hub', 'operator')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Done! All 11 tables created and seeded.
-- ============================================================
