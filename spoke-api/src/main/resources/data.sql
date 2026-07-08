-- ============================================================
-- Spoke seed data — loaded automatically on startup (dev profile).
-- Matches the real schema: users / ride / ride_participants.
-- Password hash below is bcrypt for the literal "password",
-- so any seeded rider can log in with the password: password
-- ============================================================

-- ---------- 25 riders (users) ----------
INSERT INTO users (id, name, email, password) VALUES
  (1,  'Aoife Byrne',       'aoife.byrne@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (2,  'Cian Murphy',       'cian.murphy@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (3,  'Saoirse Kelly',     'saoirse.kelly@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (4,  'Liam OBrien',       'liam.obrien@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (5,  'Niamh Walsh',       'niamh.walsh@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (6,  'Conor Ryan',        'conor.ryan@example.com',        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (7,  'Ciara Doyle',       'ciara.doyle@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (8,  'Sean McCarthy',     'sean.mccarthy@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (9,  'Emma Gallagher',    'emma.gallagher@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (10, 'Darragh Nolan',     'darragh.nolan@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (11, 'Roisin Fitzgerald', 'roisin.fitzgerald@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (12, 'Eoin Kennedy',      'eoin.kennedy@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (13, 'Orla Lynch',        'orla.lynch@example.com',        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (14, 'Padraig Murray',    'padraig.murray@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (15, 'Aisling Quinn',     'aisling.quinn@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (16, 'Fionn Brennan',     'fionn.brennan@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (17, 'Sinead Healy',      'sinead.healy@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (18, 'Cormac Duffy',      'cormac.duffy@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (19, 'Grainne Moore',     'grainne.moore@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (20, 'Ronan Sweeney',     'ronan.sweeney@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (21, 'Maeve Flynn',       'maeve.flynn@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (22, 'Diarmuid Casey',    'diarmuid.casey@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (23, 'Clodagh Barry',     'clodagh.barry@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (24, 'Oisin Hughes',      'oisin.hughes@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  (25, 'Fiadh Dunne',       'fiadh.dunne@example.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- ---------- 5 rides (creator_id references a rider above) ----------
INSERT INTO ride
  (id, start_point, destination, date_time, ride_type, pace, creator_id,
   origin_lat, origin_lon, destination_lat, destination_lon) VALUES
  (1, 'Phoenix Park, Dublin', 'Howth Summit, Dublin', '2026-07-12 09:00:00', 'Road',   'Intermediate', 1,
     53.3559, -6.3298, 53.3745, -6.0620),
  (2, 'Cork City',            'Kinsale, Cork',         '2026-07-15 10:30:00', 'Gravel', 'Beginner',     6,
     51.8985, -8.4756, 51.7075, -8.5220),
  (3, 'Galway City',          'Clifden, Galway',       '2026-07-18 08:00:00', 'Road',   'Advanced',     12,
     53.2707, -9.0568, 53.4886, -10.0198),
  (4, 'Bray, Wicklow',        'Glendalough, Wicklow',  '2026-07-20 09:30:00', 'MTB',    'Intermediate', 16,
     53.2028, -6.0983, 53.0119, -6.3269),
  (5, 'Limerick City',        'Adare, Limerick',       '2026-07-22 17:30:00', 'City',   'Beginner',     23,
     52.6638, -8.6267, 52.5640, -8.7890);

-- ---------- ride_participants (3–7 per ride, creator included) ----------
-- Ride 1: 5 | Ride 2: 6 | Ride 3: 4 | Ride 4: 7 | Ride 5: 3  = 25 total
INSERT INTO ride_participants (ride_id, user_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11),
  (3, 12), (3, 13), (3, 14), (3, 15),
  (4, 16), (4, 17), (4, 18), (4, 19), (4, 20), (4, 21), (4, 22),
  (5, 23), (5, 24), (5, 25);

-- ---------- Keep identity counters ahead of the seeded IDs ----------
-- So the next ride/user created through the app doesn't collide with these.
ALTER TABLE users ALTER COLUMN id RESTART WITH 26;
ALTER TABLE ride  ALTER COLUMN id RESTART WITH 6;
