// database.js
// This file sets up the SQLite database connection and creates tables with sample data.
// We use 'better-sqlite3' which is a synchronous SQLite library for Node.js.

const Database = require('better-sqlite3');
const path = require('path');

// Create or open the database file in the /database folder
const DB_PATH = path.join(__dirname, 'database', 'seedshare.db');
const db = new Database(DB_PATH);

// Enable foreign key constraints (SQLite disables them by default)
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL'); // Better performance

// ─────────────────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────────────────

db.exec(`
  -- Gardeners Table: stores information about each gardener
  CREATE TABLE IF NOT EXISTS gardeners (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT    NOT NULL,
    last_name     TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    phone         TEXT,
    address       TEXT,
    city          TEXT,
    postcode      TEXT,
    experience_years INTEGER DEFAULT 0,
    membership_type  TEXT DEFAULT 'standard',  -- standard, premium, volunteer
    joined_date   TEXT    NOT NULL DEFAULT (DATE('now')),
    is_active     INTEGER NOT NULL DEFAULT 1   -- 1 = active, 0 = inactive
  );

  -- Plots Table: stores information about each garden plot
  CREATE TABLE IF NOT EXISTS plots (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    plot_name     TEXT    NOT NULL,
    soil_type     TEXT    NOT NULL,             -- Clay, Loam, Sandy, Silt, Peat, Chalk
    size_sqm      REAL    NOT NULL,
    location      TEXT,
    sunlight      TEXT,                         -- Full Sun, Partial Shade, Full Shade
    water_source  TEXT,
    monthly_rent  REAL    DEFAULT 0,
    max_gardeners INTEGER DEFAULT 1,
    notes         TEXT,
    deleted       INTEGER NOT NULL DEFAULT 0,   -- 0 = active, 1 = soft-deleted
    created_at    TEXT    NOT NULL DEFAULT (DATETIME('now'))
  );

  -- Leases Table: stores which gardener leases which plot
  CREATE TABLE IF NOT EXISTS leases (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    gardener_id   INTEGER NOT NULL REFERENCES gardeners(id) ON DELETE CASCADE,
    plot_id       INTEGER NOT NULL REFERENCES plots(id)     ON DELETE CASCADE,
    start_date    TEXT    NOT NULL,
    end_date      TEXT,
    status        TEXT    NOT NULL DEFAULT 'active',  -- active, expired, terminated
    rent_paid     REAL    DEFAULT 0,
    payment_method TEXT   DEFAULT 'cash',              -- cash, bank transfer, card
    agreement_signed INTEGER DEFAULT 0,                -- 0 = no, 1 = yes
    notes         TEXT,
    created_at    TEXT    NOT NULL DEFAULT (DATETIME('now'))
  );
`);

// ─────────────────────────────────────────────────────────
// SEED SAMPLE DATA (only if tables are empty)
// ─────────────────────────────────────────────────────────

function seedData() {
  const gardenerCount = db.prepare('SELECT COUNT(*) as count FROM gardeners').get();
  if (gardenerCount.count > 0) return; // Already seeded

  console.log('Seeding database with sample data...');

  // ── Insert 50 Gardeners ──────────────────────────────────
  const insertGardener = db.prepare(`
    INSERT INTO gardeners (first_name, last_name, email, phone, address, city, postcode, experience_years, membership_type, joined_date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const gardeners = [
    ['Alice',   'Green',    'alice.green@email.com',    '07700900001', '12 Rose Lane',       'London',     'SW1A 1AA', 5,  'premium',   '2019-03-10', 1],
    ['Bob',     'Brown',    'bob.brown@email.com',      '07700900002', '34 Oak Street',      'Manchester', 'M1 1AE',   3,  'standard',  '2020-06-15', 1],
    ['Carol',   'White',    'carol.white@email.com',    '07700900003', '56 Maple Ave',       'Bristol',    'BS1 1AA',  7,  'premium',   '2018-01-20', 1],
    ['David',   'Black',    'david.black@email.com',    '07700900004', '78 Elm Road',        'Leeds',      'LS1 1AB',  2,  'standard',  '2021-09-05', 1],
    ['Eve',     'Clark',    'eve.clark@email.com',      '07700900005', '90 Pine Close',      'Birmingham', 'B1 1BB',   10, 'premium',   '2016-07-14', 1],
    ['Frank',   'Hall',     'frank.hall@email.com',     '07700900006', '11 Cedar Way',       'Liverpool',  'L1 1CC',   4,  'volunteer', '2020-02-28', 1],
    ['Grace',   'Allen',    'grace.allen@email.com',    '07700900007', '22 Birch Drive',     'Sheffield',  'S1 1DD',   1,  'standard',  '2022-11-03', 1],
    ['Harry',   'Young',    'harry.young@email.com',    '07700900008', '33 Willow Court',    'Edinburgh',  'EH1 1AE',  6,  'premium',   '2019-08-19', 1],
    ['Iris',    'King',     'iris.king@email.com',      '07700900009', '44 Ash Boulevard',   'Glasgow',    'G1 1FF',   8,  'standard',  '2018-05-22', 1],
    ['Jack',    'Wright',   'jack.wright@email.com',    '07700900010', '55 Chestnut Grove',  'Cardiff',    'CF1 1GG',  3,  'volunteer', '2021-04-07', 1],
    ['Karen',   'Scott',    'karen.scott@email.com',    '07700900011', '66 Sycamore Rd',     'London',     'SW2 2BB',  5,  'premium',   '2019-12-01', 1],
    ['Liam',    'Harris',   'liam.harris@email.com',    '07700900012', '77 Poplar Ave',      'London',     'SW3 3CC',  2,  'standard',  '2022-01-15', 1],
    ['Mia',     'Martin',   'mia.martin@email.com',     '07700900013', '88 Hawthorn Lane',   'Bristol',    'BS2 2BB',  9,  'premium',   '2017-06-30', 1],
    ['Noah',    'Lewis',    'noah.lewis@email.com',     '07700900014', '99 Hornbeam Close',  'Leeds',      'LS2 2CC',  4,  'standard',  '2020-10-11', 1],
    ['Olivia',  'Walker',   'olivia.walker@email.com',  '07700900015', '10 Magnolia Street', 'Birmingham', 'B2 2DD',   6,  'volunteer', '2019-03-25', 1],
    ['Peter',   'Robinson', 'peter.robinson@email.com', '07700900016', '21 Laburnum Way',    'Manchester', 'M2 2EE',   1,  'standard',  '2023-02-14', 1],
    ['Quinn',   'Taylor',   'quinn.taylor@email.com',   '07700900017', '32 Rowan Drive',     'Sheffield',  'S2 2FF',   7,  'premium',   '2018-09-08', 1],
    ['Rachel',  'Anderson', 'rachel.anderson@email.com','07700900018', '43 Juniper Road',    'Liverpool',  'L2 2GG',   3,  'standard',  '2021-07-22', 1],
    ['Sam',     'Thomas',   'sam.thomas@email.com',     '07700900019', '54 Cypress Avenue',  'Edinburgh',  'EH2 2HH',  5,  'premium',   '2020-04-16', 1],
    ['Tina',    'Jackson',  'tina.jackson@email.com',   '07700900020', '65 Fir Street',      'Glasgow',    'G2 2II',   8,  'volunteer', '2017-11-29', 1],
    ['Uma',     'White',    'uma.white2@email.com',     '07700900021', '76 Spruce Close',    'Cardiff',    'CF2 2JJ',  2,  'standard',  '2022-08-04', 1],
    ['Victor',  'Moore',    'victor.moore@email.com',   '07700900022', '87 Larch Boulevard', 'London',     'SW4 4DD',  10, 'premium',   '2015-03-17', 1],
    ['Wendy',   'Wilson',   'wendy.wilson@email.com',   '07700900023', '98 Beech Grove',     'Bristol',    'BS3 3CC',  4,  'standard',  '2020-12-20', 1],
    ['Xander',  'Davies',   'xander.davies@email.com',  '07700900024', '14 Holly Court',     'Leeds',      'LS3 3DD',  6,  'volunteer', '2019-05-09', 1],
    ['Yasmin',  'Evans',    'yasmin.evans@email.com',   '07700900025', '25 Acacia Road',     'Birmingham', 'B3 3EE',   1,  'standard',  '2023-06-01', 1],
    ['Zack',    'Turner',   'zack.turner@email.com',    '07700900026', '36 Mulberry Lane',   'Manchester', 'M3 3FF',   9,  'premium',   '2016-10-13', 1],
    ['Amber',   'Phillips', 'amber.phillips@email.com', '07700900027', '47 Walnut Way',      'Sheffield',  'S3 3GG',   3,  'standard',  '2021-02-27', 1],
    ['Blake',   'Campbell', 'blake.campbell@email.com', '07700900028', '58 Almond Drive',    'Liverpool',  'L3 3HH',   5,  'volunteer', '2019-09-14', 1],
    ['Chloe',   'Bell',     'chloe.bell@email.com',     '07700900029', '69 Plum Street',     'Edinburgh',  'EH3 3II',  7,  'premium',   '2018-04-02', 1],
    ['Dylan',   'Carter',   'dylan.carter@email.com',   '07700900030', '70 Peach Avenue',    'Glasgow',    'G3 3JJ',   2,  'standard',  '2022-07-18', 1],
    ['Ella',    'Mitchell', 'ella.mitchell@email.com',  '07700900031', '81 Pear Close',      'Cardiff',    'CF3 3KK',  4,  'standard',  '2020-11-05', 1],
    ['Finn',    'Morgan',   'finn.morgan@email.com',    '07700900032', '92 Cherry Grove',    'London',     'SW5 5EE',  6,  'premium',   '2019-01-30', 1],
    ['Gemma',   'James',    'gemma.james@email.com',    '07700900033', '13 Strawberry Rd',   'Bristol',    'BS4 4DD',  8,  'volunteer', '2017-08-24', 1],
    ['Hugo',    'Lee',      'hugo.lee@email.com',       '07700900034', '24 Raspberry Lane',  'Leeds',      'LS4 4EE',  1,  'standard',  '2023-03-12', 1],
    ['Isla',    'Watson',   'isla.watson@email.com',    '07700900035', '35 Blackberry Way',  'Birmingham', 'B4 4FF',   5,  'premium',   '2019-07-07', 1],
    ['Jake',    'Shaw',     'jake.shaw@email.com',      '07700900036', '46 Blueberry Drive', 'Manchester', 'M4 4GG',   3,  'standard',  '2021-01-23', 1],
    ['Kate',    'Ward',     'kate.ward@email.com',      '07700900037', '57 Gooseberry St',   'Sheffield',  'S4 4HH',   7,  'volunteer', '2018-06-16', 1],
    ['Leo',     'Bennett',  'leo.bennett@email.com',    '07700900038', '68 Cranberry Ave',   'Liverpool',  'L4 4II',   9,  'premium',   '2016-12-28', 1],
    ['Maya',    'Hunt',     'maya.hunt@email.com',      '07700900039', '79 Elderberry Cl',   'Edinburgh',  'EH4 4JJ',  2,  'standard',  '2022-05-01', 1],
    ['Nate',    'Price',    'nate.price@email.com',     '07700900040', '80 Boysenberry Rd',  'Glasgow',    'G4 4KK',   4,  'standard',  '2020-09-19', 1],
    ['Orla',    'Hughes',   'orla.hughes@email.com',    '07700900041', '91 Cloudberry Gr',   'Cardiff',    'CF4 4LL',  6,  'premium',   '2018-02-11', 1],
    ['Paul',    'Fox',      'paul.fox@email.com',       '07700900042', '17 Huckleberry Rd',  'London',     'SW6 6FF',  1,  'standard',  '2023-08-29', 1],
    ['Rosa',    'McDonald', 'rosa.mcdonald@email.com',  '07700900043', '28 Lingonberry Ln',  'Bristol',    'BS5 5EE',  8,  'volunteer', '2017-04-20', 1],
    ['Steve',   'Gray',     'steve.gray@email.com',     '07700900044', '39 Loganberry Way',  'Leeds',      'LS5 5FF',  3,  'premium',   '2020-08-06', 1],
    ['Trudy',   'Wells',    'trudy.wells@email.com',    '07700900045', '50 Marionberry Dr',  'Birmingham', 'B5 5GG',   5,  'standard',  '2019-11-13', 1],
    ['Ulric',   'Oliver',   'ulric.oliver@email.com',   '07700900046', '61 Tayberry Close',  'Manchester', 'M5 5HH',   7,  'premium',   '2018-07-25', 1],
    ['Vera',    'Stone',    'vera.stone@email.com',     '07700900047', '72 Youngberry St',   'Sheffield',  'S5 5II',   2,  'standard',  '2022-04-08', 1],
    ['Will',    'Newton',   'will.newton@email.com',    '07700900048', '83 Olallieberry Gr', 'Liverpool',  'L5 5JJ',   4,  'volunteer', '2021-06-21', 1],
    ['Xena',    'Owen',     'xena.owen@email.com',      '07700900049', '94 Serviceberry Rd', 'Edinburgh',  'EH5 5KK',  6,  'premium',   '2019-02-04', 1],
    ['Yusuf',   'Blake',    'yusuf.blake@email.com',    '07700900050', '15 Bilberry Lane',   'Glasgow',    'G5 5LL',   10, 'standard',  '2015-10-17', 1],
  ];

  const insertManyGardeners = db.transaction((rows) => {
    for (const row of rows) insertGardener.run(...row);
  });
  insertManyGardeners(gardeners);

  // ── Insert 50 Plots ──────────────────────────────────────
  const insertPlot = db.prepare(`
    INSERT INTO plots (plot_name, soil_type, size_sqm, location, sunlight, water_source, monthly_rent, max_gardeners, notes, deleted, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, DATETIME('now'))
  `);

  const plots = [
    ['Plot A1',  'Clay',   20.0, 'North Section',  'Full Sun',      'Tap',      15.00, 1, 'Near entrance gate'],
    ['Plot A2',  'Loam',   25.0, 'North Section',  'Full Sun',      'Tap',      18.00, 2, 'Best soil in north'],
    ['Plot A3',  'Sandy',  18.0, 'North Section',  'Partial Shade', 'Rainwater',12.00, 1, 'Dry conditions'],
    ['Plot A4',  'Silt',   22.0, 'North Section',  'Full Sun',      'Tap',      16.00, 1, 'Rich silt deposit'],
    ['Plot A5',  'Peat',   30.0, 'North Section',  'Partial Shade', 'Tap',      20.00, 2, 'Good for acid plants'],
    ['Plot B1',  'Chalk',  15.0, 'South Section',  'Full Sun',      'Tap',      10.00, 1, 'Alkaline soil'],
    ['Plot B2',  'Clay',   28.0, 'South Section',  'Full Sun',      'Tap',      17.00, 2, 'Heavy clay'],
    ['Plot B3',  'Loam',   35.0, 'South Section',  'Full Shade',   'Rainwater',22.00, 2, 'Large productive plot'],
    ['Plot B4',  'Sandy',  20.0, 'South Section',  'Full Sun',      'Tap',      14.00, 1, 'Well-drained'],
    ['Plot B5',  'Silt',   24.0, 'South Section',  'Partial Shade', 'Tap',      16.00, 1, 'Good moisture retention'],
    ['Plot C1',  'Peat',   18.0, 'East Section',   'Partial Shade', 'Rainwater',13.00, 1, 'Boggy in winter'],
    ['Plot C2',  'Chalk',  22.0, 'East Section',   'Full Sun',      'Tap',      15.00, 1, 'Free-draining chalk'],
    ['Plot C3',  'Clay',   30.0, 'East Section',   'Full Sun',      'Tap',      19.00, 2, 'Clay benefits from lime'],
    ['Plot C4',  'Loam',   40.0, 'East Section',   'Full Sun',      'Tap',      25.00, 3, 'Premium large plot'],
    ['Plot C5',  'Sandy',  16.0, 'East Section',   'Full Shade',   'Rainwater',11.00, 1, 'Coarse sandy soil'],
    ['Plot D1',  'Silt',   26.0, 'West Section',   'Full Sun',      'Tap',      17.00, 2, 'Flood plain silt'],
    ['Plot D2',  'Peat',   20.0, 'West Section',   'Partial Shade', 'Tap',      14.00, 1, 'High organic matter'],
    ['Plot D3',  'Chalk',  18.0, 'West Section',   'Full Sun',      'Rainwater',12.00, 1, 'Needs acidic mulch'],
    ['Plot D4',  'Clay',   22.0, 'West Section',   'Partial Shade', 'Tap',      15.00, 1, 'Compact in dry season'],
    ['Plot D5',  'Loam',   28.0, 'West Section',   'Full Sun',      'Tap',      20.00, 2, 'Mixed loam quality'],
    ['Plot E1',  'Sandy',  32.0, 'Central Area',   'Full Sun',      'Tap',      21.00, 2, 'Community favourite'],
    ['Plot E2',  'Silt',   19.0, 'Central Area',   'Full Sun',      'Tap',      14.00, 1, 'Near water butt'],
    ['Plot E3',  'Peat',   25.0, 'Central Area',   'Partial Shade', 'Rainwater',17.00, 2, 'Peat blend soil'],
    ['Plot E4',  'Chalk',  21.0, 'Central Area',   'Full Shade',   'Tap',      14.00, 1, 'Shaded chalk area'],
    ['Plot E5',  'Clay',   27.0, 'Central Area',   'Full Sun',      'Tap',      18.00, 2, 'South-facing clay'],
    ['Plot F1',  'Loam',   33.0, 'Greenhouse Zone','Full Sun',      'Tap',      23.00, 2, 'Adjacent to greenhouse'],
    ['Plot F2',  'Sandy',  17.0, 'Greenhouse Zone','Partial Shade', 'Tap',      12.00, 1, 'Warm sandy spot'],
    ['Plot F3',  'Silt',   29.0, 'Greenhouse Zone','Full Sun',      'Tap',      20.00, 2, 'Fertile silt mix'],
    ['Plot F4',  'Peat',   23.0, 'Greenhouse Zone','Partial Shade', 'Rainwater',16.00, 1, 'Peat-rich corner'],
    ['Plot F5',  'Chalk',  19.0, 'Greenhouse Zone','Full Sun',      'Tap',      13.00, 1, 'Chalk with grit'],
    ['Plot G1',  'Clay',   36.0, 'Orchard Edge',   'Full Sun',      'Tap',      24.00, 3, 'Under apple trees'],
    ['Plot G2',  'Loam',   22.0, 'Orchard Edge',   'Partial Shade', 'Tap',      16.00, 1, 'Dappled shade'],
    ['Plot G3',  'Sandy',  20.0, 'Orchard Edge',   'Full Shade',   'Rainwater',13.00, 1, 'Sandy under pear'],
    ['Plot G4',  'Silt',   31.0, 'Orchard Edge',   'Full Sun',      'Tap',      21.00, 2, 'Orchard silt edge'],
    ['Plot G5',  'Peat',   27.0, 'Orchard Edge',   'Partial Shade', 'Tap',      18.00, 2, 'Rich peat layer'],
    ['Plot H1',  'Chalk',  14.0, 'Herb Garden',    'Full Sun',      'Tap',       9.00, 1, 'Ideal for lavender'],
    ['Plot H2',  'Clay',   18.0, 'Herb Garden',    'Full Sun',      'Tap',      13.00, 1, 'Compact clay herb'],
    ['Plot H3',  'Loam',   24.0, 'Herb Garden',    'Partial Shade', 'Rainwater',17.00, 1, 'Mint and thyme zone'],
    ['Plot H4',  'Sandy',  21.0, 'Herb Garden',    'Full Sun',      'Tap',      15.00, 1, 'Rosemary loves this'],
    ['Plot H5',  'Silt',   16.0, 'Herb Garden',    'Full Sun',      'Tap',      11.00, 1, 'Fine silt herb bed'],
    ['Plot I1',  'Peat',   38.0, 'Meadow Border',  'Full Sun',      'Tap',      25.00, 3, 'Wildflower potential'],
    ['Plot I2',  'Chalk',  25.0, 'Meadow Border',  'Full Sun',      'Rainwater',16.00, 2, 'Orchid habitat soil'],
    ['Plot I3',  'Clay',   29.0, 'Meadow Border',  'Partial Shade', 'Tap',      19.00, 2, 'Meadow clay corner'],
    ['Plot I4',  'Loam',   34.0, 'Meadow Border',  'Full Sun',      'Tap',      22.00, 2, 'Productive loam strip'],
    ['Plot I5',  'Sandy',  22.0, 'Meadow Border',  'Partial Shade', 'Rainwater',14.00, 1, 'Sandy meadow edge'],
    ['Plot J1',  'Silt',   28.0, 'Pond Side',      'Partial Shade', 'Natural',  18.00, 2, 'Natural water access'],
    ['Plot J2',  'Peat',   32.0, 'Pond Side',      'Full Shade',   'Natural',  20.00, 2, 'Moist peat by pond'],
    ['Plot J3',  'Chalk',  17.0, 'Pond Side',      'Partial Shade', 'Natural',  12.00, 1, 'Chalk bank pond side'],
    ['Plot J4',  'Clay',   26.0, 'Pond Side',      'Full Sun',      'Natural',  17.00, 2, 'Clay near water'],
    ['Plot J5',  'Loam',   30.0, 'Pond Side',      'Full Sun',      'Natural',  21.00, 2, 'Best pond-side plot'],
  ];

  const insertManyPlots = db.transaction((rows) => {
    for (const row of rows) insertPlot.run(...row);
  });
  insertManyPlots(plots);

  // ── Insert 50 Leases ──────────────────────────────────────
  const insertLease = db.prepare(`
    INSERT INTO leases (gardener_id, plot_id, start_date, end_date, status, rent_paid, payment_method, agreement_signed, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const leases = [
    [1,  1,  '2024-01-01', '2024-12-31', 'active',     180.00, 'bank transfer', 1, 'Annual lease'],
    [2,  2,  '2024-02-01', '2024-07-31', 'expired',    108.00, 'cash',          1, 'Short-term lease'],
    [3,  3,  '2024-01-15', '2025-01-14', 'active',     144.00, 'card',          1, '12 month lease'],
    [4,  4,  '2024-03-01', '2024-08-31', 'active',      96.00, 'cash',          1, 'Trial lease'],
    [5,  5,  '2024-01-01', '2024-12-31', 'active',     240.00, 'bank transfer', 1, 'Annual premium plot'],
    [6,  6,  '2024-04-01', '2024-09-30', 'active',      60.00, 'cash',          1, '6 month lease'],
    [7,  7,  '2024-01-01', '2024-12-31', 'active',     204.00, 'bank transfer', 1, 'Full year lease'],
    [8,  8,  '2023-10-01', '2024-09-30', 'active',     264.00, 'card',          1, 'Rolling annual lease'],
    [9,  9,  '2024-05-01', '2024-10-31', 'active',      84.00, 'cash',          1, 'Summer lease'],
    [10, 10, '2024-01-01', '2024-12-31', 'active',     192.00, 'bank transfer', 1, 'Standard annual lease'],
    [11, 11, '2024-02-15', '2024-08-14', 'active',      78.00, 'cash',          1, 'Trial period'],
    [12, 12, '2024-01-01', '2024-12-31', 'active',     180.00, 'card',          1, 'Year lease'],
    [13, 13, '2023-06-01', '2024-05-31', 'expired',    264.00, 'bank transfer', 1, 'Previous year lease'],
    [14, 14, '2024-03-01', '2025-02-28', 'active',     240.00, 'cash',          1, '12 months from March'],
    [15, 15, '2024-01-01', '2024-06-30', 'expired',    102.00, 'card',          1, 'Half year'],
    [16, 16, '2024-07-01', '2025-06-30', 'active',     168.00, 'bank transfer', 1, 'Summer start annual'],
    [17, 17, '2024-01-01', '2024-12-31', 'active',     216.00, 'cash',          1, 'Full year'],
    [18, 18, '2024-04-15', '2024-10-14', 'active',      93.00, 'card',          1, '6 months spring'],
    [19, 19, '2024-01-01', '2024-12-31', 'active',     204.00, 'bank transfer', 1, 'Annual lease'],
    [20, 20, '2024-02-01', '2024-07-31', 'active',     120.00, 'cash',          1, 'Trial 6 months'],
    [21, 21, '2024-01-01', '2024-12-31', 'active',     252.00, 'card',          1, 'Full year central plot'],
    [22, 22, '2024-05-01', '2024-10-31', 'active',      84.00, 'bank transfer', 1, 'Growing season'],
    [23, 23, '2024-01-01', '2024-12-31', 'active',     204.00, 'cash',          1, 'Standard year'],
    [24, 24, '2024-03-15', '2024-09-14', 'active',      84.00, 'card',          1, 'Spring to autumn'],
    [25, 25, '2024-01-01', '2024-12-31', 'active',     216.00, 'bank transfer', 1, 'Annual clay plot'],
    [26, 26, '2024-01-01', '2024-12-31', 'active',     276.00, 'cash',          1, 'Premium greenhouse plot'],
    [27, 27, '2024-04-01', '2024-09-30', 'active',      72.00, 'card',          1, 'Sandy warm spot'],
    [28, 28, '2024-01-01', '2024-12-31', 'active',     240.00, 'bank transfer', 1, 'Silt plot full year'],
    [29, 29, '2024-06-01', '2024-11-30', 'active',      96.00, 'cash',          1, 'Summer peat corner'],
    [30, 30, '2024-01-01', '2024-12-31', 'active',     156.00, 'card',          1, 'Chalk full year'],
    [31, 31, '2024-01-01', '2024-12-31', 'active',     288.00, 'bank transfer', 1, 'Large orchard clay'],
    [32, 32, '2024-02-01', '2024-07-31', 'expired',     96.00, 'cash',          1, 'Short loam lease'],
    [33, 33, '2024-01-01', '2024-12-31', 'active',     156.00, 'card',          1, 'Sandy orchard edge'],
    [34, 34, '2024-04-01', '2025-03-31', 'active',     252.00, 'bank transfer', 1, 'Orchard silt 12m'],
    [35, 35, '2024-01-01', '2024-12-31', 'active',     216.00, 'cash',          1, 'Peat orchard edge'],
    [36, 36, '2024-05-15', '2024-11-14', 'active',      54.00, 'card',          1, 'Herb chalk plot'],
    [37, 37, '2024-01-01', '2024-12-31', 'active',     156.00, 'bank transfer', 1, 'Herb clay full year'],
    [38, 38, '2024-03-01', '2024-08-31', 'active',     102.00, 'cash',          1, 'Herb loam 6 months'],
    [39, 39, '2024-01-01', '2024-12-31', 'active',     180.00, 'card',          1, 'Sandy herb patch'],
    [40, 40, '2024-07-01', '2024-12-31', 'active',      66.00, 'bank transfer', 1, 'Second half year'],
    [41, 41, '2024-01-01', '2024-12-31', 'active',     300.00, 'cash',          1, 'Large meadow peat'],
    [42, 42, '2024-02-01', '2024-07-31', 'expired',     96.00, 'card',          1, 'Short chalk meadow'],
    [43, 43, '2024-01-01', '2024-12-31', 'active',     228.00, 'bank transfer', 1, 'Meadow clay 12m'],
    [44, 44, '2024-05-01', '2025-04-30', 'active',     264.00, 'cash',          1, 'Productive loam strip'],
    [45, 45, '2024-01-01', '2024-12-31', 'active',     168.00, 'card',          1, 'Sandy meadow edge'],
    [46, 46, '2024-01-01', '2024-12-31', 'active',     216.00, 'bank transfer', 1, 'Pond silt natural water'],
    [47, 47, '2024-04-01', '2024-09-30', 'active',     120.00, 'cash',          1, 'Peat pond summer'],
    [48, 48, '2024-01-01', '2024-12-31', 'active',     144.00, 'card',          1, 'Chalk pond bank'],
    [49, 49, '2024-03-01', '2025-02-28', 'active',     204.00, 'bank transfer', 1, 'Clay near water annual'],
    [50, 50, '2024-01-01', '2024-12-31', 'active',     252.00, 'cash',          1, 'Best pond-side plot'],
  ];

  const insertManyLeases = db.transaction((rows) => {
    for (const row of rows) insertLease.run(...row);
  });
  insertManyLeases(leases);

  console.log('Sample data seeded successfully!');
  console.log('  → 50 gardeners inserted');
  console.log('  → 50 plots inserted');
  console.log('  → 50 leases inserted');
}

// Run seeding
seedData();

// Export the database connection so other files can use it
module.exports = db;
